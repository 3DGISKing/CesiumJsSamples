const {
    AttributeCompression,
    BoundingSphere,
    Cartesian3,
    CesiumTerrainProvider,
    Credit,
    defaultValue,
    defer,
    defined,
    DeveloperError,
    Event,
    GeographicTilingScheme,
    WebMercatorTilingScheme,
    getJsonFromTypedArray,
    HeightmapTerrainData,

    IndexDatatype,
    OrientedBoundingBox,
    QuantizedMeshTerrainData,
    Request,
    RequestType,
    Resource,
    RuntimeError,
    TerrainProvider,
    TileAvailability,
    TileProviderError
} = window.Cesium;

class CustomCesiumTerrainProvider extends CesiumTerrainProvider {
    constructor(options) {
        super(options);
    }

    setFloor(positions, height) {
        this._floorHeight = height;
        this._floorBoundingRect = Cesium.Rectangle.fromCartesianArray(positions);

        const coordinates = [];

        for (let i = 0; i < positions.length; i++) {
            const carto = Cesium.Cartographic.fromCartesian(positions[i]);

            const longitude = Cesium.Math.toDegrees(carto.longitude);
            const latitude = Cesium.Math.toDegrees(carto.latitude);

            coordinates.push([longitude, latitude]);
        }

        coordinates.push(coordinates[0]);

        this._floorPolygon = turf.polygon([coordinates]);
    }

    requestTileGeometry(x, y, level, request) {
        //>>includeStart('debug', pragmas.debug)
        if (!this._ready) {
            throw new DeveloperError("requestTileGeometry must not be called before the terrain provider is ready.");
        }
        //>>includeEnd('debug');

        const layers = this._layers;
        let layerToUse;
        const layerCount = layers.length;

        if (layerCount === 1) {
            // Optimized path for single layers
            layerToUse = layers[0];
        } else {
            for (let i = 0; i < layerCount; ++i) {
                const layer = layers[i];
                if (!defined(layer.availability) || layer.availability.isTileAvailable(level, x, y)) {
                    layerToUse = layer;
                    break;
                }
            }
        }

        return requestTileGeometry(this, x, y, level, layerToUse, request);
    }
}

const QuantizedMeshExtensionIds = {
    /**
     * Oct-Encoded Per-Vertex Normals are included as an extension to the tile mesh
     *
     * @type {Number}
     * @constant
     * @default 1
     */
    OCT_VERTEX_NORMALS: 1,
    /**
     * A watermask is included as an extension to the tile mesh
     *
     * @type {Number}
     * @constant
     * @default 2
     */
    WATER_MASK: 2,
    /**
     * A json object contain metadata about the tile
     *
     * @type {Number}
     * @constant
     * @default 4
     */
    METADATA: 4
};

function getRequestHeader(extensionsList) {
    if (!defined(extensionsList) || extensionsList.length === 0) {
        return {
            Accept: "application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01"
        };
    }
    const extensions = extensionsList.join("-");
    return {
        Accept: `application/vnd.quantized-mesh;extensions=${extensions},application/octet-stream;q=0.9,*/*;q=0.01`
    };
}

function createQuantizedMeshTerrainData(provider, buffer, level, x, y, layer) {
    const littleEndianExtensionSize = layer.littleEndianExtensionSize;
    let pos = 0;
    const cartesian3Elements = 3;
    const boundingSphereElements = cartesian3Elements + 1;
    const cartesian3Length = Float64Array.BYTES_PER_ELEMENT * cartesian3Elements;
    const boundingSphereLength = Float64Array.BYTES_PER_ELEMENT * boundingSphereElements;
    const encodedVertexElements = 3;
    const encodedVertexLength = Uint16Array.BYTES_PER_ELEMENT * encodedVertexElements;
    const triangleElements = 3;
    let bytesPerIndex = Uint16Array.BYTES_PER_ELEMENT;
    let triangleLength = bytesPerIndex * triangleElements;

    const view = new DataView(buffer);
    const center = new Cartesian3(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true));
    pos += cartesian3Length;

    // const minimumHeight = view.getFloat32(pos, true);
    let minimumHeight = view.getFloat32(pos, true);
    pos += Float32Array.BYTES_PER_ELEMENT;
    // const maximumHeight = view.getFloat32(pos, true);
    let maximumHeight = view.getFloat32(pos, true);

    pos += Float32Array.BYTES_PER_ELEMENT;

    const boundingSphere = new BoundingSphere(
        new Cartesian3(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true)),
        view.getFloat64(pos + cartesian3Length, true)
    );
    pos += boundingSphereLength;

    const horizonOcclusionPoint = new Cartesian3(view.getFloat64(pos, true), view.getFloat64(pos + 8, true), view.getFloat64(pos + 16, true));
    pos += cartesian3Length;

    const vertexCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const encodedVertexBuffer = new Uint16Array(buffer, pos, vertexCount * 3);
    pos += vertexCount * encodedVertexLength;

    if (vertexCount > 64 * 1024) {
        // More than 64k vertices, so indices are 32-bit.
        bytesPerIndex = Uint32Array.BYTES_PER_ELEMENT;
        triangleLength = bytesPerIndex * triangleElements;
    }

    // Decode the vertex buffer.
    const uBuffer = encodedVertexBuffer.subarray(0, vertexCount);
    const vBuffer = encodedVertexBuffer.subarray(vertexCount, 2 * vertexCount);
    const heightBuffer = encodedVertexBuffer.subarray(vertexCount * 2, 3 * vertexCount);

    AttributeCompression.zigZagDeltaDecode(uBuffer, vBuffer, heightBuffer);

    // skip over any additional padding that was added for 2/4 byte alignment
    if (pos % bytesPerIndex !== 0) {
        pos += bytesPerIndex - (pos % bytesPerIndex);
    }

    const triangleCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const indices = IndexDatatype.createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, triangleCount * triangleElements);
    pos += triangleCount * triangleLength;

    // High water mark decoding based on decompressIndices_ in webgl-loader's loader.js.
    // https://code.google.com/p/webgl-loader/source/browse/trunk/samples/loader.js?r=99#55
    // Copyright 2012 Google Inc., Apache 2.0 license.
    let highest = 0;
    const length = indices.length;
    for (let i = 0; i < length; ++i) {
        const code = indices[i];
        indices[i] = highest - code;
        if (code === 0) {
            ++highest;
        }
    }

    const westVertexCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const westIndices = IndexDatatype.createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, westVertexCount);
    pos += westVertexCount * bytesPerIndex;

    const southVertexCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const southIndices = IndexDatatype.createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, southVertexCount);
    pos += southVertexCount * bytesPerIndex;

    const eastVertexCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const eastIndices = IndexDatatype.createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, eastVertexCount);
    pos += eastVertexCount * bytesPerIndex;

    const northVertexCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const northIndices = IndexDatatype.createTypedArrayFromArrayBuffer(vertexCount, buffer, pos, northVertexCount);
    pos += northVertexCount * bytesPerIndex;

    let encodedNormalBuffer;
    let waterMaskBuffer;
    while (pos < view.byteLength) {
        const extensionId = view.getUint8(pos, true);
        pos += Uint8Array.BYTES_PER_ELEMENT;
        const extensionLength = view.getUint32(pos, littleEndianExtensionSize);
        pos += Uint32Array.BYTES_PER_ELEMENT;

        if (extensionId === QuantizedMeshExtensionIds.OCT_VERTEX_NORMALS && provider._requestVertexNormals) {
            encodedNormalBuffer = new Uint8Array(buffer, pos, vertexCount * 2);
        } else if (extensionId === QuantizedMeshExtensionIds.WATER_MASK && provider._requestWaterMask) {
            waterMaskBuffer = new Uint8Array(buffer, pos, extensionLength);
        } else if (extensionId === QuantizedMeshExtensionIds.METADATA && provider._requestMetadata) {
            const stringLength = view.getUint32(pos, true);
            if (stringLength > 0) {
                const metadata = getJsonFromTypedArray(new Uint8Array(buffer), pos + Uint32Array.BYTES_PER_ELEMENT, stringLength);
                const availableTiles = metadata.available;
                if (defined(availableTiles)) {
                    for (let offset = 0; offset < availableTiles.length; ++offset) {
                        const availableLevel = level + offset + 1;
                        const rangesAtLevel = availableTiles[offset];
                        const yTiles = provider._tilingScheme.getNumberOfYTilesAtLevel(availableLevel);

                        for (let rangeIndex = 0; rangeIndex < rangesAtLevel.length; ++rangeIndex) {
                            const range = rangesAtLevel[rangeIndex];
                            const yStart = yTiles - range.endY - 1;
                            const yEnd = yTiles - range.startY - 1;
                            provider.availability.addAvailableTileRange(availableLevel, range.startX, yStart, range.endX, yEnd);
                            layer.availability.addAvailableTileRange(availableLevel, range.startX, yStart, range.endX, yEnd);
                        }
                    }
                }
            }
            layer.availabilityTilesLoaded.addAvailableTileRange(level, x, y, x, y);
        }
        pos += extensionLength;
    }

    const skirtHeight = provider.getLevelMaximumGeometricError(level) * 5.0;

    // The skirt is not included in the OBB computation. If this ever
    // causes any rendering artifacts (cracks), they are expected to be
    // minor and in the corners of the screen. It's possible that this
    // might need to be changed - just change to `minimumHeight - skirtHeight`
    // A similar change might also be needed in `upsampleQuantizedTerrainMesh.js`.
    const rectangle = provider._tilingScheme.tileXYToRectangle(x, y, level);
    const orientedBoundingBox = OrientedBoundingBox.fromRectangle(rectangle, minimumHeight, maximumHeight, provider._tilingScheme.ellipsoid);

    if (provider._floorBoundingRect && Cesium.Rectangle.intersection(provider._floorBoundingRect, rectangle)) {
        const modified = modifyTerrain(provider, rectangle, minimumHeight, maximumHeight, vertexCount, uBuffer, vBuffer, heightBuffer);

        if (modified) {
            const floorHeight = provider._floorHeight;

            if (floorHeight < minimumHeight) {
                minimumHeight = floorHeight;
            }

            if (floorHeight > maximumHeight) {
                maximumHeight = floorHeight;
            }

            return new QuantizedMeshTerrainData({
                center: center,
                minimumHeight: minimumHeight,
                maximumHeight: maximumHeight,
                boundingSphere: boundingSphere,
                orientedBoundingBox: orientedBoundingBox,
                horizonOcclusionPoint: horizonOcclusionPoint,
                quantizedVertices: encodedVertexBuffer,
                encodedNormals: encodedNormalBuffer,
                indices: indices,
                westIndices: westIndices,
                southIndices: southIndices,
                eastIndices: eastIndices,
                northIndices: northIndices,
                westSkirtHeight: skirtHeight,
                southSkirtHeight: skirtHeight,
                eastSkirtHeight: skirtHeight,
                northSkirtHeight: skirtHeight,
                childTileMask: provider.availability.computeChildMaskForTile(level, x, y),
                waterMask: waterMaskBuffer,
                credits: provider._tileCredits
            });
        }
    }

    return new QuantizedMeshTerrainData({
        center: center,
        minimumHeight: minimumHeight,
        maximumHeight: maximumHeight,
        boundingSphere: boundingSphere,
        orientedBoundingBox: orientedBoundingBox,
        horizonOcclusionPoint: horizonOcclusionPoint,
        quantizedVertices: encodedVertexBuffer,
        encodedNormals: encodedNormalBuffer,
        indices: indices,
        westIndices: westIndices,
        southIndices: southIndices,
        eastIndices: eastIndices,
        northIndices: northIndices,
        westSkirtHeight: skirtHeight,
        southSkirtHeight: skirtHeight,
        eastSkirtHeight: skirtHeight,
        northSkirtHeight: skirtHeight,
        childTileMask: provider.availability.computeChildMaskForTile(level, x, y),
        waterMask: waterMaskBuffer,
        credits: provider._tileCredits
    });
}

function requestTileGeometry(provider, x, y, level, layerToUse, request) {
    if (!defined(layerToUse)) {
        return Promise.reject(new RuntimeError("Terrain tile doesn't exist"));
    }

    const urlTemplates = layerToUse.tileUrlTemplates;
    if (urlTemplates.length === 0) {
        return undefined;
    }

    // The TileMapService scheme counts from the bottom left
    let terrainY;
    if (!provider._scheme || provider._scheme === "tms") {
        const yTiles = provider._tilingScheme.getNumberOfYTilesAtLevel(level);
        terrainY = yTiles - y - 1;
    } else {
        terrainY = y;
    }

    const extensionList = [];
    if (provider._requestVertexNormals && layerToUse.hasVertexNormals) {
        extensionList.push(layerToUse.littleEndianExtensionSize ? "octvertexnormals" : "vertexnormals");
    }
    if (provider._requestWaterMask && layerToUse.hasWaterMask) {
        extensionList.push("watermask");
    }
    if (provider._requestMetadata && layerToUse.hasMetadata) {
        extensionList.push("metadata");
    }

    let headers;
    let query;
    const url = urlTemplates[(x + terrainY + level) % urlTemplates.length];

    const resource = layerToUse.resource;
    if (defined(resource._ionEndpoint) && !defined(resource._ionEndpoint.externalType)) {
        // ion uses query paremeters to request extensions
        if (extensionList.length !== 0) {
            query = { extensions: extensionList.join("-") };
        }
        headers = getRequestHeader(undefined);
    } else {
        //All other terrain servers
        headers = getRequestHeader(extensionList);
    }

    const promise = resource
        .getDerivedResource({
            url: url,
            templateValues: {
                version: layerToUse.version,
                z: level,
                x: x,
                y: terrainY
            },
            queryParameters: query,
            headers: headers,
            request: request
        })
        .fetchArrayBuffer();

    if (!defined(promise)) {
        return undefined;
    }

    return promise.then(function (buffer) {
        if (defined(provider._heightmapStructure)) {
            return createHeightmapTerrainData(provider, buffer, level, x, y);
        }
        return createQuantizedMeshTerrainData(provider, buffer, level, x, y, layerToUse);
    });
}

const maxShort = 32767;

function modifyTerrain(provider, rectangle, minimumHeight, maximumHeight, vertexCount, uBuffer, vBuffer, heightBuffer) {
    let needToUpdate = false;

    for (let i = 0; i < vertexCount; i++) {
        /**
         * The horizontal coordinate of the vertex in the tile.
         * When the u value is 0, the vertex is on the Western edge of the tile.
         * When the value is 32767, the vertex is on the Eastern edge of the tile.
         * For other values, the vertex's longitude is a linear interpolation between the longitudes of the Western and Eastern edges of the tile.
         */
        const u = uBuffer[i];

        /**
         * The vertical coordinate of the vertex in the tile.
         * When the v value is 0, the vertex is on the Southern edge of the tile.
         * When the value is 32767, the vertex is on the Northern edge of the tile.
         * For other values, the vertex's latitude is a linear interpolation between the latitudes of the Southern and Nothern edges of the tile.
         */

        const v = vBuffer[i];

        let longitude = rectangle.west + (u / maxShort) * rectangle.width;
        longitude = Cesium.Math.toDegrees(longitude);

        let latitude = rectangle.south + (v / maxShort) * rectangle.height;
        latitude = Cesium.Math.toDegrees(latitude);

        const turfPoint = turf.point([longitude, latitude]);

        if (turf.booleanPointInPolygon(turfPoint, provider._floorPolygon)) {
            needToUpdate = true;
            break;
        }
    }

    if (!needToUpdate) {
        return false;
    }

    const floorHeight = provider._floorHeight;
    const originalMinimumHeight = minimumHeight;
    const originalMaximumHeight = maximumHeight;

    if (floorHeight < minimumHeight) {
        minimumHeight = floorHeight;
    }

    if (floorHeight > maximumHeight) {
        maximumHeight = floorHeight;
    }

    for (let i = 0; i < vertexCount; i++) {
        /**
         * The horizontal coordinate of the vertex in the tile.
         * When the u value is 0, the vertex is on the Western edge of the tile.
         * When the value is 32767, the vertex is on the Eastern edge of the tile.
         * For other values, the vertex's longitude is a linear interpolation between the longitudes of the Western and Eastern edges of the tile.
         */
        const u = uBuffer[i];

        /**
         * The vertical coordinate of the vertex in the tile.
         * When the v value is 0, the vertex is on the Southern edge of the tile.
         * When the value is 32767, the vertex is on the Northern edge of the tile.
         * For other values, the vertex's latitude is a linear interpolation between the latitudes of the Southern and Nothern edges of the tile.
         */

        const v = vBuffer[i];

        /**
         * The height of the vertex in the tile.
         * When the height value is 0,the vertex's height is equal to the minimum height within the tile, as specified in the tile's header.
         * When the value is 32767, the vertex's height is equal to the maximum height within the tile.
         * For other values, the vertex's height is a linear interpolation between the minimum and maximum heights.
         */

        const quantizedHeight = heightBuffer[i];

        const realHeight = originalMinimumHeight + (originalMaximumHeight - originalMinimumHeight) * (quantizedHeight / maxShort);

        let longitude = rectangle.west + (u / maxShort) * rectangle.width;
        longitude = Cesium.Math.toDegrees(longitude);

        let latitude = rectangle.south + (v / maxShort) * rectangle.height;
        latitude = Cesium.Math.toDegrees(latitude);

        const turfPoint = turf.point([longitude, latitude]);

        if (turf.booleanPointInPolygon(turfPoint, provider._floorPolygon)) {
            heightBuffer[i] = getQuantizedHeight(floorHeight, minimumHeight, maximumHeight);
        } else {
            heightBuffer[i] = getQuantizedHeight(realHeight, minimumHeight, maximumHeight);
        }
    }

    return true;
}

function getQuantizedHeight(realHeight, minimumHeight, maximumHeight) {
    let qH = (realHeight - minimumHeight) / (maximumHeight - minimumHeight);
    qH *= maxShort;

    qH = Math.round(qH);

    return qH;
}

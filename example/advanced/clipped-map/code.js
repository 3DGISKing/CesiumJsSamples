async function main() {
    const {
        ArcGisMapServerImageryProvider,
        BoundingSphere,
        Cartesian3,
        Cartographic,
        Color,
        ClippingPlane,
        ClippingPlaneCollection,
        createWorldTerrainAsync,
        DebugModelMatrixPrimitive,
        Ellipsoid,
        Matrix4,
        Rectangle,
        sampleTerrainMostDetailed,
        Transforms,
        Viewer
    } = window.Cesium;

    const CesiumMath = window.Cesium.Math;

    const mapShelfHeight = 1000;

    const initialized = false;

    // default location : Grand Canyon
    const defaultCenterLng = -113.2665534;
    const defaultCenterLat = 36.0939345;

    const defaultWidth = 0.1 / 2;
    const defaultWest = defaultCenterLng - defaultWidth;
    const defaultEast = defaultCenterLng + defaultWidth;
    const defaultSouth = defaultCenterLat - defaultWidth;
    const defaultNorth = defaultCenterLat + defaultWidth;

    const west = defaultWest;
    const east = defaultEast;
    const north = defaultNorth;
    const south = defaultSouth;

    const terrainProvider = await createWorldTerrainAsync();

    const debugShowAxis = true;
    const debugShowBoundingBox = true;
    const debugShowCornerSpheres = true;
    const terrainExaggeration = 1;

    const viewer = new Viewer("cesiumContainer", {
        terrainProvider: terrainProvider,
        imageProvider: new ArcGisMapServerImageryProvider({
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
            enablePickFeatures: false
        }),
        terrainExaggeration: terrainExaggeration,
        timeline: false,
        animation: false,
        baseLayerPicker: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        geocoder: false
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.skyAtmosphere.show = false;
    viewer.scene.skyBox.show = false;
    viewer.scene.backgroundColor = Color.WHITE.clone();

    let globe = viewer.scene.globe;
    globe.backFaceCulling = true;
    globe.showSkirts = true;

    const rectangle = Rectangle.fromDegrees(west, south, east, north);

    const centerLongi = west + (east - west) / 2;
    const centerLat = south + (north - south) / 2;

    const MAX_HEIGHT = 8848;

    const pc1_min = Cartographic.fromDegrees(west, north);
    const p1_min = Ellipsoid.WGS84.cartographicToCartesian(pc1_min);

    const pc1_max = Cartographic.fromDegrees(west, north, MAX_HEIGHT);
    const p1_max = Ellipsoid.WGS84.cartographicToCartesian(pc1_max);

    const pc2_min = Cartographic.fromDegrees(east, north, 0);
    const p2_min = Ellipsoid.WGS84.cartographicToCartesian(pc2_min);

    const pc2_max = Cartographic.fromDegrees(east, north, MAX_HEIGHT);
    const p2_max = Ellipsoid.WGS84.cartographicToCartesian(pc2_max);

    const pc3_min = Cartographic.fromDegrees(east, south, 0);
    const p3_min = Ellipsoid.WGS84.cartographicToCartesian(pc3_min);

    const pc3_max = Cartographic.fromDegrees(east, south, MAX_HEIGHT);
    const p3_max = Ellipsoid.WGS84.cartographicToCartesian(pc3_max);

    const pc4_min = Cartographic.fromDegrees(west, south, 0);
    const p4_min = Ellipsoid.WGS84.cartographicToCartesian(pc4_min);

    const pc4_max = Cartographic.fromDegrees(west, south, MAX_HEIGHT);
    const p4_max = Ellipsoid.WGS84.cartographicToCartesian(pc4_max);

    const distanceWidth = Cartesian3.distance(p1_min, p2_min);
    const distanceHeight = Cartesian3.distance(p2_min, p3_min);

    console.log(pc1_min.toString());
    console.log(`distanceWidth = ${distanceWidth}`);
    console.log(`distanceHeight = ${distanceHeight}`);

    const centerPosition = Cartographic.toCartesian(new Cartographic.fromDegrees(centerLongi, centerLat, 100));

    const clippingPlanesEnabled = true;
    const edgeStylingEnabled = false;

    globe.clippingPlanes = new ClippingPlaneCollection({
        modelMatrix: Transforms.eastNorthUpToFixedFrame(centerPosition),
        planes: [
            new ClippingPlane(new Cartesian3(1.0, 0.0, 0.0), distanceWidth / 2),
            new ClippingPlane(new Cartesian3(-1.0, 0.0, 0.0), distanceWidth / 2),
            new ClippingPlane(new Cartesian3(0.0, 1.0, 0.0), distanceHeight / 2),
            new ClippingPlane(new Cartesian3(0.0, -1.0, 0.0), distanceHeight / 2)
        ],
        unionClippingRegions: true,
        edgeWidth: edgeStylingEnabled ? 2.0 : 0.0,
        edgeColor: Color.YELLOW,
        enabled: clippingPlanesEnabled
    });

    if (debugShowAxis) {
        viewer.scene.primitives.add(
            new DebugModelMatrixPrimitive({
                modelMatrix: Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(centerLongi, centerLat, 0), undefined, new Matrix4()),
                length: distanceWidth,
                width: 5.0
            })
        );
    }

    const positions = [p1_min, p1_max, p2_min, p2_max, p3_min, p3_max, p4_min, p4_max];

    const boundingSphere = BoundingSphere.fromPoints(positions);

    viewer.camera.flyToBoundingSphere(boundingSphere);

    viewer.scene.preRender.addEventListener(function () {
        if (viewer.scene.camera.pitch > -0.3) {
            globe.backFaceCulling = false;
            globe.showSkirts = false;
        } else {
            globe.backFaceCulling = true;
            globe.showSkirts = true;
        }
    });

    if (debugShowBoundingBox) {
        viewer.entities.add({
            position: Cartesian3.fromDegrees(centerLongi, centerLat, 0.0),
            box: {
                dimensions: new Cartesian3(distanceWidth, distanceHeight, 2000.0),
                material: Color.WHITE.withAlpha(0.3),
                outline: true,
                outlineColor: Color.WHITE
            }
        });
    }

    if (debugShowCornerSpheres) {
        const debugShowCornerSphereRadius = 500;

        viewer.entities.add({
            position: Cartesian3.fromDegrees(west, north, 1500.0),
            ellipsoid: {
                radii: new Cartesian3(debugShowCornerSphereRadius, debugShowCornerSphereRadius, debugShowCornerSphereRadius),
                material: Color.RED.withAlpha(0.5),
                outline: true,
                outlineColor: Color.BLACK
            }
        });

        viewer.entities.add({
            position: Cartesian3.fromDegrees(east, north, 1500.0),
            ellipsoid: {
                radii: new Cartesian3(debugShowCornerSphereRadius, debugShowCornerSphereRadius, debugShowCornerSphereRadius),
                material: Color.RED.withAlpha(0.5),
                outline: true,
                outlineColor: Color.BLACK
            }
        });
    }

    viewer.scene.globe.tileLoadProgressEvent.addEventListener(function (queuedTileCount) {
        if (initialized) return;

        console.log(queuedTileCount);
        console.log(viewer.scene.globe.tilesLoaded);

        if (viewer.scene.globe.tilesLoaded) {
            const terrainTileAvailability = terrainProvider.availability;

            const maximumLevel = terrainTileAvailability._maximumLevel;

            console.log(`maximumLevel = ${maximumLevel}`);

            //viewer.scene.globe._surface.tileProvider._debug.wireframe = true;

            const bestTerrainAvailableLevel = terrainTileAvailability.computeBestAvailableLevelOverRectangle(rectangle);

            console.log(`bestTerrainAvailableLevel = ${bestTerrainAvailableLevel}`);

            const heightMapWidth = terrainProvider._heightmapWidth;

            //const granularity =  Math.PI/ Math.pow(2, bestTerrainAvailableLevel);
            const granularity = Math.PI / Math.pow(2, bestTerrainAvailableLevel);

            granularity = granularity / (heightMapWidth - 1);

            console.log(`granularity = ${granularity}`);

            granularity = CesiumMath.toRadians(granularity);

            west = CesiumMath.toRadians(west);
            east = CesiumMath.toRadians(east);
            north = CesiumMath.toRadians(north);
            south = CesiumMath.toRadians(south);

            const northWestEastEdgePositions = [];

            for (let longitude = west; longitude <= east; longitude += granularity) {
                northWestEastEdgePositions.push(new Cartographic(longitude, north));
            }

            for (let latitude = north; latitude >= south; latitude -= granularity) {
                northWestEastEdgePositions.push(new Cartographic(east, latitude));
            }

            for (let longitude = east; longitude >= west; longitude -= granularity) {
                northWestEastEdgePositions.push(new Cartographic(longitude, south));
            }

            for (let latitude = south; latitude <= north; latitude += granularity) {
                northWestEastEdgePositions.push(new Cartographic(west, latitude));
            }

            sampleTerrainMostDetailed(viewer.terrainProvider, northWestEastEdgePositions).then(sampleTerrainSuccess);

            function sampleTerrainSuccess(terrainSamplePositions) {
                const cartoArray = [];
                const heights = [];

                const minimumHeight = 8848;

                for (const i = 0; i < terrainSamplePositions.length; ++i) {
                    const position = terrainSamplePositions[i];

                    cartoArray.push(position.longitude, position.latitude);
                    heights.push(position.height);

                    if (minimumHeight > position.height) minimumHeight = position.height;
                }

                const minimumHeights = [];

                for (i = 0; i < terrainSamplePositions.length; ++i) {
                    if (minimumHeight < mapShelfHeight) minimumHeights.push(0);
                    else minimumHeights.push(minimumHeight - mapShelfHeight);
                }

                viewer.entities.add({
                    wall: {
                        positions: Cartesian3.fromRadiansArray(cartoArray),
                        maximumHeights: heights,
                        minimumHeights: minimumHeights,
                        material: new Color(0.709, 0.792, 0.796)
                    }
                });

                const mapShelfBottomHeight = 100;
                let boxCenterHeight;

                if (minimumHeight < mapShelfHeight) boxCenterHeight = -mapShelfBottomHeight / 2;
                else boxCenterHeight = minimumHeight - mapShelfHeight - mapShelfBottomHeight / 2;

                viewer.entities.add({
                    position: Cartesian3.fromDegrees(centerLongi, centerLat, boxCenterHeight),
                    box: {
                        dimensions: new Cartesian3(distanceWidth, distanceHeight, mapShelfBottomHeight),
                        //material: Color.RED,
                        material: new Color(0.709, 0.792, 0.796)
                    }
                });

                initialized = true;
                viewer.zoomTo(viewer.entities);
            }
        }
    });
}

main();

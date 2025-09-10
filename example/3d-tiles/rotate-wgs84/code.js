const { ArcType, Cartesian3, Cesium3DTileset, Color, DebugModelMatrixPrimitive, HeadingPitchRoll, Matrix3, Matrix4, PolylineArrowMaterialProperty, Transforms, Viewer } = window.Cesium;

const CesiumMath = window.Cesium.Math;

let url, viewer, tileset, rotatedTileset, origBoundingBoxCenter;

const length = 6378137 * 2;

function start() {
    viewer = new Viewer("cesiumContainer");
    viewer.scene.globe.depthTestAgainstTerrain = true;

    const scene = viewer.scene;
    const primitives = scene.primitives;

    // all vertex of this tileset are directly defined in WGS84

    url = "https://s3.us-east-2.wasabisys.com/construkted-assets/a8ohdt08om9/tileset.json";

    const tilesetPromise = Cesium3DTileset.fromUrl(url, {
        debugShowBoundingVolume: true
    });

    tilesetPromise
        .then(function (t) {
            tileset = t;

            primitives.add(tileset);
            origBoundingBoxCenter = Cartesian3.clone(tileset.boundingSphere.center);

            console.log("origBoundingBoxCenter", origBoundingBoxCenter);

            if (tileset.modelMatrix.equals(Matrix4.IDENTITY) && tileset.root.transform.equals(Matrix4.IDENTITY) && Cartesian3.magnitude(tileset.boundingSphere.center) >= 6300000) {
                console.log("it seems that all vertex are defined in WGS84");
            }

            primitives.add(
                new DebugModelMatrixPrimitive({
                    modelMatrix: Transforms.eastNorthUpToFixedFrame(origBoundingBoxCenter),
                    length: length,
                    width: 5.0
                })
            );

            viewer.zoomTo(tileset);
        })
        .catch(function (err) {
            console.error(err.message);
        });
}

function drawEarthAxis() {
    const axisLength = 6378137 * 4;

    const xAxisEnd = new Cartesian3(axisLength, 0, 0);
    const yAxisEnd = new Cartesian3(0, axisLength, 0);
    const zAxisEnd = new Cartesian3(0, 0, axisLength);

    const width = 20;

    viewer.entities.add({
        polyline: {
            positions: [new Cartesian3(1, 0, 0), xAxisEnd],
            width: width,
            arcType: ArcType.NONE,
            material: new PolylineArrowMaterialProperty(Color.RED)
        }
    });

    viewer.entities.add({
        polyline: {
            positions: [new Cartesian3(1, 0, 0), yAxisEnd],
            width: width,
            arcType: ArcType.NONE,
            material: new PolylineArrowMaterialProperty(Color.YELLOW)
        }
    });

    viewer.entities.add({
        polyline: {
            positions: [new Cartesian3(1, 0, 0), zAxisEnd],
            width: width,
            arcType: ArcType.NONE,
            material: new PolylineArrowMaterialProperty(Color.BLUE)
        }
    });
}

function useTranslucencyMask() {
    const globe = viewer.scene.globe;
    const baseLayer = viewer.scene.imageryLayers.get(0);

    globe.showGroundAtmosphere = false;
    globe.baseColor = Color.TRANSPARENT;
    globe.translucency.enabled = true;
    globe.undergroundColor = undefined;

    // Set oceans on Bing base layer to transparent
    baseLayer.colorToAlpha = new Color(0.0, 0.016, 0.059);
    baseLayer.colorToAlphaThreshold = 0.2;
}

start();
drawEarthAxis();
// useTranslucencyMask();

Sandcastle.addToolbarButton("Rotate", function () {
    if (rotatedTileset) {
        viewer.scene.primitives.remove(rotatedTileset);
    }

    const rotatedTilesetPromise = Cesium3DTileset.fromUrl(url);

    rotatedTilesetPromise.then(function (t) {
        rotatedTileset = t;

        viewer.scene.primitives.add(rotatedTileset);
        rotatedTileset.modelMatrix = calc();

        console.log("rotated tileset bounding sphere center", rotatedTileset.boundingSphere.center);

        viewer.scene.primitives.add(
            new DebugModelMatrixPrimitive({
                modelMatrix: Transforms.eastNorthUpToFixedFrame(rotatedTileset.boundingSphere.center),
                length: length * 1.5,
                width: 10.0
            })
        );

        // viewer.zoomTo(rotatedTileset);
    });

    function calc() {
        const center = origBoundingBoxCenter;
        const heading = 0; // CesiumMath.PI_OVER_TWO;
        const pitch = CesiumMath.PI_OVER_TWO;
        const roll = 0; //CesiumMath.PI_OVER_TWO;

        const eastNorthUp = Transforms.eastNorthUpToFixedFrame(center);

        const unitEast = new Cartesian3(eastNorthUp[0], eastNorthUp[1], eastNorthUp[2]);
        const unitNorth = new Cartesian3(eastNorthUp[4], eastNorthUp[5], eastNorthUp[6]);
        const unitUp = Cartesian3.normalize(center, new Cartesian3());

        const rotationHeading = rotationMatrixAroundAxis(unitUp, heading);
        const rotationPitch = rotationMatrixAroundAxis(unitEast, pitch);
        const rotationRoll = rotationMatrixAroundAxis(unitNorth, roll);

        const translation1 = Matrix4.fromTranslation(new Cartesian3(-origBoundingBoxCenter.x, -origBoundingBoxCenter.y, -origBoundingBoxCenter.z));

        const translation2 = Matrix4.fromTranslation(new Cartesian3(origBoundingBoxCenter.x, origBoundingBoxCenter.y, origBoundingBoxCenter.z));

        let modelMatrix = translation2;

        modelMatrix = Matrix4.multiply(modelMatrix, rotationHeading, modelMatrix);
        modelMatrix = Matrix4.multiply(modelMatrix, rotationPitch, modelMatrix);
        modelMatrix = Matrix4.multiply(modelMatrix, rotationRoll, modelMatrix);
        modelMatrix = Matrix4.multiply(modelMatrix, translation1, new Matrix4());

        return modelMatrix;
    }
});

Sandcastle.addToolbarButton("Zoom to non rotated", function () {
    if (tileset) {
        viewer.zoomTo(tileset);
    }
});

Sandcastle.addToolbarButton("Zoom to rotated", function () {
    if (rotatedTileset) {
        viewer.zoomTo(rotatedTileset);
    }
});

function rotationMatrixAroundAxis(u, angle) {
    // u should be unit vector
    // angle is given in radian

    // https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle

    const uX = u.x;
    const uY = u.y;
    const uZ = u.z;

    const cosTheta = Math.cos(angle);
    const sinTheta = Math.sin(angle);
    const temp = 1 - cosTheta;

    const column0Row0 = cosTheta + uX * uX * temp;
    const column1Row0 = uX * uY * temp - uZ * sinTheta;
    const column2Row0 = uX * uZ * temp + uY * sinTheta;

    const column0Row1 = uY * uX * temp + uZ * sinTheta;
    const column1Row1 = cosTheta + uY * uY * temp;
    const column2Row1 = uY * uZ * temp - uX * sinTheta;

    const column0Row2 = uZ * uX * temp - uY * sinTheta;
    const column1Row2 = uZ * uY * temp + uX * sinTheta;
    const column2Row2 = cosTheta + uZ * uZ * temp;

    const m3 = new Matrix3(column0Row0, column1Row0, column2Row0, column0Row1, column1Row1, column2Row1, column0Row2, column1Row2, column2Row2);

    return Matrix4.fromRotation(m3);
}

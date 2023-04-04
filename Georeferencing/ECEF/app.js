const {
    Cartesian3,
    Cartographic,
    Cesium3DTileset,
    Color,
    DebugModelMatrixPrimitive,
    HeadingPitchRoll,
    knockout,
    Matrix3,
    Matrix4,
    Model,
    Quaternion,
    Transforms
} = window.Cesium;

const CesiumMath = window.Cesium.Math;

let tileset = undefined;
let viewModel = undefined;
let positionDebugModelMatrixPrimitive = undefined;
let centerOfBoundingSphereDebugModelMatrixPrimitive = undefined;
let origCenterDebugModelMatrixPrimitive = undefined;
let geoRefDebugModelMatrixPrimitive = undefined;

const defaultLongitude = -79.209;
const defaultLatitude = 43.7495;
const defaultHeight = 134;
const scale = 1;
const heading = 0;
const pitch = 0;
const roll = 0;
const x = 26.439266713918187;
const y = 28.762308408506215;
const z = 26.777012803591788;

function updateModelMatrixOfTilesetDefinedAtECEF(options) {
    const tileset = options.tileset;
    const position = options.position;
    const hpr = options.hpr;
    const scaleFactor = options.scale;
    const x = options.x;
    const y = options.y;
    const z = options.z;

    tileset.modelMatrix = Matrix4.IDENTITY;

    const origBoundingBoxCenter = Cartesian3.clone(tileset.boundingSphere.center, new Cartesian3());

    const referenceFrame = Transforms.eastNorthUpToFixedFrame(origBoundingBoxCenter);
    const toLocal = Matrix4.inverseTransformation(referenceFrame, new Matrix4());

    const rotationCenter = Cartesian3.add(origBoundingBoxCenter, new Cartesian3(x, y, z), new Cartesian3());
    const localOffset = Matrix4.multiplyByPoint(toLocal, rotationCenter, new Cartesian3());

    const offsetT = Matrix4.fromTranslation(new Cartesian3(-x, -y, -z));
    const invOffsetT = Matrix4.fromTranslation(localOffset);

    const R = Matrix4.fromRotation(Matrix3.fromQuaternion(Quaternion.fromHeadingPitchRoll(hpr)));
    const scale = Matrix4.fromScale(new Cartesian3(scaleFactor, scaleFactor, scaleFactor), new Matrix4());
    const toWorld = Transforms.eastNorthUpToFixedFrame(position);

    const modelMatrix = toWorld;

    Matrix4.multiply(modelMatrix, invOffsetT, modelMatrix);
    Matrix4.multiply(modelMatrix, R, modelMatrix);
    Matrix4.multiply(modelMatrix, scale, modelMatrix);
    Matrix4.multiply(modelMatrix, toLocal, modelMatrix);
    Matrix4.multiply(modelMatrix, offsetT, modelMatrix);

    tileset.modelMatrix = modelMatrix;

    positionDebugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
    centerOfBoundingSphereDebugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(
        tileset.boundingSphere.center
    );
    origCenterDebugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(origBoundingBoxCenter);
    geoRefDebugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(
        new Cartesian3(position.x + x, position.y + y, position.z + z)
    );
}

function main() {
    const viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: Cesium.createWorldTerrain()
    });

    const scene = viewer.scene;
    scene.globe.enableLighting = true;

    tileset = new Cesium3DTileset({
        url: "https://s3.us-east-2.wasabisys.com/construkted-assets/au0x0as79k3/tileset.json"
    });

    viewer.scene.primitives.add(tileset);

    tileset.readyPromise
        .then(() => {
            const primitives = scene.primitives;

            const length = tileset.boundingSphere.radius;

            positionDebugModelMatrixPrimitive = primitives.add(
                new DebugModelMatrixPrimitive({
                    length: length,
                    width: 10
                })
            );

            origCenterDebugModelMatrixPrimitive = primitives.add(
                new DebugModelMatrixPrimitive({
                    length: length * 2,
                    width: 10
                })
            );

            geoRefDebugModelMatrixPrimitive = primitives.add(
                new DebugModelMatrixPrimitive({
                    length: length * 0.5,
                    width: 3
                })
            );

            centerOfBoundingSphereDebugModelMatrixPrimitive = primitives.add(
                new DebugModelMatrixPrimitive({
                    length: length * 3,
                    width: 3
                })
            );

            const position = Cartesian3.fromDegrees(defaultLongitude, defaultLatitude, defaultHeight);
            const hpr = HeadingPitchRoll.fromDegrees(heading, pitch, roll);

            updateModelMatrixOfTilesetDefinedAtECEF({
                tileset,
                position,
                scale,
                hpr,
                x,
                y,
                z
            });

            viewer.camera.flyToBoundingSphere(tileset.boundingSphere);
        })
        .catch((e) => {
            console.error(e);
        });
}

function createModel() {
    viewModel = {
        longitude: defaultLongitude,
        latitude: defaultLatitude,
        height: defaultHeight,
        scale: scale,
        heading: heading,
        pitch: pitch,
        roll: roll,
        x: x,
        y: y,
        z: z
    };

    knockout.track(viewModel);

    const toolbar = document.getElementById("toolbar");

    knockout.applyBindings(viewModel, toolbar);

    knockout.getObservable(viewModel, "longitude").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "latitude").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "height").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "scale").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "heading").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "pitch").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "roll").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "x").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "y").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "z").subscribe(onChangeModel);
}

function onChangeModel() {
    const longitude = parseFloat(viewModel.longitude);
    const latitude = parseFloat(viewModel.latitude);
    const height = parseFloat(viewModel.height);
    const scale = parseFloat(viewModel.scale);
    const heading = parseFloat(viewModel.heading);
    const pitch = parseFloat(viewModel.pitch);
    const roll = parseFloat(viewModel.roll);

    const x = parseFloat(viewModel.x);
    const y = parseFloat(viewModel.y);
    const z = parseFloat(viewModel.z);

    const position = Cartesian3.fromDegrees(longitude, latitude, height);
    const hpr = HeadingPitchRoll.fromDegrees(heading, pitch, roll);

    updateModelMatrixOfTilesetDefinedAtECEF({
        tileset,
        position,
        scale,
        hpr,
        x,
        y,
        z
    });
}
main();
createModel();

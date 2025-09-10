const { Cartesian3, Cesium3DTileset, Color, DebugModelMatrixPrimitive, HeadingPitchRoll, knockout, Matrix3, Matrix4, Model, Quaternion, Transforms } = window.Cesium;

let tileset = undefined;
let viewModel = undefined;
let ENUDebugModelMatrixPrimitive = undefined;
let debugModelMatrixPrimitive = undefined;

const defaultLongitude = 127;
const defaultLatitude = 38;
const defaultHeight = 1;

const heading = 0;
const pitch = 0;
const roll = 0;
const x = 0;
const y = 0;
const z = 0;

function updateModelMatrixOfTilesetDefinedAtLocal(options) {
    const tileset = options.tileset;
    const position = options.position;
    const hpr = options.hpr;
    const x = options.x;
    const y = options.y;
    const z = options.z;

    // move rotation center into the origin of the local coordinate system.
    const step1 = Matrix4.fromTranslation(new Cartesian3(-x, -y, -z));

    const quaternion = Quaternion.fromHeadingPitchRoll(hpr);
    const rotation = Matrix3.fromQuaternion(quaternion);

    // rotate
    const step2 = Matrix4.fromRotation(rotation);

    // move rotation center to the original position
    const step3 = Matrix4.fromTranslation(new Cartesian3(x, y, z));

    // transform to ENU system
    const step4 = Transforms.eastNorthUpToFixedFrame(position);

    const modelMatrix = new Matrix4();

    Matrix4.multiply(step4, step3, modelMatrix);
    Matrix4.multiply(modelMatrix, step2, modelMatrix);
    Matrix4.multiply(modelMatrix, step1, modelMatrix);

    tileset.modelMatrix = modelMatrix;

    ENUDebugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
    debugModelMatrixPrimitive.modelMatrix = modelMatrix;
}

async function main() {
    const viewer = new Cesium.Viewer("cesiumContainer");

    const scene = viewer.scene;
    scene.globe.enableLighting = true;

    tileset = await Cesium3DTileset.fromUrl("https://s3.us-east-2.wasabisys.com/construkted-assets/ab9w7gad537/tileset.json");

    viewer.scene.primitives.add(tileset);

    const primitives = scene.primitives;

    const length = tileset.boundingSphere.radius;

    ENUDebugModelMatrixPrimitive = primitives.add(
        new DebugModelMatrixPrimitive({
            length: length,
            width: 5
        })
    );

    debugModelMatrixPrimitive = primitives.add(
        new DebugModelMatrixPrimitive({
            length: length * 1.5,
            width: 3
        })
    );

    const position = Cartesian3.fromDegrees(defaultLongitude, defaultLatitude, defaultHeight);
    const hpr = HeadingPitchRoll.fromDegrees(heading, pitch, roll);

    updateModelMatrixOfTilesetDefinedAtLocal({
        tileset,
        position,
        hpr,
        x,
        y,
        z
    });

    viewer.camera.flyToBoundingSphere(tileset.boundingSphere);
}

function createModel() {
    viewModel = {
        longitude: defaultLongitude,
        latitude: defaultLatitude,
        height: defaultHeight,
        heading: heading,
        pitch: pitch,
        roll: roll,
        x: x,
        y: y,
        z: z,
        step0: step0,
        step1: step1,
        step2: step2,
        step3: step3
    };

    knockout.track(viewModel);

    const toolbar = document.getElementById("toolbar");

    knockout.applyBindings(viewModel, toolbar);

    knockout.getObservable(viewModel, "longitude").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "latitude").subscribe(onChangeModel);
    knockout.getObservable(viewModel, "height").subscribe(onChangeModel);
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
    const heading = parseFloat(viewModel.heading);
    const pitch = parseFloat(viewModel.pitch);
    const roll = parseFloat(viewModel.roll);

    const x = parseFloat(viewModel.x);
    const y = parseFloat(viewModel.y);
    const z = parseFloat(viewModel.z);

    const position = Cartesian3.fromDegrees(longitude, latitude, height);
    const hpr = HeadingPitchRoll.fromDegrees(heading, pitch, roll);

    updateModelMatrixOfTilesetDefinedAtLocal({
        tileset,
        position,
        hpr,
        x,
        y,
        z
    });
}

function step0() {
    const longitude = parseFloat(viewModel.longitude);
    const latitude = parseFloat(viewModel.latitude);
    const height = parseFloat(viewModel.height);

    const position = Cartesian3.fromDegrees(longitude, latitude, height);

    tileset.modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
    ENUDebugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
    debugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
}

function step1() {
    const longitude = parseFloat(viewModel.longitude);
    const latitude = parseFloat(viewModel.latitude);
    const height = parseFloat(viewModel.height);

    const x = parseFloat(viewModel.x);
    const y = parseFloat(viewModel.y);
    const z = parseFloat(viewModel.z);

    const position = Cartesian3.fromDegrees(longitude, latitude, height);

    // move rotation center into the origin of the local coordinate system.
    const step1 = Matrix4.fromTranslation(new Cartesian3(-x, -y, -z));

    // transform to ENU system
    const step4 = Transforms.eastNorthUpToFixedFrame(position);

    const modelMatrix = new Matrix4();

    Matrix4.multiply(step4, step1, modelMatrix);

    tileset.modelMatrix = modelMatrix;

    ENUDebugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
    debugModelMatrixPrimitive.modelMatrix = modelMatrix;
}

function step2() {
    const longitude = parseFloat(viewModel.longitude);
    const latitude = parseFloat(viewModel.latitude);
    const height = parseFloat(viewModel.height);
    const heading = parseFloat(viewModel.heading);
    const pitch = parseFloat(viewModel.pitch);
    const roll = parseFloat(viewModel.roll);

    const x = parseFloat(viewModel.x);
    const y = parseFloat(viewModel.y);
    const z = parseFloat(viewModel.z);

    const position = Cartesian3.fromDegrees(longitude, latitude, height);
    const hpr = HeadingPitchRoll.fromDegrees(heading, pitch, roll);

    // move rotation center into the origin of the local coordinate system.
    const step1 = Matrix4.fromTranslation(new Cartesian3(-x, -y, -z));

    const quaternion = Quaternion.fromHeadingPitchRoll(hpr);
    const rotation = Matrix3.fromQuaternion(quaternion);

    // rotate
    const step2 = Matrix4.fromRotation(rotation);

    // transform to ENU system
    const step4 = Transforms.eastNorthUpToFixedFrame(position);

    const modelMatrix = new Matrix4();

    Matrix4.multiply(step4, step2, modelMatrix);
    Matrix4.multiply(modelMatrix, step1, modelMatrix);

    tileset.modelMatrix = modelMatrix;

    ENUDebugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
    debugModelMatrixPrimitive.modelMatrix = modelMatrix;
}

function step3() {
    const longitude = parseFloat(viewModel.longitude);
    const latitude = parseFloat(viewModel.latitude);
    const height = parseFloat(viewModel.height);
    const heading = parseFloat(viewModel.heading);
    const pitch = parseFloat(viewModel.pitch);
    const roll = parseFloat(viewModel.roll);

    const x = parseFloat(viewModel.x);
    const y = parseFloat(viewModel.y);
    const z = parseFloat(viewModel.z);

    const position = Cartesian3.fromDegrees(longitude, latitude, height);
    const hpr = HeadingPitchRoll.fromDegrees(heading, pitch, roll);

    // move rotation center into the origin of the local coordinate system.
    const step1 = Matrix4.fromTranslation(new Cartesian3(-x, -y, -z));

    const quaternion = Quaternion.fromHeadingPitchRoll(hpr);
    const rotation = Matrix3.fromQuaternion(quaternion);

    // rotate
    const step2 = Matrix4.fromRotation(rotation);

    // move rotation center to the original position
    const step3 = Matrix4.fromTranslation(new Cartesian3(x, y, z));

    // transform to ENU system
    const step4 = Transforms.eastNorthUpToFixedFrame(position);

    const modelMatrix = new Matrix4();

    Matrix4.multiply(step4, step3, modelMatrix);
    Matrix4.multiply(modelMatrix, step2, modelMatrix);
    Matrix4.multiply(modelMatrix, step1, modelMatrix);

    tileset.modelMatrix = modelMatrix;

    ENUDebugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
    debugModelMatrixPrimitive.modelMatrix = modelMatrix;
}

main();
createModel();

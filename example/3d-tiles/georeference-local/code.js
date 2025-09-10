const {
    Cartesian3,
    Cesium3DTileset,
    Color,
    createWorldTerrainAsync,
    DebugModelMatrixPrimitive,
    HeadingPitchRoll,
    knockout,
    Matrix3,
    Matrix4,
    Model,
    PointPrimitiveCollection,
    PrimitiveCollection,
    Quaternion,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    Transforms
} = window.Cesium;

let tileset;
let viewModel;
let point;
let ENUDebugModelMatrixPrimitive;
let debugModelMatrixPrimitive;

const defaultLongitude = 18.29148341298935;
const defaultLatitude = 49.029697177090384;
const defaultHeight = 294.2208204802369;
const scale = 1;
const heading = 0;
const pitch = 0;
const roll = 0;
const x = 4.335037474054843;
const y = 3.59958134428598;
const z = 5.983698042109609;

function updateModelMatrixOfTilesetDefinedAtLocal(options) {
    const tileset = options.tileset;
    const position = options.position;
    const hpr = options.hpr;
    const scale = options.scale;
    const x = options.x;
    const y = options.y;
    const z = options.z;

    const toWorld = Transforms.eastNorthUpToFixedFrame(position);
    const toLocal = Matrix4.inverseTransformation(toWorld, new Matrix4());
    const rotationCenterOffset = new Cartesian3(x, y, z);
    const rotationCenter = Cartesian3.add(position, rotationCenterOffset, new Cartesian3());
    const localOffset = Matrix4.multiplyByPoint(toLocal, rotationCenter, new Cartesian3());
    const offsetT = Matrix4.fromTranslation(Cartesian3.negate(localOffset, new Cartesian3()));
    // @ts-ignore
    const R = Matrix4.fromRotation(Matrix3.fromQuaternion(Quaternion.fromHeadingPitchRoll(hpr)));
    const scaleMat = Matrix4.fromScale(new Cartesian3(scale, scale, scale), new Matrix4());
    const invOffsetT = Matrix4.fromTranslation(localOffset);

    const modelMatrix = toWorld;

    Matrix4.multiply(toWorld, invOffsetT, modelMatrix);
    Matrix4.multiply(modelMatrix, R, modelMatrix);
    Matrix4.multiply(modelMatrix, scaleMat, modelMatrix);
    Matrix4.multiply(modelMatrix, offsetT, modelMatrix);

    tileset.modelMatrix = modelMatrix;

    ENUDebugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(position);
    debugModelMatrixPrimitive.modelMatrix = Transforms.eastNorthUpToFixedFrame(new Cartesian3(position.x + x, position.y + y, position.z + z));
}

async function main() {
    const viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: await createWorldTerrainAsync()
    });

    const scene = viewer.scene;
    scene.globe.enableLighting = true;
    const primitives1 = scene.primitives.add(new PrimitiveCollection());
    const points = primitives1.add(new PointPrimitiveCollection());

    point = points.add({
        pixelSize: 10,
        color: Color.YELLOW,
        position: new Cartesian3(),
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // for draw-over
        show: true
    });

    tileset = await Cesium3DTileset.fromUrl("https://s3.us-east-2.wasabisys.com/construkted-assets/ab9w7gad537/tileset.json");

    viewer.scene.primitives.add(tileset);

    const primitives = scene.primitives;

    const length = tileset.boundingSphere.radius;

    ENUDebugModelMatrixPrimitive = primitives.add(
        new DebugModelMatrixPrimitive({
            length: length,
            width: 10
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
        scale,
        hpr,
        x,
        y,
        z
    });

    point.position = new Cartesian3(position.x + x, position.y + y, position.z + z);
    viewer.camera.flyToBoundingSphere(tileset.boundingSphere);

    const handler = new ScreenSpaceEventHandler(scene.canvas);

    handler.setInputAction(function (movement) {
        const pickedPosition = getWorldPosition(scene, movement.position, new Cartesian3());

        if (!pickedPosition) {
            return;
        }

        const position = Cartesian3.fromDegrees(defaultLongitude, defaultLatitude, defaultHeight);

        viewModel.x = pickedPosition.x - position.x;
        viewModel.y = pickedPosition.y - position.y;
        viewModel.z = pickedPosition.z - position.z;
    }, ScreenSpaceEventType.LEFT_CLICK);
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

    updateModelMatrixOfTilesetDefinedAtLocal({
        tileset,
        position,
        scale,
        hpr,
        x,
        y,
        z
    });

    point.position = new Cartesian3(position.x + x, position.y + y, position.z + z);
}

function getWorldPosition(scene, screenPosition, result) {
    const picked = scene.pick(screenPosition, 1, 1);

    if (picked && picked.primitive instanceof Cesium3DTileset) {
        // check to let us know if we should pick against the globe instead
        const position = scene.pickPosition(screenPosition, new Cartesian3());

        if (position) {
            return Cartesian3.clone(position, result);
        }
    }
}

main();
createModel();

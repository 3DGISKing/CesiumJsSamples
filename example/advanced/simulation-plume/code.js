const {
    BoundingSphere,
    Cartesian2,
    Cartesian3,
    CircleEmitter,
    CloudCollection,
    Color,
    defined,
    HeadingPitchRoll,
    JulianDate,
    knockout,
    Matrix3,
    Matrix4,
    Model,
    Quaternion,
    ParticleBurst,
    ParticleSystem,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    Transforms,
    Viewer
} = window.Cesium;

const CesiumMath = Cesium.Math;

CesiumMath.setRandomNumberSeed(3);

const viewer = new Viewer("cesiumContainer");

viewer.clock.shouldAnimate = true;

// Wyonming Rapid city Pertoleum Refinery
const position = new Cartesian3(-1130845.435694563, -4466306.2847218495, 4395872.652117329);

const scene = viewer.scene;

const modelPromise = Model.fromGltfAsync({
    url: "./assets/models/refinery_light.gltf",
    modelMatrix: Transforms.eastNorthUpToFixedFrame(position),
    scale: 1
});

modelPromise.then((modelPrimitive) => {
    scene.primitives.add(modelPrimitive);

    modelPrimitive.readyEvent.addEventListener(() => {
        viewer.camera.flyToBoundingSphere(modelPrimitive.boundingSphere);
    });
});

const viewModel = {
    emissionRate: 5.0,
    gravity: 1.0,
    minimumParticleLife: 1.2,
    maximumParticleLife: 1.2,
    minimumSpeed: 1.0,
    maximumSpeed: 4.0,
    startScale: 1.0,
    endScale: 5.0,
    particleSize: 25.0
};

const particleSystem = scene.primitives.add(
    new ParticleSystem({
        show: true,
        modelMatrix: Transforms.eastNorthUpToFixedFrame(position),
        image: "./assets/images/smoke.png",
        startColor: Color.LIGHTSEAGREEN.withAlpha(0.7),
        endColor: Color.WHITE.withAlpha(0.0),
        startScale: viewModel.startScale,
        endScale: viewModel.endScale,
        minimumParticleLife: viewModel.minimumParticleLife,
        maximumParticleLife: viewModel.maximumParticleLife,
        minimumSpeed: viewModel.minimumSpeed,
        maximumSpeed: viewModel.maximumSpeed,
        imageSize: new Cartesian2(viewModel.particleSize, viewModel.particleSize),
        emissionRate: viewModel.emissionRate,
        bursts: [
            // these burst will occasionally sync to create a multicolored effect
            new ParticleBurst({
                time: 5.0,
                minimum: 5,
                maximum: 5
            }),
            new ParticleBurst({
                time: 10.0,
                minimum: 5,
                maximum: 5
            }),
            new ParticleBurst({
                time: 15.0,
                minimum: 5,
                maximum: 5
            })
        ],
        lifetime: 16.0,
        emitter: new CircleEmitter(2.0),
        emitterModelMatrix: Matrix4.multiplyByTranslation(Matrix4.IDENTITY, new Cartesian3(4, 42, 38), new Matrix4()),
        updateCallback: applyGravity
    })
);

const gravityScratch = new Cartesian3();

function applyGravity(p, dt) {
    // We need to compute a local up vector for each particle in geocentric space.
    const position = p.position;

    Cesium.Cartesian3.normalize(position, gravityScratch);
    Cesium.Cartesian3.multiplyByScalar(gravityScratch, viewModel.gravity * dt, gravityScratch);

    p.velocity = Cesium.Cartesian3.add(p.velocity, gravityScratch, p.velocity);
}

const clouds = scene.primitives.add(
    new CloudCollection({
        noiseDetail: 16.0,
        noiseOffset: Cesium.Cartesian3.ZERO
    })
);

const cloudParameters = {
    scaleWithMaximumSize: true,
    scaleX: 25,
    scaleY: 12,
    maximumSizeX: 25,
    maximumSizeY: 12,
    maximumSizeZ: 15,
    renderSlice: true, // if false, renders the entire surface of the ellipsoid
    slice: 0.36,
    brightness: 1.0
};

const frame = Transforms.eastNorthUpToFixedFrame(position);

const cloudPosition = Matrix4.multiplyByPoint(frame, new Cartesian3(4, 42, 40), new Cartesian3());

const cloud = clouds.add({
    position: cloudPosition,
    scale: new Cartesian2(cloudParameters.scaleX, cloudParameters.scaleY),
    maximumSize: new Cartesian3(
        cloudParameters.maximumSizeX,
        cloudParameters.maximumSizeY,
        cloudParameters.maximumSizeZ
    ),
    color: Color.WHITE,
    slice: cloudParameters.renderSlice ? cloudParameters.slice : -1.0,
    brightness: cloudParameters.brightness
});

const scratchScale = new Cartesian2();

scene.preUpdate.addEventListener(() => {
    Cartesian2.clone(cloud.scale, scratchScale);

    const delta = 0.1;

    scratchScale.x = scratchScale.x + delta;
    scratchScale.y = scratchScale.y + delta;

    cloud.scale = scratchScale;
});

const handler = new ScreenSpaceEventHandler(scene.canvas);

handler.setInputAction(function (click) {
    const pickedObject = scene.pick(click.position);

    console.log(pickedObject);
}, ScreenSpaceEventType.LEFT_CLICK);

const {
    Rectangle,
    Camera,
    Viewer,
    Cartesian3,
    Transforms,
    JulianDate,
    Matrix4,
    Quaternion,
    HeadingPitchRoll,
    TranslationRotationScale,
    SampledPositionProperty,
    TimeIntervalCollection,
    TimeInterval,
    VelocityOrientationProperty,
    Color,
    ParticleSystem,
    CircleEmitter,
    ParticleBurst,
    defined,
    HeadingPitchRange
} = window.Cesium;

const extent = Rectangle.fromDegrees(117.896284, 31.499028, 139.59738, 43.311528);
Camera.DEFAULT_VIEW_RECTANGLE = extent;
Camera.DEFAULT_VIEW_FACTOR = 0.7;

const viewer = new Viewer("cesiumContainer", {
    timline: false,
    shouldeAnimate: true,
    selectionIndicator: false,
    navigationHelpButton: false,
    infoBox: false,
    navigationInstructionInitiallyVisible: false,
    baseLayerPicker: true
});

const scene = viewer.scene;
const meteorPosition = Cartesian3.fromDegrees(139.743903, 35.694363, 0.0);
const modelMatrix = Transforms.eastNorthUpToFixedFrame(meteorPosition);
const start = JulianDate.fromDate(new Date(2019, 3, 19, 12));
const stop = JulianDate.addSeconds(start, 100, new JulianDate());

viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.multiplier = 4;
viewer.clock.shouldAnimate = true;

const gravityScratch = new Cartesian3();
const emitterModelMatrix = new Matrix4();
const translation = new Cartesian3();
const rotation = new Quaternion();
let hpr = new HeadingPitchRoll();
// 변환, 회전, 스케일이 정의된 아핀변환 (한 벡터공간을 다른 벡터공간으로 대응시키는 변환)
const trs = new TranslationRotationScale();

// pos1 - 출발점 지정
// pos2 - 도착점 지정
const pos1 = Cartesian3.fromDegrees(139.268781, 35.390778, 100000.0);
const pos2 = Cartesian3.fromDegrees(139.743903, 35.694363, 0.0);
const position = new SampledPositionProperty();

position.addSample(start, pos1);
position.addSample(stop, pos2);
// particle system 에 대한 파라미터 지정
const viewModel = {
    emissionRate: 10.0,
    gravity: 0.0,
    minimumParticleLife: 10.0,
    maximumParticleLife: 10.0,
    minimumSpeed: 4,
    maximumSpeed: 8,
    particleSize: 150.0
};

const computeModelMatrix = (meteor, time) => meteor.computeModelMatrix(time, new Matrix4());

const computeEmitterModelMatrix = () => {
    hpr = HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, hpr);
    trs.translation = Cartesian3.fromElements(-4.0, 0.0, 1.4, translation);
    trs.rotation = Quaternion.fromHeadingPitchRoll(hpr, rotation);
    return Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
};
// particle에 중력을 적용
const applyGravity = (p, dt) => {
    const position = p.position;
    Cartesian3.normalize(position, gravityScratch);
    Cartesian3.multiplyByScalar(gravityScratch, viewModel.gravity * dt, gravityScratch);
    p.velocity = Cartesian3.add(p.velocity, gravityScratch, p.velocity);
};

/********
     simulation function start
     value 1 - 50m급
     value 2 - 100m급
     ********/

Sandcastle.addToolbarButton("50Mt Meteor Simulation", function simulation50() {
    // 운석 변수 선언
    const meteor = viewer.entities.add({
        availability: new TimeIntervalCollection([
            new TimeInterval({
                start: start,
                stop: stop
            })
        ]),
        model: {
            uri: "./assets/models/meteor.gltf",
            minimumPixelSize: 100,
            maximumPixelSize: 100
        },
        viewFrom: new Cartesian3(-40.0, -30.0, 1000.0), //운석을 바라보는 관점
        position: position,
        orientation: new VelocityOrientationProperty(position)
    });
    viewer.trackedEntity = meteor;
    // 파티클 변수 선언
    const particleSystem = scene.primitives.add(
        new ParticleSystem({
            image: "./assets/images/smoke.png",
            startColor: Color.GRAY.withAlpha(0.5),
            endColor: Color.WHITE.withAlpha(0.5),
            minimumSpeed: viewModel.minimumSpeed,
            maximumSpeed: viewModel.maximumSpeed,
            imageSize: new window.Cesium.Cartesian2(viewModel.particleSize, viewModel.particleSize),
            emissionRate: viewModel.emissionRate,
            bursts: [new ParticleBurst({ time: 1.0, minimum: 10, maximum: 10 })],
            lifetime: 1.0,
            emitter: new CircleEmitter(2.0),
            emitterModelMatrix: computeEmitterModelMatrix(),
            updateCallback: applyGravity
        })
    );

    //50m급
    const targetCircle = viewer.entities.add({
        position: meteorPosition,
        ellipse: {
            semiMinorAxis: 50.0,
            semiMajorAxis: 50.0,
            material: "./assets/images/target.jpg"
        }
    });
    // 운석이 도착점에 도달할 시 피해반경 표출
    setTimeout(() => {
        viewer.entities.add({
            position: meteorPosition,
            ellipse: {
                semiMinorAxis: 11000.0,
                semiMajorAxis: 11000.0,
                material: Color.RED.withAlpha(0.5)
            }
        });
    }, 23000);
    // 피해반경 가시화
    setTimeout(() => {
        if (particleSystem != null) {
            scene.primitives.remove(particleSystem);
        }
        const staticPosition = Cartesian3.fromDegrees(139.743903, 35.694363, 60000);
        const orientation = new HeadingPitchRange(0, 300, 0);
        viewer.scene.camera.setView({
            destination: staticPosition,
            orientation: orientation
        });
    }, 26000);

    viewer.scene.preUpdate.addEventListener((scene, time) => {
        particleSystem.modelMatrix = computeModelMatrix(meteor, time);
        particleSystem.emitterModelMatrix = computeEmitterModelMatrix();
        if (viewModel.spin) {
            viewModel.heading += 0;
            viewModel.pitch += 0;
            viewModel.roll += 0;
        }
    });
});

Sandcastle.addToolbarButton("100Mt Meteor Simulation", function simulation100() {
    // 운석 변수 선언
    const meteor = viewer.entities.add({
        availability: new TimeIntervalCollection([
            new TimeInterval({
                start: start,
                stop: stop
            })
        ]),
        model: {
            uri: "./assets/models/meteor.gltf",
            minimumPixelSize: 100,
            maximumPixelSize: 100
        },
        viewFrom: new Cartesian3(-40.0, -30.0, 1000.0), //운석을 바라보는 관점
        position: position,
        orientation: new VelocityOrientationProperty(position)
    });
    viewer.trackedEntity = meteor;
    // 파티클 변수 선언
    const particleSystem = scene.primitives.add(
        new ParticleSystem({
            image: "./assets/images/smoke.png",
            startColor: Color.GRAY.withAlpha(0.5),
            endColor: Color.WHITE.withAlpha(0.5),
            minimumSpeed: viewModel.minimumSpeed,
            maximumSpeed: viewModel.maximumSpeed,
            imageSize: new window.Cesium.Cartesian2(viewModel.particleSize, viewModel.particleSize),
            emissionRate: viewModel.emissionRate,
            bursts: [new ParticleBurst({ time: 1.0, minimum: 10, maximum: 10 })],
            lifetime: 1.0,
            emitter: new CircleEmitter(2.0),
            emitterModelMatrix: computeEmitterModelMatrix(),
            updateCallback: applyGravity
        })
    );

    const targetCircle = viewer.entities.add({
        position: meteorPosition,
        ellipse: {
            semiMinorAxis: 50.0,
            semiMajorAxis: 50.0,
            material: "./assets/images/target.jpg"
        }
    });
    //100m급
    viewer.entities.add({
        position: meteorPosition,
        ellipse: {
            semiMinorAxis: 100.0,
            semiMajorAxis: 100.0,
            material: "./assets/images/target.jpg"
        }
    });

    setTimeout(() => {
        viewer.entities.add({
            position: meteorPosition,
            ellipse: {
                semiMinorAxis: 1100000.0,
                semiMajorAxis: 1100000.0,
                material: Color.RED.withAlpha(0.5)
            }
        });
    }, 23000);

    setTimeout(() => {
        if (particleSystem != null) {
            scene.primitives.remove(particleSystem);
        }
        const staticPosition = Cartesian3.fromDegrees(139.743903, 35.694363, 3000000);
        const orientation = new HeadingPitchRange(0, 300, 0);
        viewer.scene.camera.setView({
            destination: staticPosition,
            orientation: orientation
        });
    }, 26000);

    viewer.scene.preUpdate.addEventListener((scene, time) => {
        particleSystem.modelMatrix = computeModelMatrix(meteor, time);
        particleSystem.emitterModelMatrix = computeEmitterModelMatrix();
        if (viewModel.spin) {
            viewModel.heading += 0;
            viewModel.pitch += 0;
            viewModel.roll += 0;
        }
    });
});

Sandcastle.addToolbarButton("Reset", function () {
    location.reload();
});

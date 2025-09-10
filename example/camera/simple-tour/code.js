const { Rectangle, Camera, Viewer, Cartesian3, HeadingPitchRoll, Ellipsoid, Color, Model, Math: CesiumMath, Transforms } = window.Cesium;

const extent = Rectangle.fromDegrees(117.896284, 31.499028, 139.59738, 43.311528);
Camera.DEFAULT_VIEW_RECTANGLE = extent;
Camera.DEFAULT_VIEW_FACTOR = 0.7;

const viewer = new Viewer("cesiumContainer", {
    timeline: false,
    shouldAnimate: false,
    selectionIndicator: false,
    navigationHelpButton: false,
    infoBox: false,
    navigationInstructionsInitiallyVisible: false
});

const soPos = Cartesian3.fromDegrees(126.926094, 37.526077, 0);
const snPos = Cartesian3.fromDegrees(127.1335085, 37.431755, 0);
const jejPos = Cartesian3.fromDegrees(126.538746, 33.358393, 0);

const scene = viewer.scene;
const center = new Cartesian3();
const headingPitchRoll = new HeadingPitchRoll();
const fixedFrameTransform = Transforms.localFrameToFixedFrameGenerator("south", "east");

const start = window.Cesium.JulianDate.fromDate(new Date(2019, 5, 10, 13));
const stop = window.Cesium.JulianDate.addSeconds(start, 100, new window.Cesium.JulianDate());

viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.shouldAnimate = true;

// Load 3D models asynchronously
(async function () {
    const snModel = await Model.fromGltfAsync({
        url: "./assets/models/sn.gltf",
        modelMatrix: Transforms.headingPitchRollToFixedFrame(snPos, headingPitchRoll, Ellipsoid.WGS84, fixedFrameTransform),
        scale: 34,
        color: Color.MAGENTA
    });
    scene.primitives.add(snModel);

    const soModel = await Model.fromGltfAsync({
        url: "./assets/models/test.gltf",
        modelMatrix: Transforms.headingPitchRollToFixedFrame(soPos, headingPitchRoll, Ellipsoid.WGS84, fixedFrameTransform),
        scale: 37.3
    });
    scene.primitives.add(soModel);

    const jejModel = await Model.fromGltfAsync({
        url: "./assets/models/jeju.gltf",
        modelMatrix: Transforms.headingPitchRollToFixedFrame(jejPos, headingPitchRoll, Ellipsoid.WGS84, fixedFrameTransform),
        scale: 900
    });
    scene.primitives.add(jejModel);
})();

/*
 * tour start
 * * korean peninsula -> songnam -> seoul -> jeju
 *
 */
Sandcastle.addToolbarButton("Start Tour", function tour() {
    this.disabled = true;
    // Helper for flyTo with delay
    const flyToWithDelay = (options, delay) => setTimeout(() => viewer.scene.camera.flyTo(options), delay);

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(127.786754, 36.643957, 600000.0)
        },
        2000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(128.075929, 33.014948, 500000.0),
            orientation: {
                heading: CesiumMath.toRadians(0),
                pitch: CesiumMath.toRadians(-420),
                roll: CesiumMath.toRadians(0)
            }
        },
        7000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(127.1335085, 37.431755, 5000.0)
        },
        12000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(127.135768, 37.422385, 1500.0),
            orientation: {
                heading: CesiumMath.toRadians(0),
                pitch: CesiumMath.toRadians(-50),
                roll: 0
            }
        },
        15000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(127.113523, 37.431426, 1300.0),
            orientation: {
                heading: CesiumMath.toRadians(80),
                pitch: CesiumMath.toRadians(-40),
                roll: 0
            }
        },
        18000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(127.13611, 37.441887, 1100.0),
            orientation: {
                heading: CesiumMath.toRadians(150),
                pitch: CesiumMath.toRadians(-55),
                roll: 0
            }
        },
        21000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(127.154444, 37.435255, 900.0),
            orientation: {
                heading: CesiumMath.toRadians(250),
                pitch: CesiumMath.toRadians(-35),
                roll: 0
            }
        },
        24000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(127.144764, 37.422264, 600.0),
            orientation: {
                heading: CesiumMath.toRadians(330),
                pitch: CesiumMath.toRadians(-30),
                roll: 0
            }
        },
        27000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.925087, 37.525285, 5000.0)
        },
        32000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.900845, 37.513272, 500.0),
            orientation: {
                heading: CesiumMath.toRadians(50),
                pitch: CesiumMath.toRadians(-10),
                roll: 0
            }
        },
        35000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.901007, 37.54297, 800.0),
            orientation: {
                heading: CesiumMath.toRadians(130),
                pitch: CesiumMath.toRadians(-25),
                roll: 0
            }
        },
        38000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.936284, 37.542007, 1200.0),
            orientation: {
                heading: CesiumMath.toRadians(210),
                pitch: CesiumMath.toRadians(-30),
                roll: 0
            }
        },
        41000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.955088, 37.509821, 1500.0),
            orientation: {
                heading: CesiumMath.toRadians(300),
                pitch: CesiumMath.toRadians(-30),
                roll: 0
            }
        },
        44000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.905109, 37.509339, 2000.0),
            orientation: {
                heading: CesiumMath.toRadians(400),
                pitch: CesiumMath.toRadians(-40),
                roll: 0
            }
        },
        47000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.540122, 33.357772, 80000.0)
        },
        52000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.578669, 33.158991, 3000.0),
            orientation: {
                heading: CesiumMath.toRadians(-10),
                pitch: CesiumMath.toRadians(-10),
                roll: 0
            }
        },
        55000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.103072, 33.446492, 3000.0),
            orientation: {
                heading: CesiumMath.toRadians(110),
                pitch: CesiumMath.toRadians(-10),
                roll: 0
            }
        },
        58000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.906192, 33.610389, 3000.0),
            orientation: {
                heading: CesiumMath.toRadians(210),
                pitch: CesiumMath.toRadians(-10),
                roll: 0
            }
        },
        61000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.961106, 33.337189, 3000.0),
            orientation: {
                heading: CesiumMath.toRadians(280),
                pitch: CesiumMath.toRadians(-10),
                roll: 0
            }
        },
        64000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.557389, 33.266105, 5000.0),
            orientation: {
                heading: CesiumMath.toRadians(-10),
                pitch: CesiumMath.toRadians(-35),
                roll: 0
            }
        },
        67000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.364592, 33.335144, 5000.0),
            orientation: {
                heading: CesiumMath.toRadians(80),
                pitch: CesiumMath.toRadians(-35),
                roll: 0
            }
        },
        70000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.491013, 33.449799, 5000.0),
            orientation: {
                heading: CesiumMath.toRadians(160),
                pitch: CesiumMath.toRadians(-35),
                roll: 0
            }
        },
        73000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.685509, 33.422088, 5000.0),
            orientation: {
                heading: CesiumMath.toRadians(240),
                pitch: CesiumMath.toRadians(-35),
                roll: 0
            }
        },
        76000
    );

    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(126.490769, 33.349251, 10000.0),
            orientation: {
                heading: CesiumMath.toRadians(0),
                pitch: CesiumMath.toRadians(-90),
                roll: 0
            }
        },
        79000
    );

    // restore initial level
    flyToWithDelay(
        {
            destination: Cartesian3.fromDegrees(127.786754, 36.643957, 8000000.0)
        },
        84000
    );

    setTimeout(() => tour(), 89000);
});

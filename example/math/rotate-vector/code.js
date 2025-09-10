const { Viewer, Cartesian3 } = window.Cesium;

const viewer = new Viewer("cesiumContainer", {});

viewer.scene.globe.depthTestAgainstTerrain = true;

viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(0, 0, 10000000)
});

const origin = Cartesian3.fromDegrees(0, 0, 1000);

const axisLength = 1000000;
const vectorLength = 2000000;

// heading 0 indicates east direction
// heading -90 indicates true north
const initHeading = 0;

viewer.scene.primitives.add(
    new Cesium.DebugModelMatrixPrimitive({
        modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(origin, undefined, new Cesium.Matrix4()),
        length: axisLength,
        width: 5.0
    })
);

let viewModel = {
    heading: initHeading,
    pitch: 0
};

Cesium.knockout.track(viewModel);

const toolbar = document.getElementById("toolbar");

Cesium.knockout.applyBindings(viewModel, toolbar);

Cesium.knockout.getObservable(viewModel, "heading").subscribe(update);
Cesium.knockout.getObservable(viewModel, "pitch").subscribe(update);

let vectorPositions = [
    origin.clone(),
    calcEndPosition(
        origin,
        Cesium.Math.toRadians(viewModel.heading),
        Cesium.Math.toRadians(viewModel.pitch),
        vectorLength
    )
];

const fnVectorPositions = function () {
    return vectorPositions;
};

viewer.entities.add({
    polyline: {
        positions: new Cesium.CallbackProperty(fnVectorPositions, false),
        width: 10,
        arcType: Cesium.ArcType.NONE,
        material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
    }
});

function calcEndPosition(startPosition, heading, pitch, distance) {
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, 0);

    var orientation = Cesium.Transforms.headingPitchRollQuaternion(startPosition, hpr);

    var matrix3Scratch = new Cesium.Matrix3();

    var result = new Cesium.Matrix4();

    result = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch),
        startPosition,
        result
    );

    var endPosition = new Cesium.Cartesian3(distance, 0, 0);

    endPosition = Cesium.Matrix4.multiplyByPoint(result, endPosition, new Cesium.Cartesian3());

    return endPosition;
}

function update() {
    vectorPositions[1] = calcEndPosition(
        origin,
        Cesium.Math.toRadians(viewModel.heading),
        Cesium.Math.toRadians(viewModel.pitch),
        vectorLength
    );
}

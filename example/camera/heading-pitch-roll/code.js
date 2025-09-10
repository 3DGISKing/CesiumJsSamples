const { Cartesian3, Math: CesiumMath, Viewer } = window.Cesium;

const viewer = new Viewer("cesiumContainer");

viewer.scene.camera.flyTo({
    destination: Cartesian3.fromDegrees(-74.019, 40.6912, 750),
    orientation: {
        heading: CesiumMath.toRadians(20),
        pitch: CesiumMath.toRadians(-20)
    }
});

initInterface();

function initInterface() {
    $("#heading").on("input change", function () {
        updateCamera();
    });

    $("#pitch").on("input change", function () {
        updateCamera();
    });

    $("#roll").on("input change", function () {
        updateCamera();
    });
}

function updateCamera() {
    const heading = Number($("#heading").val());
    const pitch = Number($("#pitch").val());
    const roll = Number($("#roll").val());

    console.log("heading", heading);
    console.log("pitch", pitch);
    console.log("roll", roll);

    viewer.camera.setView({
        orientation: {
            heading: Cesium.Math.toRadians(heading),
            pitch: Cesium.Math.toRadians(pitch),
            roll: Cesium.Math.toRadians(roll)
        }
    });
}

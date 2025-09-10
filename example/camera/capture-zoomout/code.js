// https://stackoverflow.com/questions/68941505/capture-zoom-out-event-in-cesium

const viewer = new Cesium.Viewer("cesiumContainer");

const camera = viewer.camera;

const scratchCartesian1 = new Cesium.Cartesian3();
const scratchCartesian2 = new Cesium.Cartesian3();

let startPos, endPos;

camera.moveStart.addEventListener(function () {
    startPos = camera.positionWC.clone(scratchCartesian1);
});

camera.moveEnd.addEventListener(function () {
    endPos = camera.positionWC.clone(scratchCartesian2);

    const startHeight = Cesium.Cartographic.fromCartesian(startPos).height;
    const endHeight = Cesium.Cartographic.fromCartesian(endPos).height;

    if (startHeight > endHeight) {
        console.log("zoom in");
    } else {
        console.log("zoom out");
    }
});

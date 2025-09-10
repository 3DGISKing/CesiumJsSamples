//For answering

// https://stackoverflow.com/questions/67617113/how-to-create-a-separate-clock-and-control-it-with-custom-control-in-cesium-js

const {
    BoundingSphere,
    Cartesian3,
    ClockRange,
    JulianDate,
    SampledPositionProperty,
    VelocityOrientationProperty,
    Viewer
} = window.Cesium;

const viewer = new Viewer("cesiumContainer", {
    shouldAnimate: true
});

const startTime = JulianDate.fromDate(new Date(2019, 5, 10, 13));
const stopTime = JulianDate.addSeconds(startTime, 10, new JulianDate());

viewer.clock.startTime = startTime.clone();
viewer.clock.stopTime = stopTime.clone();
viewer.clock.shouldAnimate = true;
viewer.clock.clockRange = ClockRange.LOOP_STOP;

viewer.timeline.zoomTo(startTime, stopTime);

const latitude = 38;
const longitude = 127;
const altitude = 10;

const dronePositions = new SampledPositionProperty();

const startPoint = Cartesian3.fromDegrees(longitude, latitude, altitude);

dronePositions.addSample(startTime, startPoint);

const endPoint = Cartesian3.fromDegrees(longitude + 0.001, latitude, altitude);

dronePositions.addSample(stopTime, endPoint);

const droneUri = `./assets/models/CesiumDrone.glb`;

const DroneEntity = viewer.entities.add({
    position: dronePositions,
    model: { uri: droneUri },
    orientation: new VelocityOrientationProperty(dronePositions)
});

viewer.camera.flyToBoundingSphere(BoundingSphere.fromPoints([startPoint, endPoint]));

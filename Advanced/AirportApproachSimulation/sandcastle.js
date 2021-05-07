var viewer = new Cesium.Viewer("cesiumContainer");

var FEET_TO_METER = 0.3048;
var NAUTICAL_TO_METER = 1852;

var startPointLongitude = -79.66369444444445;
var startPointLatitude = 43.674416666666666;
var startPointAltitude = 618;
var gradient = 3;
var magneticDirection = -10;
var course = 57;
var distance = 7.3;

var startPosition = Cesium.Cartesian3.fromDegrees(startPointLongitude, startPointLatitude, startPointAltitude * FEET_TO_METER);
var endPosition = calcApproachPathEndPosition(startPosition, gradient, magneticDirection, course, distance);

var pathPositions = [];

pathPositions.push(startPosition);

var positions = new Cesium.CallbackProperty(function () {
    return pathPositions;
}, false);

var fixedFrameTransform = Cesium.Transforms.eastNorthUpToFixedFrame;
var heading = courseToCesiumHeading(course, magneticDirection);
var pitch = slopeToCesiumPitch(gradient);
var hpr = new Cesium.HeadingPitchRoll(heading, pitch, 0);

var planePrimitive = viewer.scene.primitives.add(Cesium.Model.fromGltf({
    url :  "../SampleData/models/CesiumAir/Cesium_Air.glb",
    modelMatrix : Cesium.Transforms.headingPitchRollToFixedFrame(startPosition, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransform),
    minimumPixelSize : 64
}));

var approachPathEntity = viewer.entities.add({
    polyline : {
        positions: positions,
        material : Cesium.Color.RED,
        width : 3,
        arcType : Cesium.ArcType.NONE,
    }
});

var wall = viewer.entities.add({
    wall : {
        positions: new Cesium.CallbackProperty(function () {
            return pathPositions;
        }, false),
        material : Cesium.Color.GREEN.withAlpha(0.3)
    }
});


var currentPosition = new Cesium.Cartesian3();
var speedVector = new Cesium.Cartesian3();
var SPEED = 10;

viewer.scene.preUpdate.addEventListener(function(scene, time) {
    var newPlanePrimitivePosition = new Cesium.Cartesian3();

    currentPosition = Cesium.Matrix4.getTranslation(planePrimitive.modelMatrix, currentPosition);
    var distance = Cesium.Cartesian3.distance(startPosition, currentPosition);

    if( distance > distance)
    {
        // we need to restart simulation
        planePrimitive.modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(startPosition, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransform);

        pathPositions.splice(0, pathPositions.length);
        pathPositions.push(startPosition);
    }

    speedVector = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_X, SPEED, speedVector);

    newPlanePrimitivePosition = Cesium.Matrix4.multiplyByPoint(planePrimitive.modelMatrix, speedVector, newPlanePrimitivePosition);

    pathPositions.push(newPlanePrimitivePosition);

    Cesium.Transforms.headingPitchRollToFixedFrame(newPlanePrimitivePosition, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransform, planePrimitive.modelMatrix);
});

viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(startPosition, 5000));

function slopeToCesiumPitch(slope) {
    var pitch;

    if(slope >= 0)
        pitch = slope;
    else
        pitch = 360 + slope;

    return Cesium.Math.toRadians(pitch);
}

function courseToCesiumHeading(course, magneticDirection) {
    magneticDirection = Number(magneticDirection);

    /*
    * magnetic direction or magnetic variation
    * if west, negative
    * if east, positive
    * */

    // why + 90
    // in this app, x axis points in the east.
    // meanwhile course is measured from north direction.

    var heading = course + magneticDirection + 90;

    return Cesium.Math.toRadians(heading);
}

function calcApproachPathEndPosition(startPosition, gradient, magneticDirection, course, distance) {
    var heading = courseToCesiumHeading(course, magneticDirection);

    var pitch = slopeToCesiumPitch(gradient);

    var hpr = new Cesium.HeadingPitchRoll(heading, pitch , 0);

    var orientation = Cesium.Transforms.headingPitchRollQuaternion(startPosition, hpr);

    var matrix3Scratch = new Cesium.Matrix3();

    var result = new Cesium.Matrix4();

    result = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch), startPosition, result);

    distance = distance * NAUTICAL_TO_METER;

    var endPosition = new Cesium.Cartesian3(distance, 0, 0);

    endPosition = Cesium.Matrix4.multiplyByPoint(result, endPosition, new Cesium.Cartesian3());

    return endPosition;
}
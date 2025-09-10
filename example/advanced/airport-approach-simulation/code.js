const {
    ArcType,
    Cartesian2,
    Cartesian3,
    CallbackProperty,
    Color,
    defined,
    DistanceDisplayCondition,
    Ellipsoid,
    HeightReference,
    HeadingPitchRoll,
    HorizontalOrigin,
    Matrix3,
    Matrix4,
    Model,
    ScreenSpaceEventType,
    ScreenSpaceEventHandler,
    Transforms,
    VerticalOrigin,
    Viewer
} = Cesium;
const CesiumMath = window.Cesium.Math;

// global variables
var viewer;
var g_approachPathDataArr = [];
var g_showPlanePrimitiveAxisForDebug = false;
var g_enableAnimation = true;

function main() {
    var FEET_TO_METER = 0.3048;
    var NAUTICAL_TO_METER = 1852;
    var airportZoomHeight = 8000;

    var terrainProviderViewModels = [];

    var MSARadius = 46000; // 25NM

    var DISPLAY_LIMIT = 500000;

    viewer = new Viewer("cesiumContainer", {
        infoBox: false,
        selectedTerrainProviderViewModel: terrainProviderViewModels[0],
        skyAtmosphere: false,
        shouldAnimate: true,
        requestRenderMode: true
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.logarithmicDepthBuffer = false;

    var airportBillboards = [];

    var kabulPosition = Cartesian3.fromDegrees(69.2075, 34.5553, 5000000);
    var dubaiPosition = Cartesian3.fromDegrees(55.394722222222225, 25.235833333333336, 5000);
    var torontoPosition = Cartesian3.fromDegrees(-79.66369444444445, 43.6744166666666666, 5000);

    viewer.camera.flyTo({
        // destination : kabulPosition
        // destination: dubaiPosition
        destination: torontoPosition
    });

    function loadAirportData() {
        var url = "./assets/airports.json";

        $.getJSON(url, function (data) {
            $.each(data, function (key, airport) {
                var airportBillboard = viewer.entities.add({
                    position: Cartesian3.fromDegrees(airport.lng, airport.lat),
                    billboard: {
                        image: "./assets/images/airport_pin_40_blue.png",
                        scale: 0.5,
                        heightReference: HeightReference.CLAMP_TO_GROUND,
                        // if distance from the camera is less than 6000000, disable depth testing
                        disableDepthTestDistance: 6000000,
                        // if distance from the camera is less than 6000000.0, show it
                        distanceDisplayCondition: new DistanceDisplayCondition(0, 6000000.0)
                    },
                    airport: airport.AIRPORT,
                    latitude: airport.lat,
                    longitude: airport.lng
                });

                airportBillboards.push(airportBillboard);

                if (airport.MSADMS !== undefined) {
                    var circularPolygon4326 = ol.geom.Polygon.circular(
                        [airport.MSALng, airport.MSALat],
                        MSARadius,
                        /* Number of verticies */
                        32
                    );

                    var coords = circularPolygon4326.getCoordinates();

                    var positions = [];

                    for (var i = 0; i < coords[0].length; i++) {
                        positions.push(coords[0][i][0]); // longitude
                        positions.push(coords[0][i][1]); // latitude
                        positions.push(airport.altitude * FEET_TO_METER); // altitude
                    }

                    var fence = viewer.entities.add({
                        name: "fence",
                        wall: {
                            positions: Cartesian3.fromDegreesArrayHeights(positions),
                            material: Color.RED.withAlpha(0.2),
                            outline: true,
                            outlineColor: Color.WHITE,
                            outlineWidth: 2,
                            distanceDisplayCondition: new DistanceDisplayCondition(0, DISPLAY_LIMIT)
                        }
                    });
                }
            });
        });
    }

    var airportTooltipEntity = viewer.entities.add({
        label: {
            show: false,
            showBackground: true,
            font: "14px monospace",
            horizontalOrigin: HorizontalOrigin.LEFT,
            verticalOrigin: VerticalOrigin.TOP,
            pixelOffset: new Cartesian2(15, 0),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
    });

    var scene = viewer.scene;

    // Mouse over the globe to see the cartographic position
    var handler = new ScreenSpaceEventHandler(scene.canvas);

    handler.setInputAction(function (movement) {
        var pickedObject = scene.pick(movement.position);

        if (defined(pickedObject)) {
            airportTooltipEntity.label.show = false;

            var latitude = pickedObject.id.latitude;
            var longitude = pickedObject.id.longitude;

            // this is not airport!
            if (longitude === undefined || latitude === undefined) return;

            var carto = new Cartographic(Math.toRadians(longitude), Math.toRadians(latitude), airportZoomHeight);
            var cartesianPosition = viewer.scene.globe.ellipsoid.cartographicToCartesian(carto);

            viewer.camera.flyTo({
                destination: cartesianPosition
            });
        }
    }, ScreenSpaceEventType.LEFT_DOWN);

    handler.setInputAction(function (movement) {
        var pickedObject = scene.pick(movement.endPosition);

        // we need to check if picked object is airport entity
        if (defined(pickedObject) && defined(pickedObject.id) && defined(pickedObject.id.position)) {
            var latitude = pickedObject.id.latitude;
            var longitude = pickedObject.id.longitude;

            // picked object is not airport
            if (latitude == null || longitude == null) return;

            var carto = new Cartographic(Math.toRadians(longitude), Math.toRadians(latitude));
            carto.height = viewer.scene.globe.getHeight(carto);

            airportTooltipEntity.position = pickedObject.id.position.getValue(0);

            airportTooltipEntity.position = viewer.scene.globe.ellipsoid.cartographicToCartesian(carto);
            airportTooltipEntity.label.show = true;
            airportTooltipEntity.label.text = pickedObject.id.airport;
        } else {
            airportTooltipEntity.label.show = false;
        }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    viewer.camera.moveEnd.addEventListener(function () {
        if (airportBillboards.length > 0) return;

        loadAirportData();
        loadApproachPathsData();
    });

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

        return CesiumMath.toRadians(heading);
    }

    function slopeToCesiumPitch(slope) {
        var pitch;

        if (slope >= 0) pitch = slope;
        else pitch = 360 + slope;

        return CesiumMath.toRadians(pitch);
    }

    function proofApproachPath() {
        var dubaiLongitude = 55.39472222222222;
        var dubaiLatitude = 25.235833333333336;

        var altitude = 110 * FEET_TO_METER;

        var planePosition = Cartesian3.fromDegrees(dubaiLongitude, dubaiLatitude, altitude);
        var heading = CesiumMath.toRadians(0);

        var pitch = 0;
        var roll = 0;
        var hpr = new HeadingPitchRoll(heading, pitch, roll);
        var orientation = Transforms.headingPitchRollQuaternion(planePosition, hpr);

        var url = "./assets/models/Cesium_Air.glb";

        var plane = viewer.entities.add({
            name: url,
            position: planePosition,
            orientation: orientation,
            model: {
                uri: url,
                minimumPixelSize: 128,
                maximumScale: 20000
            }
        });

        var hprRollZero = new HeadingPitchRoll();

        /*
        The x axis points in the local east direction.
        The y axis points in the local north direction.
        The z axis points in the direction of the ellipsoid surface normal which passes through the position.
         */

        var modelMatrix = Transforms.headingPitchRollToFixedFrame(planePosition, hprRollZero, Ellipsoid.WGS84, Transforms.eastNorthUpToFixedFrame);
        //var modelMatrix = Transforms.headingPitchRollToFixedFrame(position, hprRollZero, Ellipsoid.WGS84, Transforms.localFrameToFixedFrameGenerator('north', 'west'));
        scene.primitives.add(
            new DebugModelMatrixPrimitive({
                modelMatrix: modelMatrix,
                length: 300.0,
                width: 5.0
            })
        );

        viewer.trackedEntity = plane;

        $("#model_altitude").range({
            onChange: function (value, percent) {
                $("#model_altitude_text").val(value);

                updateLineEntity();
            }
        });

        $("#model_altitude_text").change(function () {
            var value = $("#model_altitude_text").val();

            $("#model_altitude").val(value);
            updateLineEntity();
        });

        $("#model_course").range({
            onChange: function (value, percent) {
                $("#model_course_text").val(value);

                updateLineEntity();
            }
        });

        $("#model_course_text").change(function () {
            var value = $("#model_course_text").val();

            $("#model_course").val(value);
            updateLineEntity();
        });

        $("#model_slope").range({
            onChange: function (value, percent) {
                $("#model_slope_text").val(value);
                updateLineEntity();
            }
        });

        $("#model_slope_text").change(function () {
            var value = $("#model_slope_text").val();

            $("#model_slope").val(value);
            updateLineEntity();
        });

        $("#distance").range({
            onChange: function (value, percent) {
                $("#distance_text").val(value);

                updateLineEntity();
            }
        });

        $("#distance_text").change(function () {
            var value = $("#distance_text").val();

            $("#distance").val(value);
            updateLineEntity();
        });

        $("#show_airplane").change(function () {
            plane.show = !plane.show;
        });

        $("#update_current_line").change(function () {
            updateCurrentLine = !updateCurrentLine;
        });

        $("#create_newline").click(function () {
            updateLineEntity(true);
        });

        var currentLineEntity;
        var updateCurrentLine = true;

        function updateLineEntity(createNew) {
            altitude = FEET_TO_METER * Number($("#model_altitude").val());

            plane.position._value = Cartesian3.fromDegrees(dubaiLongitude, dubaiLatitude, altitude);

            var heading = courseToCesiumHeading(Number($("#model_course").val()));

            var pitch = slopeToCesiumPitch(Number($("#model_slope").val()));

            var hpr = new HeadingPitchRoll(heading, pitch, 0);

            plane.orientation = Transforms.headingPitchRollQuaternion(plane.position._value, hpr);

            var matrix3Scratch = new Matrix3();

            var result = new Matrix4();

            result = Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(plane.orientation.valueOf(), matrix3Scratch), plane.position._value, result);

            var distance = Number($("#distance").val()) * NAUTICAL_TO_METER;

            var endPoint = new Cartesian3(distance, 0, 0);

            endPoint = Matrix4.multiplyByPoint(result, endPoint, new Cartesian3());

            if (updateCurrentLine) {
                if (currentLineEntity) viewer.entities.remove(currentLineEntity);

                currentLineEntity = viewer.entities.add({
                    name: "",
                    polyline: {
                        positions: [plane.position.getValue(0), endPoint],
                        material: new PolylineGlowMaterialProperty({
                            glowPower: 0.1,
                            color: Color.YELLOW
                        }),
                        width: 10
                    }
                });
            }

            if (createNew) {
                currentLineEntity = viewer.entities.add({
                    name: "",
                    polyline: {
                        positions: [plane.position.getValue(0), endPoint],
                        material: new PolylineGlowMaterialProperty({
                            glowPower: 0.1,
                            color: Color.YELLOW
                        }),
                        width: 10
                    }
                });
            }
        }

        updateLineEntity();
    }

    // proofApproachPath();

    function calcApproachPathEndPosition(startPosition, gradient, magneticDirection, course, distance) {
        var heading = courseToCesiumHeading(course, magneticDirection);

        var pitch = slopeToCesiumPitch(gradient);

        var hpr = new HeadingPitchRoll(heading, pitch, 0);

        var orientation = Transforms.headingPitchRollQuaternion(startPosition, hpr);

        var matrix3Scratch = new Matrix3();

        var result = new Matrix4();

        result = Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(orientation, matrix3Scratch), startPosition, result);

        distance = distance * NAUTICAL_TO_METER;

        var endPosition = new Cartesian3(distance, 0, 0);

        endPosition = Matrix4.multiplyByPoint(result, endPosition, new Cartesian3());

        return endPosition;
    }

    function loadApproachPathsData() {
        var url = "./assets/approach_paths.json";

        $.getJSON(url, function (data) {
            $.each(data, async function (key, approachPath) {
                var startPointLongitude = approachPath.lng;
                var startPointLatitude = approachPath.lat;
                var startPointAltitude = approachPath.Altitude;
                var gradient = approachPath.Gradient;
                var magneticDirection = approachPath.Variation;

                //        var magneticDirection = -10;

                var course = approachPath.Course;
                var distance = approachPath.Distance;

                /*
                var startPointLongitude = 55.39472222222222;
                var startPointLatitude = 25.235833333333336;
                var startPointAltitude = 110;
                var gradient = 13;
                var course = 119;
                var distance = 5;
                 */

                var startPosition = Cartesian3.fromDegrees(startPointLongitude, startPointLatitude, startPointAltitude * FEET_TO_METER);
                var endPosition = calcApproachPathEndPosition(startPosition, gradient, magneticDirection, course, distance);

                var url = "./assets/models/Cesium_Air.glb";

                var fixedFrameTransform = Transforms.eastNorthUpToFixedFrame;

                var heading = courseToCesiumHeading(course, magneticDirection);

                var pitch = slopeToCesiumPitch(gradient);

                var hpr = new HeadingPitchRoll(heading, pitch, 0);

                if (g_enableAnimation) {
                    var model = await Model.fromGltfAsync({
                        url: url,
                        modelMatrix: Transforms.headingPitchRollToFixedFrame(startPosition, hpr, Ellipsoid.WGS84, fixedFrameTransform),
                        minimumPixelSize: 64
                    });
                    var planePrimitive = scene.primitives.add(model);
                }

                var pathPositions = [];

                pathPositions.push(startPosition);

                var positions;

                if (g_enableAnimation) {
                    positions = new CallbackProperty(function () {
                        return pathPositions;
                    }, false);
                } else positions = [startPosition, endPosition];

                var approachPathEntity = viewer.entities.add({
                    polyline: {
                        /*
                        positions: new CallbackProperty(function () {
                            return pathPositions;
                        }, false),*/

                        positions: positions,
                        // material : new PolylineArrowMaterialProperty(Color.RED),
                        material: Color.RED,
                        // width : 10,
                        width: 3,
                        arcType: ArcType.NONE,
                        distanceDisplayCondition: new DistanceDisplayCondition(0, DISPLAY_LIMIT)
                    }
                });

                if (!g_enableAnimation) return;

                var wall = viewer.entities.add({
                    wall: {
                        positions: new CallbackProperty(function () {
                            return pathPositions;
                        }, false),
                        material: Color.GREEN.withAlpha(0.3)
                    }
                });

                var axisPrimitiveForDebug;

                if (g_showPlanePrimitiveAxisForDebug) {
                    axisPrimitiveForDebug = viewer.scene.primitives.add(
                        new DebugModelMatrixPrimitive({
                            modelMatrix: new Matrix4(),
                            length: 300.0,
                            width: 5.0
                        })
                    );
                }

                g_approachPathDataArr.push({
                    planePrimitive: planePrimitive,
                    approachPathEntity: approachPathEntity,
                    wall: wall,
                    pathPositions: pathPositions,
                    axisPrimitiveForDebug: axisPrimitiveForDebug,
                    startPosition: startPosition,
                    endPosition: endPosition,
                    distance: Cartesian3.distance(startPosition, endPosition),
                    hpr: hpr
                });
            });
        });
    }
}

main();

// global variables
var viewer;
var g_approachPathDataArr = [];
var g_showPlanePrimitiveAxisForDebug = false;
var g_enableAnimation = true;

(function () {
    var FEET_TO_METER = 0.3048;
    var NAUTICAL_TO_METER = 1852;
    var airportZoomHeight = 8000;

    var terrainProviderViewModels = [];

    var MSARadius = 46000; // 25NM

    var DISPLAY_LIMIT = 500000;

    Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTIzNzQ4NS1iN2ZmLTQ3ZWQtYjU0OS1mZWI4Nzk0MjcwNDAiLCJpZCI6OTc4Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDkxODE3NH0.UUQf2vuc3PN3VPNSUYt5uAbrSv5irvkIe-A57Ocp6ow";

    terrainProviderViewModels.push(new Cesium.ProviderViewModel({
        name : 'Cesium World Terrain',
        iconUrl : Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        tooltip : 'High-resolution global terrain tileset curated from several datasources and hosted by Cesium ion',
        category: 'Cesium ion',
        creationFunction : function(){
            return Cesium.createWorldTerrain({
                requestWaterMask: true,
                requestVertexNormals: true
            });
        }
    }));

    viewer = new Cesium.Viewer('cesiumContainer', {
        infoBox: false,
        terrainProviderViewModels: terrainProviderViewModels,
        selectedTerrainProviderViewModel: terrainProviderViewModels [0],
        skyAtmosphere: false,
        shouldAnimate : true,
        requestRenderMode : true
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.logarithmicDepthBuffer = false;

    var airportBillboards = [];

    var kabulPosition = Cesium.Cartesian3.fromDegrees(69.2075, 34.5553, 5000000);
    var dubaiPosition = Cesium.Cartesian3.fromDegrees( 55.394722222222225, 25.235833333333336, 5000);
    var torontoPosition = Cesium.Cartesian3.fromDegrees( -79.66369444444445, 43.6744166666666666, 5000);

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
                    position : Cesium.Cartesian3.fromDegrees(airport.lng, airport.lat),
                    billboard :{
                        image : './assets/airport_pin_40_blue.png',
                        scale: 0.5,
                        heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
                        // if distance from the camera is less than 6000000, disable depth testing
                        disableDepthTestDistance: 6000000,
                        // if distance from the camera is less than 6000000.0, show it
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6000000.0)
                    },
                    airport: airport.AIRPORT,
                    latitude: airport.lat,
                    longitude: airport.lng
                });

                airportBillboards.push(airportBillboard);

                if(airport.MSADMS !== undefined) {
                    var circularPolygon4326 = ol.geom.Polygon.circular(
                        [airport.MSALng, airport.MSALat],
                        MSARadius,
                        /* Number of verticies */
                        32);

                    var coords = circularPolygon4326 .getCoordinates();

                    var positions = [];

                    for(var i = 0; i < coords[0].length; i++) {
                        positions.push(coords[0][i][0]); // longitude
                        positions.push(coords[0][i][1]); // latitude
                        positions.push(airport.altitude * FEET_TO_METER); // altitude
                    }

                    var fence = viewer.entities.add({
                        name : 'fence',
                        wall : {
                            positions : Cesium.Cartesian3.fromDegreesArrayHeights(positions),
                            material : Cesium.Color.RED.withAlpha(0.2),
                            outline : true,
                            outlineColor : Cesium.Color.WHITE,
                            outlineWidth: 2,
                            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, DISPLAY_LIMIT)
                        }
                    });
                }
            })
        });
    }

    var airportTooltipEntity = viewer.entities.add({
        label : {
            show : false,
            showBackground : true,
            font : '14px monospace',
            horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(15, 0),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
    });

    var scene = viewer.scene;

    // Mouse over the globe to see the cartographic position
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

    handler.setInputAction(function(movement) {
        var pickedObject = scene.pick(movement.position);

        if (Cesium.defined(pickedObject)) {
            airportTooltipEntity.label.show = false;

            var latitude = pickedObject.id.latitude;
            var longitude = pickedObject.id.longitude;

            // this is not airport!
            if(longitude === undefined || latitude === undefined)
                return;

            var carto = new Cesium.Cartographic(Cesium.Math.toRadians(longitude), Cesium.Math.toRadians(latitude), airportZoomHeight);
            var cartesianPosition = viewer.scene.globe.ellipsoid.cartographicToCartesian(carto);

            viewer.camera.flyTo({
                destination : cartesianPosition
            });

        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    handler.setInputAction(function(movement) {
        var pickedObject = scene.pick(movement.endPosition);

        // we need to check if picked object is airport entity
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.position)) {
            var latitude = pickedObject.id.latitude;
            var longitude = pickedObject.id.longitude;

            // picked object is not airport
            if(latitude == null || longitude == null)
                return;

            var carto = new Cesium.Cartographic(Cesium.Math.toRadians(longitude), Cesium.Math.toRadians(latitude));
            carto.height = viewer.scene.globe.getHeight(carto);

            airportTooltipEntity.position = pickedObject.id.position.getValue(0);

            airportTooltipEntity.position = viewer.scene.globe.ellipsoid.cartographicToCartesian(carto);
            airportTooltipEntity.label.show = true;
            airportTooltipEntity.label.text = pickedObject.id.airport;

        } else {
            airportTooltipEntity.label.show = false;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    viewer.camera.moveEnd.addEventListener(function () {
        if(airportBillboards.length > 0)
            return;

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

        return Cesium.Math.toRadians(heading);
    }

    function slopeToCesiumPitch(slope) {
        var pitch;

        if(slope >= 0)
            pitch = slope;
        else
            pitch = 360 + slope;

        return Cesium.Math.toRadians(pitch);
    }

    function proofApproachPath() {
        var dubaiLongitude =  55.39472222222222;
        var dubaiLatitude =  25.235833333333336;

        var altitude = 110 * FEET_TO_METER;

        var planePosition = Cesium.Cartesian3.fromDegrees(dubaiLongitude, dubaiLatitude, altitude);
        var heading = Cesium.Math.toRadians(0);

        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(planePosition, hpr);

        var url = "./assets/Cesium_Air.glb";

        var plane = viewer.entities.add({
            name : url,
            position : planePosition,
            orientation : orientation,
            model : {
                uri : url,
                minimumPixelSize : 128,
                maximumScale : 20000
            }
        });

        var hprRollZero = new Cesium.HeadingPitchRoll();

        /*
        The x axis points in the local east direction.
        The y axis points in the local north direction.
        The z axis points in the direction of the ellipsoid surface normal which passes through the position.
         */

        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(planePosition, hprRollZero, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame);
        //var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hprRollZero, Cesium.Ellipsoid.WGS84, Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'west'));
        scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
            modelMatrix : modelMatrix,
            length : 300.0,
            width : 5.0
        }));

        viewer.trackedEntity = plane;

        $("#model_altitude").range({
            onChange: function (value, percent) {
                $("#model_altitude_text").val(value);

                updateLineEntity();
            }
        });

        $("#model_altitude_text").change(function () {
            var value =  $("#model_altitude_text").val();

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
            var value =  $("#model_course_text").val();

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
            var value =  $("#model_slope_text").val();

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
            var value =  $("#distance_text").val();

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

            plane.position._value = Cesium.Cartesian3.fromDegrees(dubaiLongitude, dubaiLatitude, altitude);

            var heading = courseToCesiumHeading(Number($("#model_course").val()));

            var pitch = slopeToCesiumPitch(Number($("#model_slope").val()));

            var hpr = new Cesium.HeadingPitchRoll(heading, pitch , 0);

            plane.orientation = Cesium.Transforms.headingPitchRollQuaternion(plane.position._value, hpr);

            var matrix3Scratch = new Cesium.Matrix3();

            var result = new Cesium.Matrix4();

            result = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(plane.orientation.valueOf(), matrix3Scratch), plane.position._value, result);

            var distance = Number($("#distance").val()) * NAUTICAL_TO_METER;

            var endPoint = new Cesium.Cartesian3(distance, 0, 0);

            endPoint = Cesium.Matrix4.multiplyByPoint(result, endPoint, new Cesium.Cartesian3());

            if(updateCurrentLine) {
                if(currentLineEntity)
                    viewer.entities.remove(currentLineEntity);

                currentLineEntity = viewer.entities.add({
                    name : '',
                    polyline : {
                        positions : [plane.position.getValue(0), endPoint] ,
                        material : new Cesium.PolylineGlowMaterialProperty({
                            glowPower : 0.1,
                            color : Cesium.Color.YELLOW
                        }),
                        width : 10
                    }
                });
            }

            if(createNew){
                currentLineEntity = viewer.entities.add({
                    name : '',
                    polyline : {
                        positions : [plane.position.getValue(0), endPoint] ,
                        material : new Cesium.PolylineGlowMaterialProperty({
                            glowPower : 0.1,
                            color : Cesium.Color.YELLOW
                        }),
                        width : 10
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

    function loadApproachPathsData() {
        var url = "./assets/approach_paths.json";

        $.getJSON(url, function (data) {
            $.each(data, function (key, approachPath) {
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

                var startPosition = Cesium.Cartesian3.fromDegrees(startPointLongitude, startPointLatitude, startPointAltitude * FEET_TO_METER);
                var endPosition = calcApproachPathEndPosition(startPosition, gradient, magneticDirection, course, distance);

                var url = "./assets/Cesium_Air.glb";

                var fixedFrameTransform = Cesium.Transforms.eastNorthUpToFixedFrame;

                var heading = courseToCesiumHeading(course, magneticDirection);

                var pitch = slopeToCesiumPitch(gradient);

                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, 0);

                if(g_enableAnimation) {
                    var planePrimitive = scene.primitives.add(Cesium.Model.fromGltf({
                        url : url,
                        modelMatrix : Cesium.Transforms.headingPitchRollToFixedFrame(startPosition, hpr, Cesium.Ellipsoid.WGS84, fixedFrameTransform),
                        minimumPixelSize : 64
                    }));
                }

                var pathPositions = [];

                pathPositions.push(startPosition);

                var positions;

                if(g_enableAnimation) {
                    positions = new Cesium.CallbackProperty(function () {
                        return pathPositions;
                    }, false);
                }
                else
                    positions = [startPosition, endPosition];

                var approachPathEntity = viewer.entities.add({
                    polyline : {
                        /*
                        positions: new Cesium.CallbackProperty(function () {
                            return pathPositions;
                        }, false),*/

                        positions: positions,
                       // material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
                        material : Cesium.Color.RED,
                       // width : 10,
                        width : 3,
                        arcType : Cesium.ArcType.NONE,
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, DISPLAY_LIMIT)
                    }
                });

                if(!g_enableAnimation)
                    return;

                var wall = viewer.entities.add({
                    wall : {
                        positions: new Cesium.CallbackProperty(function () {
                            return pathPositions;
                        }, false),
                        material : Cesium.Color.GREEN.withAlpha(0.3)
                    }
                });

                var axisPrimitiveForDebug;

                if(g_showPlanePrimitiveAxisForDebug) {
                    axisPrimitiveForDebug = viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
                        modelMatrix : new Cesium.Matrix4(),
                        length : 300.0,
                        width : 5.0
                    }));
                }

                g_approachPathDataArr.push({
                   planePrimitive: planePrimitive,
                   approachPathEntity: approachPathEntity,
                   wall: wall,
                   pathPositions: pathPositions,
                   axisPrimitiveForDebug: axisPrimitiveForDebug,
                   startPosition: startPosition,
                   endPosition: endPosition,
                   distance: Cesium.Cartesian3.distance(startPosition, endPosition),
                   hpr: hpr
                });
            })
        });
    }
})();

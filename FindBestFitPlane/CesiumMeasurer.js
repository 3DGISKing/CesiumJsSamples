
var CesiumMeasurer = (function () {

    //constructor
    function _(cesiumWidget) {
        this._scene = cesiumWidget.scene;
        this._tooltip = createTooltip(cesiumWidget.container);
        this._cesiumViewer = cesiumWidget;
        this._debugSpheres = [];
        this._plane = null;
        this._positions = [];
        this._normalArrowEntity = null;
        this._firstVertexEntity = null;
        this._vertexEntities = [];
        this._vertexEllipsoidEntityRadius = 1;
        this._considerInterior = false;
        this._interiorGridGap = 0.0001; // in degree
        this._debugSamplePositions = true;
        this._SampleSphereRadius = 0.5;
    }

    function clone(from, to) {
        if (from == null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? clone(from[name], null) : to[name];
        }

        return to;
    }

    // shallow copy
    function copyOptions(options, defaultOptions) {
        var newOptions = clone(options), option;
        for(option in defaultOptions) {
            if(newOptions[option] === undefined) {
                newOptions[option] = clone(defaultOptions[option]);
            }
        }
        return newOptions;
    }

    function createTooltip(frameDiv) {
        var tooltip = function(frameDiv) {

            var div = document.createElement('DIV');
            div.className = "twipsy right";

            var arrow = document.createElement('DIV');
            arrow.className = "twipsy-arrow";
            div.appendChild(arrow);

            var title = document.createElement('DIV');
            title.className = "twipsy-inner";
            div.appendChild(title);

            this._div = div;
            this._title = title;

            // add to frame div and display coordinates
            frameDiv.appendChild(div);
        };

        tooltip.prototype.setVisible = function(visible) {
            this._div.style.display = visible ? 'block' : 'none';
        };

        tooltip.prototype.showAt = function(position, message) {
            if(position && message) {
                this.setVisible(true);
                this._title.innerHTML = message;
                this._div.style.left = position.x + 10 + "px";
                this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
            }
        };

        return new tooltip(frameDiv);
    }

    _.prototype.addToolbar = function (container, options ) {
        options = copyOptions(options, {container: container});
        return new _.Toolbar(this, options);
    };

    _.prototype._removeVertexEntities = function() {
        for (var i = 0; i < this._vertexEntities.length; i++)
            this._cesiumViewer.entities.remove(this._vertexEntities[i]);

        this._vertexEntities = [];

        this._firstVertexEntity = null;
    };

    _.prototype.cleanUp = function() {
        if ( this._prevEntity !== undefined) {
            this._cesiumViewer.entities.remove(this._prevEntity);
            this._prevEntity = undefined;
        }

        if (this._markers !== undefined) {
            this._markers.remove();
            this._markers = undefined;
        }

        this._tooltip.setVisible(false);

        for (var i = 0; i < this._debugSpheres.length; i++)
            this._cesiumViewer.entities.remove(this._debugSpheres[i]);

        this._debugSpheres = [];

        if(this._plane) {
            this._cesiumViewer.entities.remove(this._plane);
            this._plane = null;
        }

        if(this._mouseHandler) {
            this._mouseHandler.destroy();
            this._mouseHandler = null;
        }

        this._positions = [];

        if(this._normalArrowEntity) {
            this._cesiumViewer.entities.remove(this._normalArrowEntity);
            this._normalArrowEntity = null;
        }

        this._removeVertexEntities();

        this._isFocusingFirstVertex = false;

        if (this._labelEntity) {
            this._cesiumViewer.entities.remove(this._labelEntity);
            this._labelEntity = null;
        }
      };

    _.prototype.getCartesianFromWindowPosition = function(position){
        var scene = this._scene;

        scene.globe.depthTestAgainstTerrain = true;

        var pickRay = scene.camera.getPickRay(position);

        var result = scene.pickFromRay(pickRay);

        if(result)
            return result.position;
        else
            return null;
    };

    _.prototype._updateDrawingPolygon = function(cartesian) {
        var cartesians = Array.from(this._positions);

        cartesians.push(cartesian);

        if ( this._prevEntity !== undefined)
            this._cesiumViewer.entities.remove(this._prevEntity);

        var drawingPolygon = {
            polygon: {
                hierarchy: {
                    positions: cartesians
                },
                material: Cesium.Color.RED.withAlpha(0.5)
            }
        };

        this._prevEntity  = this._cesiumViewer.entities.add(drawingPolygon);
    };

    _.prototype._addVertexEllipsoidEntity = function(vertexCartesian) {
        var radius = this._vertexEllipsoidEntityRadius;

        var material = Cesium.Color.YELLOW.withAlpha(1);

        if(this._vertexEntities.length === 0)
            material = Cesium.Color.MAROON.withAlpha(1);

        var entity = this._cesiumViewer.entities.add({
            name : 'vertex',
            position: vertexCartesian,
            ellipsoid : {
                radii : new Cesium.Cartesian3(radius, radius, radius),
                material : material
            }
        });

        if(this._vertexEntities.length === 0)
            this._firstVertexEntity = entity;

        this._vertexEntities.push(entity);
    };

    _.prototype.startDrawing = function(options) {
        if(options._vertexEllipsoidEntityRadius !== undefined)
            this._vertexEllipsoidEntityRadius = options._vertexEllipsoidEntityRadius;

        var scene = this._scene;

        scene.globe.depthTestAgainstTerrain = true;
        var tooltip = this._tooltip;

        var minPoints = 3;

        var positions = [];
        this._positions = positions;

        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        this._mouseHandler = mouseHandler;

        var self = this;

        // Now wait for start
        mouseHandler.setInputAction(function(movement) {
            if(movement.position == null)
               return;

            var cartesian = this.getCartesianFromWindowPosition(movement.position);

            if (cartesian == null) {
                alert("Failed to get position! Please retry.");
                return;
            }

            if(self._isFocusingFirstVertex) {
                 self.stopDrawing();
                 return;
            }

            // add new point to point array
            // this one will move with the mouse
            positions.push(cartesian);

            self._addVertexEllipsoidEntity(cartesian);

            if(positions.length >= minPoints) {
                if ( this._prevEntity !== undefined)
                    this._cesiumViewer.entities.remove(this._prevEntity);

                var drawingPolygon = {
                    polygon: {
                        hierarchy: {
                            positions: positions
                        },
                        material: Cesium.Color.RED.withAlpha(0.5)
                    }
                };

                this._prevEntity  = this._cesiumViewer.entities.add(drawingPolygon);
            }
        }.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.endPosition;

            if(position == null)
                return;

            if(positions.length === 0) {
                tooltip.showAt(position, "<p>Click to add first point</p>");
                return;
            }

            var cartesian = this.getCartesianFromWindowPosition(position);

            if (cartesian == null)
                return;

            self._isFocusingFirstVertex = false;

            document.body.style.cursor = 'default';

            if(self._positions.length >= 2)
                self._updateDrawingPolygon(cartesian);

            // show tooltip
            tooltip.showAt(position, "<p>Click to add new point (" + positions.length + ")</p>" + (positions.length > minPoints ? "<p>Click first point to finish drawing</p>" : ""));

            if(positions.length >= 3 ) {
                var pickRay = scene.camera.getPickRay(position);

                var result = scene.pickFromRay(pickRay);

                if(result && result.object && result.object.id && result.object.id === self._firstVertexEntity) {
                    document.body.style.cursor = 'pointer';
                    tooltip.showAt(position, "<p>Click first point to finish drawing</p>");
                    self._isFocusingFirstVertex = true;
                }
            }
        }.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };

    _.prototype.stopDrawing = function() {
        if(this._mouseHandler !== undefined) {
           this._mouseHandler.destroy();
           this._mouseHandler = undefined;
        }

        if (this._prevEntity !== undefined)
            this._cesiumViewer.entities.remove(this._prevEntity);

        this._tooltip.setVisible(false);

        document.body.style.cursor = 'default';

        var finalPolygon = {
            polygon: {
                hierarchy: {
                    positions: this._positions
                },

                material: Cesium.Color.RED.withAlpha(0.5)
            }
        };

        this._prevEntity  = this._cesiumViewer.entities.add(finalPolygon);

        var result = this._collectPositionsInPolygon();

        result = this._calcBestFitPlane(result.cartesians, result.width, result.height);

        var normal = result.normal;

        var normalArrowStartPosition = result.normalArrowStartPosition;
        var normalArrowEndPosition = result.normalArrowEndPosition;

        // calc heading

        var transform = Cesium.Transforms.eastNorthUpToFixedFrame(normalArrowStartPosition);

        var invTransform = Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4());

        var transformedNormalArrowEndPosition = Cesium.Matrix4.multiplyByPoint(invTransform, normalArrowEndPosition, new Cesium.Cartesian3());

        var heading = Cesium.Cartesian3.angleBetween(new Cesium.Cartesian3(0, 1, 0), new Cesium.Cartesian3(transformedNormalArrowEndPosition.x, transformedNormalArrowEndPosition.y, 0));

        // calc pitch

        normalArrowStartPosition = Cesium.Cartesian3.normalize(normalArrowStartPosition, new Cesium.Cartesian3());

        var pitch = Cesium.Cartesian3.angleBetween(normalArrowStartPosition, normal);

        pitch = Cesium.Math.PI_OVER_TWO - pitch;

        heading = Cesium.Math.toDegrees(heading).toFixed(2);
        pitch = Cesium.Math.toDegrees(pitch).toFixed(2);

        var info = "Heading: " + heading + ", Pitch: " + pitch;

        this._labelEntity = this._cesiumViewer.entities.add({
            position:  result.normalArrowEndPosition,
            label : {
                text : info
            }
        });
     };

    _.prototype._collectPositionsInPolygon = function() {
        // first we collect polygon ' vertex

        var cartesians = this._positions;

        var count = 1;

        var cartesiansOfPolygon = [];

        for (i = 0; i < cartesians.length; i++) {
            var cartesian = cartesians[i];

            cartesiansOfPolygon.push(cartesian);

            count++;
        }

        var longitudeLatitudeArray = [];

        // get lat long array for polygon
        // and calc min max lat long

        var minLongitude = 180;
        var maxLongitude = -180;
        var minLatitude = 90;
        var maxLatitude = -90;

        for (var i = 0; i < cartesians.length; i++) {
            var carto  = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesians[i]);

            var longitude = Cesium.Math.toDegrees(carto.longitude);
            var latitude = Cesium.Math.toDegrees(carto.latitude);

            if(longitude < minLongitude)
                minLongitude = longitude;

            if(longitude > maxLongitude)
                maxLongitude = longitude;

            if(latitude < minLatitude)
                minLatitude = latitude;

            if(latitude > maxLatitude)
                maxLatitude = latitude;

            longitudeLatitudeArray.push([longitude, latitude]);
        }

        // Turf js requires first and last position are equivalent.

        longitudeLatitudeArray.push(longitudeLatitudeArray[0]);

        var turfPolygon = turf.polygon([longitudeLatitudeArray], { name: 'poly1' });

        // add grid point

        var height = 10000;

        var material = Cesium.Color.YELLOW.withAlpha(1);

        var debugSphereRadius = this._SampleSphereRadius;

        if(this._considerInterior) {
            var gap = this._interiorGridGap ; // about 10m

            // add grid point
            for (longitude = minLongitude; longitude <= maxLongitude; longitude += gap) {
                for (latitude = minLatitude; latitude <= maxLatitude; latitude += gap) {
                    var point = turf.point([longitude, latitude]);

                    if(!turf.booleanContains(turfPolygon, point))
                        continue;

                    // add sphere

                    cartographic = Cesium.Cartographic.fromDegrees(longitude, latitude, height);

                    cartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);

                    var rayPosition = cartesian;

                    var rayDirection = Cesium.Cartesian3.normalize(cartesian, new Cesium.Cartesian3());

                    rayDirection = Cesium.Cartesian3.negate(rayDirection, new Cesium.Cartesian3());

                    var ray = new Cesium.Ray(rayPosition, rayDirection);

                    var result = this._cesiumViewer.scene.pickFromRay(ray);

                    if(result == null)
                        continue;

                    cartesiansOfPolygon.push(result.position);

                    if(this._debugSamplePositions) {
                        var sphere = this._cesiumViewer.entities.add({
                            name : 'debug sphere',
                            position: result.position,
                            ellipsoid : {
                                radii : new Cesium.Cartesian3(debugSphereRadius, debugSphereRadius, debugSphereRadius),
                                material : material
                            }
                        });

                        this._debugSpheres.push(sphere);
                    }

                    console.log(count + ": " + longitude + " " + latitude);
                    count++;
                }
            }
        }

        // calc width and height
        var cartographic = Cesium.Cartographic.fromDegrees(minLongitude, minLatitude, 0);

        var cartesianA = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);

        cartographic = Cesium.Cartographic.fromDegrees(maxLongitude, minLatitude, 0);

        var cartesianB = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);

        var width = Cesium.Cartesian3.distance(cartesianA, cartesianB);

        cartographic = Cesium.Cartographic.fromDegrees(minLongitude, minLatitude, 0);

        cartesianA = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);

        cartographic = Cesium.Cartographic.fromDegrees(minLongitude, maxLatitude, 0);

        cartesianB = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);

        height = Cesium.Cartesian3.distance(cartesianA, cartesianB);

        return {
            cartesians: cartesiansOfPolygon,
            width: width,
            height: height
        };
    };

    _.prototype._calcBestFitPlane = function(cartesians, width, height) {
        // calc center

        var centerX = 0, centerY = 0, centerZ = 0;

        for(var i = 0; i < cartesians.length; i++) {
            var cartesian = cartesians[i];

            centerX += cartesian.x;
            centerY += cartesian.y;
            centerZ += cartesian.z;
        }

        centerX = centerX / cartesians.length;
        centerY = centerY / cartesians.length;
        centerZ = centerZ / cartesians.length;

        var Adata = [];
        var Bdata = [];

        for(i = 0; i < cartesians.length; i++) {
            cartesian = cartesians[i];

            var row = [cartesian.x, cartesian.y, 1];

            Adata.push(row);
            Bdata.push(-cartesian.z);
        }

        var A = math.matrix(Adata);
        var B = math.matrix(Bdata);

        //calc pseudo inverse

        var AT = math.transpose(A);

        var tmp = math.multiply(AT, A);

        tmp = math.inv(tmp);

        tmp = math.multiply(tmp, AT);

        var result = math.multiply(tmp, B);

        var resultArray = result.valueOf();

        var normal = new Cesium.Cartesian3(resultArray[0], resultArray[1], 1);

        var distance = resultArray[2] / Cesium.Cartesian3.magnitude(normal);

        normal = Cesium.Cartesian3.normalize(normal, new Cesium.Cartesian3());

        var planePosition = new Cesium.Cartesian3(centerX, centerY, centerZ);

        var normalArrowLength = Math.min(width, height);

        //var normalArrowLength = 1000000;

        normalArrowLength = normalArrowLength / 2;

        var extendedNormalVector = Cesium.Cartesian3.multiplyByScalar(normal, normalArrowLength, new Cesium.Cartesian3());

        var normalPosition = Cesium.Cartesian3.add(planePosition, extendedNormalVector, new Cesium.Cartesian3());

        this._normalArrowEntity = this._cesiumViewer.entities.add({
            name : 'normal arrow',
            polyline : {
                positions : [planePosition.clone(), normalPosition.clone()],
                width : 10,
                arcType : Cesium.ArcType.NONE,
                material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED)
            }
        });

        var normalInPlaneFrame = this.transformedPoint(planePosition, normalPosition);

        normalInPlaneFrame = Cesium.Cartesian3.normalize(normalInPlaneFrame.clone(), new Cesium.Cartesian3());

        this._plane = this._cesiumViewer.entities.add({
            name : 'best  plane',
            position: planePosition,
            plane : {
                plane : new Cesium.Plane(normalInPlaneFrame, 0),
                dimensions : new Cesium.Cartesian2(width, height),
                material : Cesium.Color.BLUE.withAlpha(0.5),
                outline : true,
                outlineColor : Cesium.Color.YELLOW
            }
        });

        return {
            normal: normal,
            normalArrowStartPosition: planePosition,
            normalArrowEndPosition: normalPosition
        }
    };

    // convert global point to local point
    _.prototype.transformedPoint = function(center, point) {
        var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);

        var invTransform = Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4());

        point = Cesium.Matrix4.multiplyByPoint(invTransform, point, new Cesium.Cartesian3());

        return point;
    };

     _.Toolbar = (function () {
        //constructor

        function _(cesiumMeasure, options) {
            //container must be specified

            if (!(Cesium.defined(options.container))) {
                throw new Cesium.DeveloperError('Container is required');
            }

            var drawOptions = {
                measureTerrainVolumeIcon: "./img/measure_terrain_volume.png",
                cleaningIcon: "./img/cleaning.png"
            };

            var toolbar = document.createElement('DIV');
            toolbar.className = 'cesiumMeasureToolbar';
            options.container.appendChild(toolbar);

            function addButton(imgUrl, callback) {
                var div = document.createElement('DIV');
                div.className = 'cesiumMeasureToolbarButton';
                toolbar.appendChild(div);
                div.onclick = callback;
                var span = document.createElement('SAPN');
                div.appendChild(span);
                var image = document.createElement('IMG');
                image.src = imgUrl;
                span.appendChild(image);
                return div;
            }

            addButton(drawOptions.measureTerrainVolumeIcon, function () {
               cesiumMeasure.startDrawing({});
            });

            addButton(drawOptions.cleaningIcon, function () {
                cesiumMeasure.cleanUp();
            })
        }

        return _;
    })();

    return _;
})();

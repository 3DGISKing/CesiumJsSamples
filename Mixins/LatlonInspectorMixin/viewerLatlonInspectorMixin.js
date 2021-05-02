(function () {
    function viewerLatlonMixin(viewer, options) {
        if (!Cesium.defined(viewer)) {
            throw new Cesium.DeveloperError('viewer is required.');
        }

        var latlonInspectorContainer = document.createElement("div");

        latlonInspectorContainer.className = "cesium-viewer-cesiumLatlonContainer";
        viewer.container.appendChild(latlonInspectorContainer);

        var latlonInspector = new LatlonInspector({
            viewer : viewer,
            container : latlonInspectorContainer,
            fractionDigits : options.fractionDigits
        });

        var oldDestroyFunction = viewer.destroy;

        viewer.destroy = function () {
            oldDestroyFunction.apply(viewer, arguments);
            latlonInspector.destroy();
        };

        Object.defineProperties(viewer, {
            latlonInspector : {
                get : function() {
                    return latlonInspector;
                }
            }
        });
    }

    function LatlonInspector(options) {
        this._viewer = options.viewer;
        this._fractionDigits = Cesium.defaultValue(options.fractionDigits, 2);
        this._started = true;

        this._createUI(options.container);

        this._initScreenSpaceEventHandler();

        this._entity = this._viewer.entities.add({
            label: {
                show: false,
                showBackground: true,
                font: "14px monospace",
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(15, 0)
            },
        });
    }

    LatlonInspector.prototype._createUI = function(container) {
        var inspectorDiv = document.createElement("div");

        inspectorDiv.className = "cesium-cesiumLatlonInspector";

        var titleDiv = document.createElement("div");

        titleDiv.textContent = "Latlon Inspector";
        titleDiv.className = "cesium-cesiumLatlonInspector-Title";

        inspectorDiv.appendChild(titleDiv);

        var startButton = document.createElement('button');

        inspectorDiv.appendChild(startButton);

        startButton.textContent = 'Start';

        startButton.className = "cesium-button";

        startButton.disabled = this._started;

        var stopButton = document.createElement('button');

        inspectorDiv.appendChild(stopButton);

        stopButton.textContent = 'Stop';

        stopButton.className = "cesium-button";

        stopButton.disabled = !this._started;

        container.appendChild(inspectorDiv);

        var self = this;

        startButton.onclick = function () {
            self._started = true;

            this.disabled = true;

            stopButton.disabled = false;
        };

        stopButton.onclick = function() {
            self._started = false;
            self._entity.label.show = false;

            this.disabled = true;

            startButton.disabled = false;
        };
    };

    LatlonInspector.prototype._initScreenSpaceEventHandler = function() {
        var viewer = this._viewer;
        var scene = viewer.scene;

        // Mouse over the globe to see the cartographic position
        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        this._handler = handler;

        var self = this;

        handler.setInputAction(function (movement) {
            if(!self.started)
                return;

            self._doLatlonInspect(movement.endPosition);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };

    LatlonInspector.prototype._doLatlonInspect = function(windowPosition) {
        var viewer = this._viewer;
        var scene = viewer.scene;
        var entity = this._entity;

        var cartesian = viewer.camera.pickEllipsoid(
            windowPosition,
            scene.globe.ellipsoid
        );

        if (cartesian) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);

            var longitudeString = Cesium.Math.toDegrees(
                cartographic.longitude
            ).toFixed(this._fractionDigits);

            var latitudeString = Cesium.Math.toDegrees(
                cartographic.latitude
            ).toFixed(this._fractionDigits);

            entity.position = cartesian;
            entity.label.show = true;
            entity.label.text =
                "Lon: " +
                ("   " + longitudeString).slice(-this._fractionDigits - 5) +
                "\u00B0" +
                "\nLat: " +
                ("   " + latitudeString).slice(-this._fractionDigits - 5) +
                "\u00B0";
        } else {
            entity.label.show = false;
        }
    };

    LatlonInspector.prototype.destroy = function() {
        if(this._handler)
            this._handler.destroy();

        if(this._entity)
            this._viewer.entities.remove(this._entity);
    };

    Object.defineProperties(LatlonInspector.prototype, {
        started : {
            get : function() {
                return this._started;
            }
        }
    });

    Cesium.viewerLatlonMixin = viewerLatlonMixin;
})();

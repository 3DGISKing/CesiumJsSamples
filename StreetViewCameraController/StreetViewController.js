Cesium.StreetViewController = (function () {
    var MAX_PITCH_IN_DEGREE = 88;
    var ROTATE_SPEED = -30;
    var HUMAN_EYE_HEIGHT = 10;
    var EXIT_HEIGHT = 1000;

    //constructor
    function StreetViewController(options) {
        this._enabled = false;
        this._cesiumViewer = options.cesiumViewer;
        this._canvas = this._cesiumViewer.canvas;
        this._camera = this._cesiumViewer.camera;

        /**
         * heading: angle with up direction
         * pitch:   angle with right direction
         * roll:    angle with look at direction
         */

        this._isMouseLeftButtonPressed = false;
        this._startMousePosition = null;
        this._mousePosition = null;

        this._headingWhenLeftClicked = null;
        this._pitchWhenLeftClicked = null;
        this._headingPitchChanged = false;

        this._entered = new Cesium.Event();
        this._exited = new Cesium.Event();
    }

    StreetViewController.prototype._init = function () {
        var canvas = this._cesiumViewer.canvas;

        this._screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(canvas);

        var self = this;

        this._screenSpaceHandler.setInputAction(function(movement) {
            self._onMouseLButtonClicked(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this._screenSpaceHandler.setInputAction(function(movement) {
            self._onMouseMove(movement);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this._screenSpaceHandler.setInputAction(function(movement) {
            self._onMouseUp(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        // needed to put focus on the canvas
        canvas.setAttribute('tabindex', '0');

        canvas.onclick = function() {
            canvas.focus();
        };
    };

    StreetViewController.prototype._onMouseLButtonClicked = function (movement) {
        this._isMouseLeftButtonPressed = true;
        this._mousePosition = this._startMousePosition = Cesium.Cartesian3.clone(movement.position);

        this._headingWhenLeftClicked = Cesium.Math.toDegrees(this._camera.heading);
        this._pitchWhenLeftClicked = Cesium.Math.toDegrees(this._camera.pitch);
    };

    StreetViewController.prototype._move = function(movement) {
        var scene = this._cesiumViewer.scene;

        var pickRay = scene.camera.getPickRay(movement.position);

        var result = scene.pickFromRay(pickRay);

        if(!result)
        {
            console.warn("scene.pickFromRay(pickRay) returned null!");
            return;
        }

        var cameraPosition = this._cesiumViewer.camera.position;

        var globe = this._cesiumViewer.scene.globe;

        var cameraCartographic = globe.ellipsoid.cartesianToCartographic(cameraPosition);

        var cartographic = globe.ellipsoid.cartesianToCartographic(result.position);

        cartographic.height = cameraCartographic.height;

        this._camera.flyTo({
            destination : globe.ellipsoid.cartographicToCartesian(cartographic),
            orientation : {
                heading : this._camera.heading,
                pitch :  0,
                roll : 0.0
            },
            //easingFunction: Cesium.EasingFunction.LINEAR_NONE,
            maximumHeight : cameraCartographic.height
        });
    };

    StreetViewController.prototype._doExit = function() {
        var cameraPosition = this._cesiumViewer.camera.position;

        var globe = this._cesiumViewer.scene.globe;

        var cameraCartographic = globe.ellipsoid.cartesianToCartographic(cameraPosition);

        cameraCartographic.height = EXIT_HEIGHT;

        this._camera.flyTo({
            destination : globe.ellipsoid.cartographicToCartesian(cameraCartographic),
            orientation : {
                heading : this._camera.heading,
                pitch :  -Cesium.Math.PI_OVER_SIX,
                roll : 0
            }
        });

        this._screenSpaceHandler.destroy();
    };

    StreetViewController.prototype._doEnter = function(movement) {
        var scene = this._cesiumViewer.scene;

        scene.globe.depthTestAgainstTerrain = true;

        var pickRay = scene.camera.getPickRay(movement.position);

        var result = scene.pickFromRay(pickRay);

        if(!result)
        {
            console.warn("scene.pickFromRay return null!");
            return false;
        }

        var globe = this._cesiumViewer.scene.globe;

        var cartographic = globe.ellipsoid.cartesianToCartographic(result.position);

        cartographic.height = cartographic.height + HUMAN_EYE_HEIGHT;

        this._camera.flyTo({
            destination : globe.ellipsoid.cartographicToCartesian(cartographic),
            orientation : {
                heading : this._camera.heading,
                pitch :  0,
                roll : 0
            }
        });

        return true;
    };

    StreetViewController.prototype._onMouseMove = function (movement) {
        this._mousePosition = movement.endPosition;

        if(this._isMouseLeftButtonPressed)
            this._changeCameraHeadingPitchByMouse(0);
    };

    //noinspection JSUnusedLocalSymbols
    StreetViewController.prototype._onMouseUp = function (position) {
        this._isMouseLeftButtonPressed = false;

        if(!this._enabled)
            return;

        if(!this._headingPitchChanged)
            this._move(position);

        this._headingPitchChanged = false;
    };

    StreetViewController.prototype._enableDisableDefaultCameraController = function (enable) {
        var scene = this._cesiumViewer.scene;

        // disable the default event handlers

        scene.screenSpaceCameraController.enableRotate = enable;
        scene.screenSpaceCameraController.enableTranslate = enable;
        scene.screenSpaceCameraController.enableZoom = enable;
        scene.screenSpaceCameraController.enableTilt = enable;
        scene.screenSpaceCameraController.enableLook = enable;
    };

    StreetViewController.prototype._changeCameraHeadingPitchByMouse = function (dt) {
        var width = this._canvas.clientWidth;
        var height = this._canvas.clientHeight;

        // Coordinate (0.0, 0.0) will be where the mouse was clicked.
        var deltaX = (this._mousePosition.x - this._startMousePosition.x) / width;
        var deltaY = -(this._mousePosition.y - this._startMousePosition.y) / height;

        if(Cesium.Math.equalsEpsilon(deltaX, 0, Cesium.Math.EPSILON6 ) && Cesium.Math.equalsEpsilon(deltaY, 0, Cesium.Math.EPSILON6 ))
            return;

        this._headingPitchChanged = true;

        var deltaHeadingInDegree = (deltaX * ROTATE_SPEED);
        var newHeadingInDegree = this._headingWhenLeftClicked + deltaHeadingInDegree;

        var deltaPitchInDegree = (deltaY * ROTATE_SPEED);
        var newPitchInDegree = this._pitchWhenLeftClicked + deltaPitchInDegree;

        if( newPitchInDegree > MAX_PITCH_IN_DEGREE * 2 && newPitchInDegree < 360 - MAX_PITCH_IN_DEGREE) {
            newPitchInDegree = 360 - MAX_PITCH_IN_DEGREE;
        }
        else {
            if (newPitchInDegree > MAX_PITCH_IN_DEGREE && newPitchInDegree < 360 - MAX_PITCH_IN_DEGREE) {
                newPitchInDegree = MAX_PITCH_IN_DEGREE;
            }
        }

        this._camera.setView({
            orientation: {
                heading : Cesium.Math.toRadians(newHeadingInDegree),
                pitch : Cesium.Math.toRadians(newPitchInDegree),
                roll : this._camera.roll
            }
        });
    };

    // public functions
    StreetViewController.prototype.enter = function () {
        if(this._enabled){
            console.warn("already entered street view state!");
            return;
        }

        // get screen center

        var width = this._canvas.width / 2;
        var height = this._canvas.height / 2;

        var movement = {};

        movement.position = new Cesium.Cartesian2(width, height);

        if(!this._doEnter(movement))
        {
            alert("Failed to enter StreetView!");
            return;
        }

        this._init();
        this._enableDisableDefaultCameraController(false);

        this._enabled = true;

        this._entered.raiseEvent();
    };

    StreetViewController.prototype.exit = function () {
        this._enableDisableDefaultCameraController(true);

        this._doExit();
        this._exited.raiseEvent();

        this._enabled = false;
    };

    StreetViewController.prototype.isEnabled = function () {
        return this._enabled;
    };

    StreetViewController.prototype.entered = function () {
        return this._entered;
    };

    StreetViewController.prototype.exited = function () {
        return this._exited;
    };

    return StreetViewController;
})();

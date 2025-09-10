
class StreetViewController {
    static MAX_PITCH_IN_DEGREE = 88;
    static ROTATE_SPEED = -30;
    static HUMAN_EYE_HEIGHT = 10;
    static EXIT_HEIGHT = 1000;

    constructor(options) {
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

    _init() {
        const canvas = this._cesiumViewer.canvas;
        this._screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(canvas);

        this._screenSpaceHandler.setInputAction((movement) => {
            this._onMouseLButtonClicked(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this._screenSpaceHandler.setInputAction((movement) => {
            this._onMouseMove(movement);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this._screenSpaceHandler.setInputAction((movement) => {
            this._onMouseUp(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        // needed to put focus on the canvas
        canvas.setAttribute("tabindex", "0");

        canvas.onclick = function () {
            canvas.focus();
        };
    }

    _onMouseLButtonClicked(movement) {
        this._isMouseLeftButtonPressed = true;
        this._mousePosition = this._startMousePosition = Cesium.Cartesian3.clone(movement.position);

        this._headingWhenLeftClicked = Cesium.Math.toDegrees(this._camera.heading);
        this._pitchWhenLeftClicked = Cesium.Math.toDegrees(this._camera.pitch);
    }

    _move(movement) {
        const scene = this._cesiumViewer.scene;
        const pickRay = scene.camera.getPickRay(movement.position);
        const result = scene.pickFromRay(pickRay);
        if (!result) {
            console.warn("scene.pickFromRay(pickRay) returned null!");
            return;
        }
        const cameraPosition = this._cesiumViewer.camera.position;
        const globe = this._cesiumViewer.scene.globe;
        const cameraCartographic = globe.ellipsoid.cartesianToCartographic(cameraPosition);
        const cartographic = globe.ellipsoid.cartesianToCartographic(result.position);
        cartographic.height = cameraCartographic.height;
        this._camera.flyTo({
            destination: globe.ellipsoid.cartographicToCartesian(cartographic),
            orientation: {
                heading: this._camera.heading,
                pitch: 0,
                roll: 0.0
            },
            //easingFunction: Cesium.EasingFunction.LINEAR_NONE,
            maximumHeight: cameraCartographic.height
        });
    }

    _doExit() {
        const cameraPosition = this._cesiumViewer.camera.position;
        const globe = this._cesiumViewer.scene.globe;
        const cameraCartographic = globe.ellipsoid.cartesianToCartographic(cameraPosition);
        cameraCartographic.height = StreetViewController.EXIT_HEIGHT;
        this._camera.flyTo({
            destination: globe.ellipsoid.cartographicToCartesian(cameraCartographic),
            orientation: {
                heading: this._camera.heading,
                pitch: -Cesium.Math.PI_OVER_SIX,
                roll: 0
            }
        });
        this._screenSpaceHandler.destroy();
    }

    _doEnter(movement) {
        const scene = this._cesiumViewer.scene;
        scene.globe.depthTestAgainstTerrain = true;
        const pickRay = scene.camera.getPickRay(movement.position);
        const result = scene.pickFromRay(pickRay);
        if (!result) {
            console.warn("scene.pickFromRay return null!");
            return false;
        }
        const globe = this._cesiumViewer.scene.globe;
        const cartographic = globe.ellipsoid.cartesianToCartographic(result.position);
        cartographic.height = cartographic.height + StreetViewController.HUMAN_EYE_HEIGHT;
        this._camera.flyTo({
            destination: globe.ellipsoid.cartographicToCartesian(cartographic),
            orientation: {
                heading: this._camera.heading,
                pitch: 0,
                roll: 0
            }
        });
        return true;
    }

    _onMouseMove(movement) {
        this._mousePosition = movement.endPosition;
        if (this._isMouseLeftButtonPressed) this._changeCameraHeadingPitchByMouse(0);
    }

    _onMouseUp(position) {
        this._isMouseLeftButtonPressed = false;
        if (!this._enabled) return;
        if (!this._headingPitchChanged) this._move(position);
        this._headingPitchChanged = false;
    }

    _enableDisableDefaultCameraController(enable) {
        const scene = this._cesiumViewer.scene;
        // disable the default event handlers
        scene.screenSpaceCameraController.enableRotate = enable;
        scene.screenSpaceCameraController.enableTranslate = enable;
        scene.screenSpaceCameraController.enableZoom = enable;
        scene.screenSpaceCameraController.enableTilt = enable;
        scene.screenSpaceCameraController.enableLook = enable;
    }

    _changeCameraHeadingPitchByMouse(dt) {
        const width = this._canvas.clientWidth;
        const height = this._canvas.clientHeight;
        // Coordinate (0.0, 0.0) will be where the mouse was clicked.
        const deltaX = (this._mousePosition.x - this._startMousePosition.x) / width;
        const deltaY = -(this._mousePosition.y - this._startMousePosition.y) / height;
        if (Cesium.Math.equalsEpsilon(deltaX, 0, Cesium.Math.EPSILON6) && Cesium.Math.equalsEpsilon(deltaY, 0, Cesium.Math.EPSILON6)) return;
        this._headingPitchChanged = true;
        const deltaHeadingInDegree = deltaX * StreetViewController.ROTATE_SPEED;
        let newHeadingInDegree = this._headingWhenLeftClicked + deltaHeadingInDegree;
        const deltaPitchInDegree = deltaY * StreetViewController.ROTATE_SPEED;
        let newPitchInDegree = this._pitchWhenLeftClicked + deltaPitchInDegree;
        if (newPitchInDegree > StreetViewController.MAX_PITCH_IN_DEGREE * 2 && newPitchInDegree < 360 - StreetViewController.MAX_PITCH_IN_DEGREE) {
            newPitchInDegree = 360 - StreetViewController.MAX_PITCH_IN_DEGREE;
        } else {
            if (newPitchInDegree > StreetViewController.MAX_PITCH_IN_DEGREE && newPitchInDegree < 360 - StreetViewController.MAX_PITCH_IN_DEGREE) {
                newPitchInDegree = StreetViewController.MAX_PITCH_IN_DEGREE;
            }
        }
        this._camera.setView({
            orientation: {
                heading: Cesium.Math.toRadians(newHeadingInDegree),
                pitch: Cesium.Math.toRadians(newPitchInDegree),
                roll: this._camera.roll
            }
        });
    }

    // public functions
    enter() {
        if (this._enabled) {
            console.warn("already entered street view state!");
            return;
        }
        // get screen center
        const width = this._canvas.width / 2;
        const height = this._canvas.height / 2;
        const movement = {};
        movement.position = new Cesium.Cartesian2(width, height);
        if (!this._doEnter(movement)) {
            alert("Failed to enter StreetView!");
            return;
        }
        this._init();
        this._enableDisableDefaultCameraController(false);
        this._enabled = true;
        this._entered.raiseEvent();
    }

    exit() {
        this._enableDisableDefaultCameraController(true);
        this._doExit();
        this._exited.raiseEvent();
        this._enabled = false;
    }

    isEnabled() {
        return this._enabled;
    }

    entered() {
        return this._entered;
    }

    exited() {
        return this._exited;
    }
}

Cesium.StreetViewController = StreetViewController;

async function main() {
    const viewer = new Cesium.Viewer("cesiumContainer", {});

    // Set the initial camera view to look at Manhattan
    const initialPosition = Cesium.Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 753);
    const initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);

    viewer.scene.camera.setView({
        destination: initialPosition,
        orientation: initialOrientation,
        endTransform: Cesium.Matrix4.IDENTITY
    });

    const tileset = new Cesium.Cesium3DTileset({ url: Cesium.IonResource.fromAssetId(5741) });

    viewer.scene.primitives.add(tileset);

    const streetViewController = new Cesium.StreetViewController({
        cesiumViewer: viewer
    });

    Sandcastle.addToolbarButton("Start", () => {
        if (streetViewController.isEnabled()) {
            alert("already started!");
            return;
        }

        streetViewController.entered().addEventListener(function () {
            console.log("streetViewController started!");
        });

        streetViewController.enter();
    });

    Sandcastle.addToolbarButton("Stop", () => {
        if (!streetViewController.isEnabled()) {
            alert("not yet started!");
            return;
        }

        streetViewController.exited().addEventListener(function () {
            console.log("streetViewController stopped!");
        });

        streetViewController.exit();
    });
}

main();

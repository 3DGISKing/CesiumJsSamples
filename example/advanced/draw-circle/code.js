// https://community.cesium.com/t/slow-draw-sphere-circle-performance/41123

const { CallbackProperty, Cartesian3, Cartographic, Color, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer } =
    window.Cesium;

let semiMajorAxis = 1;
let semiMinorAxis = 1;

class CircleDrawer {
    constructor(viewer, onComplete) {
        this._viewer = viewer;
        this._camera = viewer.camera;
        this._scene = viewer.scene;
        this._onComplete = onComplete;

        this._centerCarto = null;
        this._centerCartesian = null;
        this._radiusMeters = 0;
        this._drawing = false;
        this._previewEntity = null;

        this._leftDown = this._leftDownHandler.bind(this);
        this._move = this._moveHandler.bind(this);
        this._leftUp = this._leftUpHandler.bind(this);
        this._handler = new ScreenSpaceEventHandler(this._viewer.canvas);
    }

    enable() {
        this._scene.screenSpaceCameraController.enableRotate = false;
        this._scene.screenSpaceCameraController.enableTranslate = false;

        this._handler.setInputAction(this._leftDown, ScreenSpaceEventType.LEFT_DOWN);
        this._handler.setInputAction(this._move, ScreenSpaceEventType.MOUSE_MOVE);
        this._handler.setInputAction(this._leftUp, ScreenSpaceEventType.LEFT_UP);
    }

    disable() {
        this._scene.screenSpaceCameraController.enableRotate = true;
        this._scene.screenSpaceCameraController.enableTranslate = true;

        this._handler.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
        this._handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
        this._handler.removeInputAction(ScreenSpaceEventType.LEFT_UP);

        if (this._previewEntity) {
            this._viewer.entities.remove(this._previewEntity);
            this._previewEntity = null;
        }

        this._centerCarto = null;
        this._centerCartesian = null;
        this._radiusMeters = 0;
        this._drawing = false;
    }

    _leftDownHandler(clickEvent) {
        const ray = this._camera.getPickRay(clickEvent.position);
        const cartesian = this._scene.globe.pick(ray, this._scene);
        if (!cartesian) return;

        this._centerCartesian = cartesian.clone();
        this._centerCarto = Cartographic.fromCartesian(cartesian);

        this._previewEntity = this._viewer.entities.add({
            position: Cartesian3.fromRadians(this._centerCarto.longitude, this._centerCarto.latitude, 0),
            ellipse: {
                semiMajorAxis: new CallbackProperty(function () {
                    return semiMajorAxis;
                }, false),
                semiMinorAxis: new CallbackProperty(function () {
                    return semiMinorAxis;
                }, false),
                height: 0,
                extrudedHeight: 0,
                material: Color.BLUE.withAlpha(0.3),
                outline: true,
                outlineColor: Color.BLUE
            }
        });

        this._drawing = true;
    }

    _moveHandler(moveEvent) {
        if (!this._drawing) return;
        const ray = this._camera.getPickRay(moveEvent.endPosition);
        const cartesian = this._scene.globe.pick(ray, this._scene);
        if (!cartesian) return;

        // measure horizontal distance at ground (height = 0)
        const centerFlat = Cartesian3.fromRadians(this._centerCarto.longitude, this._centerCarto.latitude, 0);
        const currentCarto = Cartographic.fromCartesian(cartesian);
        const currentFlat = Cartesian3.fromRadians(currentCarto.longitude, currentCarto.latitude, 0);
        this._radiusMeters = Cartesian3.distance(centerFlat, currentFlat);

        // update the ellipse’s axes
        if (this._previewEntity && this._previewEntity.ellipse) {
            semiMajorAxis = this._radiusMeters;
            semiMinorAxis = this._radiusMeters;
        }
    }

    _leftUpHandler(upEvent) {
        if (!this._drawing) return;
        const ray = this._camera.getPickRay(upEvent.position);
        const cartesian = this._scene.globe.pick(ray, this._scene);
        if (cartesian) {
            const centerFlat = Cartesian3.fromRadians(this._centerCarto.longitude, this._centerCarto.latitude, 0);
            const currentCarto = Cartographic.fromCartesian(cartesian);
            const currentFlat = Cartesian3.fromRadians(currentCarto.longitude, currentCarto.latitude, 0);
            this._radiusMeters = Cartesian3.distance(centerFlat, currentFlat);
        }

        // Remove the fast ellipse preview
        if (this._previewEntity) {
            this._viewer.entities.remove(this._previewEntity);
            this._previewEntity = null;
        }

        // Call back with centerCarto and radius
        this._onComplete(this._centerCarto, this._radiusMeters);

        this._drawing = false;
        this.disable();
    }
}

const viewer = new Viewer("cesiumContainer");
const circleDrawer = new CircleDrawer(viewer, (finalRect) => {});

circleDrawer.enable();

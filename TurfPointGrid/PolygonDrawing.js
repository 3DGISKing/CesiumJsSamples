const PolygonDrawing = (function () {
    const Check = Cesium.Check;
    const defined = Cesium.defined;

    const Cartesian2 = Cesium.Cartesian2;
    const Cartesian3 = Cesium.Cartesian3;

    const clickDistanceScratch = new Cartesian2();
    const cart3Scratch = new Cartesian3();

    const mouseDelta = 10;

    const DrawingMode = {
        BeforeDraw : 0,
        Drawing : 1,
        AfterDraw : 2
    };

    function PolygonDrawing(options) {
        const scene = options.scene;
        const primitives = scene.primitives;
        this._pointOptions = options.pointOptions;

        this._scene = scene;
        this._primitives = primitives;

        const points = primitives.add(new Cesium.PointPrimitiveCollection());

        this._polygon = primitives.add(new PolygonPrimitive({
            color : options.polygonOptions.color
        }));

        this._polyline = primitives.add(new PolylinePrimitive({
            loop : true,
            color : options.polylineOptions.color
        }));

        this._pointCollection = points;

        this._positions = [];
        this._points = [];
        this._mode = DrawingMode.BeforeDraw;
        this._lastClickPosition = new Cartesian2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

        this._mouseHandler = new MouseHandler({
            scene: scene,
            polygonDrawing : this
        });

        this._started = false;
    }

    PolygonDrawing.prototype.reset = function() {
        this._positions = [];
        this._polyline.positions = [];
        this._polygon.positions = [];
        this._polyline.show = false;
        this._polygon.show = false;

        const points = this._points;
        const pointCollection = this._pointCollection;

        for (let i = 0; i < points.length; i++) {
            pointCollection.remove(points[i]);
        }

        points.length = 0;

        this._mode = DrawingMode.BeforeDraw;
        this._lastClickPosition.x = Number.POSITIVE_INFINITY;
        this._lastClickPosition.y = Number.POSITIVE_INFINITY;
    };

    PolygonDrawing.prototype.startDrawing = function(){
        this._mouseHandler.activate();

        this._started = true;
    };

    PolygonDrawing.prototype.stopDrawing = function(){
        this.reset();
        this._mouseHandler.deactivate();

        this._started = false;
    };

    PolygonDrawing.prototype.addPoint = function(position) {
        const positions = this._positions;

        positions.push(position);

        this._polyline.positions = positions;
        this._polygon.positions = positions;

        const point = this._pointCollection.add(this._pointOptions);

        point.position = position;
        point.show = true;

        this._polyline.show = true;
        this._polygon.show = true;

        this._points.push(point);
    };

    PolygonDrawing.prototype.handleClick = function(clickPosition) {
        if (this._mode === DrawingMode.AfterDraw) {
            this.reset();
        }

        const lastClickPos = this._lastClickPosition;
        const distance = Cartesian2.magnitude(Cartesian2.subtract(lastClickPos, clickPosition, clickDistanceScratch));

        if (distance < mouseDelta) {
            return;
        }

        const position = getWorldPosition(this._scene, clickPosition, cart3Scratch);

        if (!defined(position)) {
            return;
        }

        this.addPoint(Cartesian3.clone(position, new Cartesian3()));
        this._mode = DrawingMode.Drawing;

        Cartesian2.clone(clickPosition, lastClickPos);
    };

    PolygonDrawing.prototype.handleDoubleClick = function() {
        // expect point to be added by handleClick
        this._mode = DrawingMode.AfterDraw;

        // Sometimes a move event is fired between the ending
        // click and doubleClick events, so make sure the polyline
        // and polygon have the correct positions.
        const positions = this._positions;

        this._polyline.positions = positions;
        this._polygon.positions = positions;
    };

    PolygonDrawing.prototype.positions = function () {
        return this._positions;
    };

    PolygonDrawing.prototype.started = function () {
        return this._started;
    };

    var cartesianScratch = new Cartesian3();
    var rayScratch = new Cesium.Ray();

    function getWorldPosition(scene, mousePosition, result) {
        Check.defined('scene', scene);
        Check.defined('mousePosition', mousePosition);
        Check.defined('result', result);

        var position;
        if (scene.pickPositionSupported) {

            var pickedObject = scene.pick(mousePosition, 1, 1);

            if (defined(pickedObject) && (pickedObject instanceof Cesium.Cesium3DTileFeature ||
                pickedObject.primitive instanceof Cesium.Cesium3DTileset ||
                pickedObject.primitive instanceof Cesium.Model)) { // check to let us know if we should pick against the globe instead
                position = scene.pickPosition(mousePosition, cartesianScratch);

                if (defined(position)) {
                    return Cartesian3.clone(position, result);
                }
            }
        }

        if (!defined(scene.globe)) {
            return;
        }

        var ray = scene.camera.getPickRay(mousePosition, rayScratch);
        position = scene.globe.pick(ray, scene, cartesianScratch);

        if (defined(position)) {
            return Cartesian3.clone(position, result);
        }
    }

    return PolygonDrawing;
})();




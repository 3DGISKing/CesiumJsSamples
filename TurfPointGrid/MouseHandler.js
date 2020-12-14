const MouseHandler = (function () {
    const ScreenSpaceEventType = Cesium.ScreenSpaceEventType;

    function MouseHandler(options) {
        const scene = options.scene;
        this._polygonDrawing = options.polygonDrawing;

        this._sseh = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        this._scene = scene;
    }

    MouseHandler.prototype.activate = function() {
        const sseh = this._sseh;

        sseh.setInputAction(this._click.bind(this), ScreenSpaceEventType.LEFT_CLICK);
        sseh.setInputAction(this._handleDoubleClick.bind(this), ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };

    MouseHandler.prototype.deactivate = function() {
        const sseh = this._sseh;

        sseh.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        sseh.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };

    MouseHandler.prototype._click = function(click) {
        this._handleClick(click, false);
    };

    MouseHandler.prototype._handleClick = function(click, shift) {
        this._polygonDrawing.handleClick(click.position, shift);
    };

    MouseHandler.prototype._handleDoubleClick = function(click) {
        this._polygonDrawing.handleDoubleClick(click.position);
    };

    return MouseHandler;
})();

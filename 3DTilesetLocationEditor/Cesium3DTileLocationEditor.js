"use strict";

window.Cesium3dTilesetLocationEditor = (function () {
    var X_AXIS_ENTITY_NAME = "X Axis";
    var Y_AXIS_ENTITY_NAME = "Y Axis";
    var Z_AXIS_ENTITY_NAME = "Z Axis";

    function _(cesiumViewer, tileset) {
        this._cesiumViewer = cesiumViewer;
        this._scene = cesiumViewer.scene;
        this._tileset = tileset;
        this._screenSpaceHandler = null;

        this._xAxisEntity = null;
        this._yAxisEntity = null;
        this._zAxisEntity = null;

        this._xArrowEntityPositions = null;
        this._yArrowEntityPositions = null;
        this._zArrowEntityPositions = null;

        this._xAxisEntitySelected = false;
        this._yAxisEntitySelected = false;
        this._zAxisEntitySelected = false;

        this._leftDown= false;
        this._leftDownCartesian = null;
        this._tilesetModelMatrixWhenLeftDown = null;

        this._arrowEntityWidth  = 80;
        this._arrowScaleFactor = 3;

        this._createAxesEntities();
        this._initEventHandlers();

        var transform = Cesium.Transforms.eastNorthUpToFixedFrame(tileset.boundingSphere.center);

        this._update(transform);

        this._visible = true;
    }

    _.prototype._disableDefaultCameraController = function () {
        var scene = this._cesiumViewer.scene;

        // disable the default event handlers

        scene.screenSpaceCameraController.enableRotate = false;
        scene.screenSpaceCameraController.enableTranslate = false;
        scene.screenSpaceCameraController.enableZoom = false;
        scene.screenSpaceCameraController.enableTilt = false;
        scene.screenSpaceCameraController.enableLook = false;
    };

    _.prototype._enableDefaultCameraController = function () {
        var scene = this._cesiumViewer.scene;

        // disable the default event handlers

        scene.screenSpaceCameraController.enableRotate = true;
        scene.screenSpaceCameraController.enableTranslate = true;
        scene.screenSpaceCameraController.enableZoom = true;
        scene.screenSpaceCameraController.enableTilt = true;
        scene.screenSpaceCameraController.enableLook = true;
    };

    _.prototype._initEventHandlers = function() {
        this._screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(this._scene.canvas);

        var self = this;

        this._screenSpaceHandler.setInputAction(function(movement) {
            if(!self._visible)
                return;

            self._onScreeSpaceLeftDown(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this._screenSpaceHandler.setInputAction(function(movement) {
            if(!self._visible)
                return;

            self._onScreeSpaceMove(movement);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this._screenSpaceHandler.setInputAction(function(movement) {
            if(!self._visible)
                return;

            self._onScreeSpaceLeftUp(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

    };

    _.prototype._onScreeSpaceLeftDown = function(movement) {
        this._leftDown = true;

        var pick = viewer.scene.pick(movement.position);

        if (!Cesium.defined(pick))
            return;

        if(!Cesium.defined(pick.id))
            return;

        this._xAxisEntitySelected = pick.id.id === this._xAxisEntity.id;
        this._yAxisEntitySelected = pick.id.id === this._yAxisEntity.id;
        this._zAxisEntitySelected = pick.id.id === this._zAxisEntity.id;

        if(this._xAxisEntitySelected || this._yAxisEntitySelected || this._zAxisEntitySelected)
            this._disableDefaultCameraController();

        if(this._xAxisEntitySelected) {
            console.log("XAxis selected!");
        }

        if(this._yAxisEntitySelected) {
            console.log("YAxis selected!");
        }

        if(this._zAxisEntitySelected) {
            console.log("ZAxis selected!");
        }

        this._leftDownCartesian = this._cesiumViewer.scene.pickPosition(movement.position);

        var transform = Cesium.Transforms.eastNorthUpToFixedFrame(tileset.boundingSphere.center);

        this._tilesetModelMatrixWhenLeftDown = transform.clone();
    };

    _.prototype._onScreeSpaceLeftUp = function(movement) {
        this._leftDown = false;

        this._xAxisEntitySelected = false;
        this._yAxisEntitySelected = false;
        this._zAxisEntitySelected = false;

        this._enableDefaultCameraController();
    };

    _.prototype._onScreeSpaceMove = function(movement) {
        if(!this._leftDown)
            return;

        if(!this._xAxisEntitySelected && !this._yAxisEntitySelected && !this._zAxisEntitySelected)
            return;

        var pickedObject = this._cesiumViewer.scene.pick(movement.endPosition);

        if(!Cesium.defined(pickedObject))
            return;

        if(pickedObject.id !== this._xAxisEntity && pickedObject.id !== this._yAxisEntity && pickedObject.id !== this._zAxisEntity)
            return;

        var currentCartesian = this._cesiumViewer.scene.pickPosition(movement.endPosition);

        if(!currentCartesian)
            return;

        var delta;

        if(this._xAxisEntitySelected)
            delta = this._deltaAlongXAxisOfLocal(currentCartesian);

        if(this._yAxisEntitySelected)
            delta = this._deltaAlongYAxisOfLocal(currentCartesian);

        if(this._zAxisEntitySelected)
            delta = this._deltaAlongZAxisOfLocal(currentCartesian);

        var matrix = this._tilesetModelMatrixWhenLeftDown.clone();

        matrix[12] += delta.x;
        matrix[13] += delta.y;
        matrix[14] += delta.z;

        //this._tileset.modelMatrix = matrix;

        //ugi
        var matrix1 = Cesium.Matrix4.IDENTITY.clone();

        matrix1[12] += delta.x;
        matrix1[13] += delta.y;
        matrix1[14] += delta.z;

        this._tileset.modelMatrix = matrix1;

        this._update(matrix);
    };

    _.prototype._deltaAlongXAxisOfLocal = function (currentCartesian) {
        var xProjectionOfLeftDownPointInLocalFrame = this._xAxisProjectionInLocal(this._leftDownCartesian, this._tilesetModelMatrixWhenLeftDown);
        var xProjectionOfCurrentPointInLocalFrame = this._xAxisProjectionInLocal(currentCartesian, this._tilesetModelMatrixWhenLeftDown);

        var deltaXInLocalFrame = xProjectionOfCurrentPointInLocalFrame - xProjectionOfLeftDownPointInLocalFrame;

        return this._getDeltaInGlobalAlongLocalXAxis(deltaXInLocalFrame, this._tilesetModelMatrixWhenLeftDown);
    };

    _.prototype._deltaAlongYAxisOfLocal = function (currentCartesian) {
        var yProjectionOfLeftDownPointInLocalFrame = this._yAxisProjectionInLocal(this._leftDownCartesian, this._tilesetModelMatrixWhenLeftDown);
        var yProjectionOfCurrentPointInLocalFrame = this._yAxisProjectionInLocal(currentCartesian, this._tilesetModelMatrixWhenLeftDown);

        var deltaYInLocalFrame = yProjectionOfCurrentPointInLocalFrame - yProjectionOfLeftDownPointInLocalFrame;

        return this._getDeltaInGlobalAlongLocalYAxis(deltaYInLocalFrame, this._tilesetModelMatrixWhenLeftDown);
    };

    _.prototype._deltaAlongZAxisOfLocal = function (currentCartesian) {
        var zProjectionOfLeftDownPointInLocalFrame = this._zAxisProjectionInLocal(this._leftDownCartesian, this._tilesetModelMatrixWhenLeftDown);
        var zProjectionOfCurrentPointInLocalFrame = this._zAxisProjectionInLocal(currentCartesian, this._tilesetModelMatrixWhenLeftDown);

        var deltaZInLocalFrame = zProjectionOfCurrentPointInLocalFrame - zProjectionOfLeftDownPointInLocalFrame;

        return this._getDeltaInGlobalAlongLocalZAxis(deltaZInLocalFrame, this._tilesetModelMatrixWhenLeftDown);
    };

    /*
        get x axis projection in local frame for given point
        cartesian is defined in global
    */
    _.prototype._xAxisProjectionInLocal = function(cartesian, localFrameMatrix) {
        var invMatrix = Cesium.Matrix4.inverseTransformation(localFrameMatrix, new Cesium.Matrix4());

        // convert to local
        var transformedCartesian = Cesium.Matrix4.multiplyByPoint(invMatrix, cartesian, new Cesium.Cartesian3());

        return transformedCartesian.x;
    };

    _.prototype._yAxisProjectionInLocal = function(cartesian, localFrameMatrix) {
        var invMatrix = Cesium.Matrix4.inverseTransformation(localFrameMatrix, new Cesium.Matrix4());

        // convert to local
        var transformedCartesian = Cesium.Matrix4.multiplyByPoint(invMatrix, cartesian, new Cesium.Cartesian3());

        return transformedCartesian.y;
    };

    _.prototype._zAxisProjectionInLocal = function(cartesian, localFrameMatrix) {
        var invMatrix = Cesium.Matrix4.inverseTransformation(localFrameMatrix, new Cesium.Matrix4());

        // convert to local
        var transformedCartesian = Cesium.Matrix4.multiplyByPoint(invMatrix, cartesian, new Cesium.Cartesian3());

        return transformedCartesian.z;
    };

    _.prototype._getDeltaInGlobalAlongLocalXAxis = function(distance, localFrameMatrix) {
        var cartesian = new Cesium.Cartesian3(distance, 0, 0);

        var movedPosition  = Cesium.Matrix4.multiplyByPoint(localFrameMatrix, cartesian, new Cesium.Cartesian3());
        var origin = Cesium.Matrix4.getTranslation(localFrameMatrix, new Cesium.Cartesian3());

        return Cesium.Cartesian3.subtract(movedPosition, origin, new Cesium.Cartesian3());
    };

    _.prototype._getDeltaInGlobalAlongLocalYAxis = function(distance, localFrameMatrix) {
        var cartesian = new Cesium.Cartesian3(0, distance, 0);

        var movedPosition  = Cesium.Matrix4.multiplyByPoint(localFrameMatrix, cartesian, new Cesium.Cartesian3());
        var origin = Cesium.Matrix4.getTranslation(localFrameMatrix, new Cesium.Cartesian3());

        return Cesium.Cartesian3.subtract(movedPosition, origin, new Cesium.Cartesian3());
    };

    _.prototype._getDeltaInGlobalAlongLocalZAxis = function(distance, localFrameMatrix) {
        var cartesian = new Cesium.Cartesian3(0, 0, distance);

        var movedPosition  = Cesium.Matrix4.multiplyByPoint(localFrameMatrix, cartesian, new Cesium.Cartesian3());
        var origin = Cesium.Matrix4.getTranslation(localFrameMatrix, new Cesium.Cartesian3());

        return Cesium.Cartesian3.subtract(movedPosition, origin, new Cesium.Cartesian3());
    };

    _.prototype._removeAllAxisEntities = function() {
        this._cesiumViewer.entities.remove(this._xAxisEntity);
        this._cesiumViewer.entities.remove(this._yAxisEntity);
        this._cesiumViewer.entities.remove(this._zAxisEntity);

        this._xAxisEntitySelected = false;
        this._yAxisEntitySelected = false;
        this._zAxisEntitySelected = false;
    };

    _.prototype._update = function(matrix) {
        this._origin = Cesium.Matrix4.getTranslation(matrix, new Cesium.Cartesian3());

        var axisLength = this._getXArrowLength();

        var axisEndPosition = new Cesium.Cartesian3(axisLength, 0, 0);

        // convert local point to global
        var axisEndPositionCartesian  = Cesium.Matrix4.multiplyByPoint(matrix, axisEndPosition, new Cesium.Cartesian3());

        this._xArrowEntityPositions[0] = this._origin;
        this._xArrowEntityPositions[1] = axisEndPositionCartesian;

        axisLength = this._getYArrowLength();

        axisEndPosition = new Cesium.Cartesian3(0, axisLength, 0);

        // convert local point to global
        axisEndPositionCartesian  = Cesium.Matrix4.multiplyByPoint(matrix, axisEndPosition, new Cesium.Cartesian3());

        this._yArrowEntityPositions[0] = this._origin;
        this._yArrowEntityPositions[1] = axisEndPositionCartesian;

        axisLength = this._getZArrowLength();

        axisEndPosition = new Cesium.Cartesian3(0, 0, axisLength);

        // convert local point to global
        axisEndPositionCartesian  = Cesium.Matrix4.multiplyByPoint(matrix, axisEndPosition, new Cesium.Cartesian3());

        this._zArrowEntityPositions[0] = this._origin;
        this._zArrowEntityPositions[1] = axisEndPositionCartesian;
    };

    _.prototype._getXArrowLength = function() {
        var rootTile = this._tileset._root;
        var boundingVolume = rootTile.boundingVolume;

        var halfAxes = boundingVolume.boundingVolume.halfAxes;

        var axis = new Cesium.Cartesian3(halfAxes[0], halfAxes[1], halfAxes[2]);

        var axisLength = Cesium.Cartesian3.magnitude(axis);

        return axisLength * this._arrowScaleFactor;
    };

    _.prototype._getYArrowLength = function() {
        var rootTile = this._tileset._root;
        var boundingVolume = rootTile.boundingVolume;

        var halfAxes = boundingVolume.boundingVolume.halfAxes;

        var axis = new Cesium.Cartesian3(halfAxes[3], halfAxes[4], halfAxes[5]);

        var axisLength = Cesium.Cartesian3.magnitude(axis);

        return axisLength * this._arrowScaleFactor;
    };

    _.prototype._getZArrowLength = function() {
        var rootTile = this._tileset._root;
        var boundingVolume = rootTile.boundingVolume;

        var halfAxes = boundingVolume.boundingVolume.halfAxes;

        var axis = new Cesium.Cartesian3(halfAxes[6], halfAxes[7], halfAxes[8]);

        var axisLength = Cesium.Cartesian3.magnitude(axis);

        return axisLength * this._arrowScaleFactor;
    };

    _.prototype._createAxesEntities = function () {
        self = this;
        var arrowWidth = this._arrowEntityWidth;

        this._xArrowEntityPositions = [new Cesium.Cartesian3(), new Cesium.Cartesian3()];

        var xArrowPositionsCallback = function () {
            return self._xArrowEntityPositions;
        };

        this._xAxisEntity = viewer.entities.add({
            name : X_AXIS_ENTITY_NAME,
            polyline : {
                positions : new Cesium.CallbackProperty(xArrowPositionsCallback, false),
                width : arrowWidth,
                arcType : Cesium.ArcType.NONE,
                material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED)
            }
        });

        this._yArrowEntityPositions = [new Cesium.Cartesian3(), new Cesium.Cartesian3()];

        var yArrowPositionsCallback = function () {
            return self._yArrowEntityPositions;
        };

        this._yAxisEntity = viewer.entities.add({
            name : Y_AXIS_ENTITY_NAME,
            polyline : {
                positions : new Cesium.CallbackProperty(yArrowPositionsCallback, false),
                width : arrowWidth,
                arcType : Cesium.ArcType.NONE,
                material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
            }
        });

        this._zArrowEntityPositions = [new Cesium.Cartesian3(), new Cesium.Cartesian3()];

        var zArrowPositionsCallback = function () {
            return self._zArrowEntityPositions;
        };

        this._zAxisEntity = viewer.entities.add({
            name : Z_AXIS_ENTITY_NAME,
            polyline : {
                positions : new Cesium.CallbackProperty(zArrowPositionsCallback, false),
                width : arrowWidth,
                arcType : Cesium.ArcType.NONE,
                material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE)
            }
        });
    };

    _.prototype.setVisible = function(visible)
    {
        this._visible = visible;

        this._xAxisEntity.show = visible;
        this._yAxisEntity.show = visible;
        this._zAxisEntity.show = visible;
    };

    return _;
}());

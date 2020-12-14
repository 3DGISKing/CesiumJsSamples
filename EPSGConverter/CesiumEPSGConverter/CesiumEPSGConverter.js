var CesiumEPSGConverter = (function () {
    function CesiumEPSGConverter(cesiumViewer, EPSGSRSId, geoidID) {
        this._destEPSG = this._findEPSG(EPSGSRSId);

        if(this._destEPSG === null) {

        }

        this._sourceEPSG = this._findEPSG(4326);

        this._DatumHeight = new DatumHeight(geoidID);

        this._cesiumViewer = cesiumViewer;
        this._scene = cesiumViewer.scene;

        this._scene.globe.depthTestAgainstTerrain = true;

        this._screenSpaceHandler = null;

        this._initEventHandlers();
    }

    CesiumEPSGConverter.prototype._findEPSG = function (srsid) {
        for(var i = 0; i < EPSGList.length; i++) {
            var EPSG = EPSGList[i];

            if(EPSG.srid === srsid)
                return EPSG;
        }

        return null;
    };

    CesiumEPSGConverter.prototype._initEventHandlers = function() {
        this._screenSpaceHandler = new Cesium.ScreenSpaceEventHandler(this._scene.canvas);

        var self = this;

        this._screenSpaceHandler.setInputAction(function(movement) {
            self._onScreeSpaceLeftDown(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this._screenSpaceHandler.setInputAction(function(movement) {
           self._onScreeSpaceMove(movement);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this._screenSpaceHandler.setInputAction(function(movement) {
            self._onScreeSpaceLeftUp(movement);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    };

    CesiumEPSGConverter.prototype._onScreeSpaceLeftDown = function(movement) {

    };

    CesiumEPSGConverter.prototype._onScreeSpaceMove = function(movement) {
        var locationInfo = document.getElementById("location_info");

        var cartesian = this._pick(movement.endPosition);

        if(!Cesium.defined(cartesian)) {
            if(locationInfo)
                locationInfo.innerHTML = "";

            return;
        }

        var carto = Cesium.Cartographic.fromCartesian(cartesian);

        var lon = Cesium.Math.toDegrees(carto.longitude);
        var lat = Cesium.Math.toDegrees(carto.latitude);
        var ellipsoidHeight = this._scene.globe.getHeight(carto);

        if(Cesium.Math.equalsEpsilon(ellipsoidHeight, 0, Cesium.Math.EPSILON3))
            ellipsoidHeight = 0;

        ellipsoidHeight = ellipsoidHeight.toFixed(3);

        var geoidValue = this._DatumHeight.height(lon, lat);
        var geoidHeight = ellipsoidHeight - geoidValue;

        var transformedPoint = proj4(this._sourceEPSG.parameters, this._destEPSG.parameters, [lon, lat]);

        var info = "proj=longlat ";
        info = info + " Longitude (deciamal degrees): " + lon.toFixed(3) + " Latitude (deciamal degrees): " + lat.toFixed(3);

        if(this._DatumHeight.valid())
            info = info + " proj=" + this._destEPSG.projection_acronym  + " Easting: " + transformedPoint[0] + " Northing: " + transformedPoint[1] + " Geoid Height (m): " + geoidHeight;
        else
            info = info + " proj=" + this._destEPSG.projection_acronym  + " Easting: " + transformedPoint[0] + " Northing: " + transformedPoint[1] + " Ellipsoid Height (m): " + ellipsoidHeight;

        if(locationInfo)
            locationInfo.innerHTML = info;
    };

    CesiumEPSGConverter.prototype._pick = function(cartesian2) {
        var scene = this._scene;

        var pickedObject = scene.pick(cartesian2);

        var cartesian;

        if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
            cartesian = this._cesiumViewer.scene.pickPosition(cartesian2);

            if (!Cesium.defined(cartesian))
                return cartesian;
        }

        var pickRay = scene.camera.getPickRay(cartesian2);

        // this give me wrong result.
        /*
        from scene

        var result = scene.pickFromRay(pickRay);

        if(result)
            return result.position;
         */

        /*
        from globe
        var result = scene.globe.pick(pickRay, scene);

        if(result)
           return result.;
        */

        cartesian = this._cesiumViewer.camera.pickEllipsoid(cartesian2, this._scene.globe.ellipsoid);

        if(Cesium.defined(cartesian))
            return cartesian;
        else
            return null;
    };

    CesiumEPSGConverter.prototype._onScreeSpaceLeftUp = function(movement) {
        var cartesian = this._pick(movement.position);

        if(!Cesium.defined(cartesian))
            return;

        var carto = Cesium.Cartographic.fromCartesian(cartesian);

        var lon = Cesium.Math.toDegrees(carto.longitude);
        var lat = Cesium.Math.toDegrees(carto.latitude);

        // var ellipsoidHeight = carto.height;

        var ellipsoidHeight = this._scene.globe.getHeight(carto);

        if(Cesium.Math.equalsEpsilon(ellipsoidHeight, 0, Cesium.Math.EPSILON3))
            ellipsoidHeight = 0;

        ellipsoidHeight = ellipsoidHeight.toFixed(3);

        var geoidValue = this._DatumHeight.height(lon, lat);
        var geoidHeight = ellipsoidHeight - geoidValue;

        var transformedPoint = proj4(this._sourceEPSG.parameters, this._destEPSG.parameters, [lon, lat]);

        var info = "proj=longlat\n";
        info = info + "Latitude (decimal degrees): " + lat + "\n";
        info = info + "Longitude (decimal degrees): " + lon + "\n";
        info = info + "Ellipsoid Height (m): " + ellipsoidHeight + "\n";

        if(this._DatumHeight.valid()) {
            info = info + "Geoid : " + this._DatumHeight.geoidID + " (Vertical)\n";
            info = info + "Geoid Height (m): " + geoidHeight + "\n";
            info = info + "Geoid value(m): " + geoidValue + "\n";
        }

        info = info + "EPSG(Horizontal): EPSG: " + this._destEPSG.srid + "\n";

        info = info + "proj=" + this._destEPSG.projection_acronym + "\n";
        info = info + "Easting: " + transformedPoint[0] + "\n";
        info = info + "Northing: " + transformedPoint[1] + "\n";

        alert(info);
    };

    return CesiumEPSGConverter;
})();

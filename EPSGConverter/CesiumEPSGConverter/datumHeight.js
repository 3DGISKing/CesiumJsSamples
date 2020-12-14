DatumHeight = (function () {
    function DatumHeight(geoidID) {
        this._tiffFile = geoidID + ".tif";
        this._geoTransform = null;
        this._image = null;
        this._raster = null;
        this._valid = false;
        this.geoidID = geoidID;

        if(this.geoidID !== "" && this.geoidID !== undefined)
            this._init();
    }

    DatumHeight.prototype.valid = function() {
        return this._valid;
    };

    DatumHeight.prototype._init = function() {
        var self = this;

        d3.request(this._tiffFile)
            .responseType('arraybuffer')
            .get(function(error, tiffData){
                if(error){
                    console.error("can not find tiff");
                    return;
                }

                self._valid = true;

                var tiff = GeoTIFF.parse(tiffData.response);
                var image = tiff.getImage();

                self._image = image;
                var rasters = image.readRasters();

                self._raster = rasters[0];

                var tiepoint = image.getTiePoints()[0];
                var pixelScale = image.getFileDirectory().ModelPixelScale;

                self._geoTransform =  [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1 * pixelScale[1]];
            });
    };

    DatumHeight.prototype._value = function (i, j) {
        return this._raster[i + j * this._image.getWidth()];
    };

    DatumHeight.prototype.height = function (longitude, latitude) {
        if(this._image === null)
            return 0;

        var pixelX = (longitude - this._geoTransform[0]) / this._geoTransform[1];
        var pixelY = (latitude - this._geoTransform[3])/ this._geoTransform[5];

        pixelX = Math.round(pixelX);
        pixelY = Math.round(pixelY);

        if(pixelX < 0 ||   pixelX >= this._image.getWidth())
            return 0;

        if(pixelY < 0 || pixelY >= this._image.getHeight())
            return 0;

        return this._value(pixelX, pixelY);
    };

    return DatumHeight;
})();

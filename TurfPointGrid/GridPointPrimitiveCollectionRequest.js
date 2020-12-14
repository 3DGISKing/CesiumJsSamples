const GridPointPrimitiveCollectionRequest = (function () {
    // utility function which converts the cartesian array to degree array
    function toDegrees(cartesians) {
        let ret = [];

        for(let i = 0; i < cartesians.length; i++) {
            const position = cartesians[i];

            const carto = Cesium.Cartographic.fromCartesian(position);

            const longitude = Cesium.Math.toDegrees(carto.longitude);
            const latitude = Cesium.Math.toDegrees(carto.latitude);

            ret.push([longitude, latitude]);
        }

        return ret;
    }

    // utility function which get turf js format BBox from the degree array
    function turfBBox(degrees) {
        let maxLongitude = -180;
        let minLongitude = 180;
        let maxLatitude = -90;
        let minLatitude = 90;

        for(let i = 0; i < degrees.length; i++) {
            const position = degrees[i];

            const longitude = position[0];
            const latitude = position[1];

            if(longitude > maxLongitude)
                maxLongitude = longitude;

            if(longitude < minLongitude)
                minLongitude = longitude;

            if(latitude > maxLatitude)
                maxLatitude = latitude;

            if(latitude < minLatitude)
                minLatitude = latitude;
        }

        return [minLongitude, minLatitude, maxLongitude, maxLatitude];
    }

    // utility class which makes point primitive collection for given polygon
    function GridPointPrimitiveCollectionRequest(options) {
        this._scene = options.scene;
        this._readyPromise = Cesium.when.defer();
        this._updateCount = options.updateCount;
        this._pointPrimitives = new Cesium.PointPrimitiveCollection();
        this._updatedIndex = 0;

        const worker = new Worker("GetPointsInGrid.js");

        // prepare parameters for web workers
        const degrees = toDegrees(options.cartesians);
        const bbox = turfBBox(degrees);

        // start web worker
        worker.postMessage({
            degrees : degrees,
            bbox: bbox,
            cellSide : options.cellSide,
        });

        // when receives the result from web worker
        worker.onmessage = (event) => {
            const pointsInGrid = event.data;

            console.log(pointsInGrid);

            this._pointsInGrid = pointsInGrid;

            // add event listener for post render event
            this._scene.postRender.addEventListener(GridPointPrimitiveCollectionRequest.prototype._onPostRender, this);
        };
    }

    // this will be invoked after each frame rendering
    GridPointPrimitiveCollectionRequest.prototype._onPostRender = function () {
        for (let i = 1 ; i <= this._updateCount; i++) {
            let index = this._updatedIndex + i;

            console.log(`completed ${index} / ${this._pointsInGrid.length}`);

            // all done so we resolve promise
            if(index >= this._pointsInGrid.length){
                this._scene.postRender.removeEventListener(GridPointPrimitiveCollectionRequest.prototype._onPostRender, this);
                this._readyPromise.resolve(this._pointPrimitives);
                break;
            }

            // get the real height and create point primitive
            let point = this._pointsInGrid[index];

            let cartographic = new Cesium.Cartographic(Cesium.Math.toRadians(point[0]), Cesium.Math.toRadians(point[1]));
            let sampledHeight = scene.sampleHeight(cartographic);

            this._pointPrimitives.add({
                color : Color.CYAN,
                position : Cartesian3.fromDegrees(point[0], point[1], sampledHeight)
            });
        }

        this._updatedIndex += this._updateCount;
    };

    Object.defineProperties(GridPointPrimitiveCollectionRequest.prototype,  {
        readyPromise : {
            get : function () {
                return this._readyPromise;
            }
        }
    });

    return GridPointPrimitiveCollectionRequest;
})();

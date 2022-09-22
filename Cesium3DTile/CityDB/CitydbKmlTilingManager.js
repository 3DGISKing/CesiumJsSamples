/*
 * 3DCityDB-Web-Map
 * http://www.3dcitydb.org/
 * 
 * Copyright 2015 - 2017
 * Chair of Geoinformatics
 * Technical University of Munich, Germany
 * https://www.gis.bgu.tum.de/
 * 
 * The 3DCityDB-Web-Map is jointly developed with the following
 * cooperation partners:
 * 
 * virtualcitySYSTEMS GmbH, Berlin <http://www.virtualcitysystems.de/>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 *
 * Tiling manager for controlling dynamic loading and unloading KML/KMZ Tiles data
 *
 **/
var GlobeTileTaskQueue = {};

(function () {
    function CitydbKmlTilingManager(citydbKmlLayerInstance) {
        this.oTask = null;
        this.citydbKmlLayerInstance = citydbKmlLayerInstance;
        this.dataPoolKml = new Object();
        this.networklinkCache = new Object();
        this.boundingboxEntity = null;
        this.timer = null;
        this.startPrefetching = true;
        this.taskNumber = 0;
    }

    function calculatePixels(tilePolygon, framePolygon) {
        var intersectedPolygon = intersectionPolygons(tilePolygon, framePolygon);
        var intersectedPixels = CitydbUtil.polygonArea(intersectedPolygon);
        if (intersectedPixels > 0) {
            var x1 = tilePolygon[0].x;
            var y1 = tilePolygon[0].y;
            var x2 = tilePolygon[1].x;
            var y2 = tilePolygon[1].y;
            var x3 = tilePolygon[2].x;
            var y3 = tilePolygon[2].y;
            var x4 = tilePolygon[3].x;
            var y4 = tilePolygon[3].y;
            var lengthOfDiagonal1 = Math.sqrt((x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3));
            var lengthOfDiagonal2 = Math.sqrt((x2 - x4) * (x2 - x4) + (y2 - y4) * (y2 - y4));
            var lengthOfDiagonal = (lengthOfDiagonal1 + lengthOfDiagonal2) / 2;
            return lengthOfDiagonal;
        }
        return Math.sqrt(intersectedPixels);
    }

    CitydbKmlTilingManager.prototype.doStart = function () {
        var scope = this;
        var workerPath = CitydbUtil.retrieveURL("CitydbKmlTilingManager");
        if (typeof workerPath == 'undefined') {
            workerPath = CitydbUtil.retrieveURL("3dcitydb-web-map-api");
        }
        this.oTask = new CitydbWebworker(workerPath + "Webworkers/CitydbKmlTilingManagerWebworker.js");
        var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
        var dataSourceCollection = cesiumViewer._dataSourceCollection;
        var cesiumWidget = cesiumViewer.cesiumWidget;
        var scene = cesiumWidget.scene;
        var camera = scene.camera;
        var canvas = scene.canvas;
        var globe = scene.globe;

        var minLodPixels = this.citydbKmlLayerInstance.minLodPixels;
        var maxLodPixels = this.citydbKmlLayerInstance.maxLodPixels;

        // start Highlighting Manager
        if (this.citydbKmlLayerInstance.isHighlightingActivated) {
            this.citydbKmlLayerInstance.citydbKmlHighlightingManager.doStart();
        }

        // displayed layers
        var dataPoolKml = this.dataPoolKml;

        // Caching
        var networklinkCache = this.networklinkCache;

        // Url of the data layer
        var masterUrl = this.citydbKmlLayerInstance.url;

        // parsing layer info..
        var jsonLayerInfo = this.citydbKmlLayerInstance._jsonLayerInfo;
        var hostAndPath = CitydbUtil.get_host_and_path_from_URL(masterUrl);
        var version = jsonLayerInfo.version;
        var layername = jsonLayerInfo.layername;
        var displayForm = jsonLayerInfo.displayform;
        var fileextension = jsonLayerInfo.fileextension;
        var colnum = jsonLayerInfo.colnum;
        var rownum = jsonLayerInfo.rownum;
        var gltfVersion = CitydbUtil.parse_query_string('gltf_version', window.location.href);
        if (gltfVersion == '0.8') {
            colnum = colnum + 1;
            rownum = rownum + 1;
        }
        var bbox = jsonLayerInfo.bbox;
        var rowDelta = (bbox.ymax - bbox.ymin) / (rownum);
        var colDelta = (bbox.xmax - bbox.xmin) / (colnum);
        scope.oTask.triggerEvent('createMatrix', bbox, rowDelta, colDelta, rownum, colnum);

        // create the master bounding box 
        scope.createBboxGeometry(bbox);

        //------------------------------below are the relevant listeners call from the worker--------------------------------//

        /**
         * 
         * remove the layers which are not in the vincity
         * 
         */
        this.oTask.addListener("removeDatasources", function () {
            for (var tileUrl in dataPoolKml) {
                var networklinkItem = dataPoolKml[tileUrl];
                var kmlDatasource = networklinkItem.kmlDatasource;
                var v1Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.lowerRightCorner);
                var v2Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.upperRightCorner);
                var v3Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.upperLeftCorner);
                var v4Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, networklinkItem.lowerLeftCorner);
                var clientWidth = canvas.clientWidth;
                var clientHeight = canvas.clientHeight;
                var tilePolygon = [{x: v1Pos.x, y: v1Pos.y}, {x: v2Pos.x, y: v2Pos.y}, {x: v3Pos.x, y: v3Pos.y}, {x: v4Pos.x, y: v4Pos.y}];
                var framePolygon = [{x: 0, y: 0}, {x: clientWidth, y: 0}, {x: clientWidth, y: clientHeight}, {x: 0, y: clientHeight}];
                var pixelCoveringSize = calculatePixels(tilePolygon, framePolygon);
                if (pixelCoveringSize < minLodPixels || pixelCoveringSize > maxLodPixels) {
                    dataSourceCollection.remove(kmlDatasource);
                    delete dataPoolKml[tileUrl];
                    scope.oTask.triggerEvent('updateDataPoolRecord');
                }
            }
            var promise = scope.createFrameBbox();
            Cesium.when(promise, function (frame) {
                scope.oTask.triggerEvent('checkDataPool', frame);
            });
        });

        /**
         * 
         * manage the caching and display of the objects
         * matrixItem -> [ minX, minY, maxX, maxY, colnum, rownum ]
         * 
         */
        this.oTask.addListener("checkMasterPool", function (matrixItem, taskQueue) {
            if (!Cesium.defined(matrixItem)) {
                scope.oTask.triggerEvent('updateTaskStack');
                return;
            }
            if (scope.timer != null) {
                scope.oTask.triggerEvent('pushTastItem', matrixItem);
                return;
            }
            var minX = matrixItem[0];
            var minY = matrixItem[1];
            var maxX = matrixItem[2];
            var maxY = matrixItem[3];

            var colIndex = matrixItem[4].col;
            var rowIndex = matrixItem[4].row;

            var tileUrl;
            if (version == "1.0.0") {
                tileUrl = hostAndPath + "Tiles/" + rowIndex + "/" + colIndex + "/" + layername + "_Tile_" + rowIndex + "_" + colIndex + "_" + displayForm + fileextension;
            } else {
                tileUrl = hostAndPath + layername + "_Tile_" + rowIndex + "_" + colIndex + "_" + displayForm + fileextension;
            }

            var lowerRightCorner;
            var upperRightCorner;
            var upperLeftCorner;
            var lowerLeftCorner;

            var clientWidth = canvas.clientWidth;
            var clientHeight = canvas.clientHeight;

            if (cesiumViewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
                lowerRightCorner = Cesium.Cartesian3.fromDegrees(maxX, minY);
                upperRightCorner = Cesium.Cartesian3.fromDegrees(maxX, maxY);
                upperLeftCorner = Cesium.Cartesian3.fromDegrees(minX, maxY);
                lowerLeftCorner = Cesium.Cartesian3.fromDegrees(minX, minY);

            } else {
                var intersectedPoint = pickGlobeOrEllipsoid(new Cesium.Cartesian2(clientWidth / 2, clientHeight), scene);
                if (typeof intersectedPoint == 'undefined') {
                    scope.oTask.triggerEvent('updateTaskStack');
                    scope.oTask.triggerEvent('updateDataPoolRecord');
                    return;
                }
                var terrainHeight = Cesium.Ellipsoid.WGS84.cartesianToCartographic(intersectedPoint).height;
                lowerRightCorner = Cesium.Cartesian3.fromDegrees(maxX, minY, terrainHeight);
                upperRightCorner = Cesium.Cartesian3.fromDegrees(maxX, maxY, terrainHeight);
                upperLeftCorner = Cesium.Cartesian3.fromDegrees(minX, maxY, terrainHeight);
                lowerLeftCorner = Cesium.Cartesian3.fromDegrees(minX, minY, terrainHeight);
            }

            var v1Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, lowerRightCorner);
            var v2Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, upperRightCorner);
            var v3Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, upperLeftCorner);
            var v4Pos = CitydbSceneTransforms.wgs84ToWindowCoordinates(scene, lowerLeftCorner);

            var tilePolygon = [{x: v1Pos.x, y: v1Pos.y}, {x: v2Pos.x, y: v2Pos.y}, {x: v3Pos.x, y: v3Pos.y}, {x: v4Pos.x, y: v4Pos.y}];
            var framePolygon = [{x: 0, y: 0}, {x: clientWidth, y: 0}, {x: clientWidth, y: clientHeight}, {x: 0, y: clientHeight}];
            var pixelCoveringSize = calculatePixels(tilePolygon, framePolygon);

            if (networklinkCache.hasOwnProperty(tileUrl)) {
                if (pixelCoveringSize >= minLodPixels && pixelCoveringSize <= maxLodPixels) {
                    if (!dataPoolKml.hasOwnProperty(tileUrl)) {
                        networklinkCache[tileUrl].cacheStartTime = new Date().getTime();
                        var networklinkItem = networklinkCache[tileUrl].networklinkItem;
                        networklinkItem.lowerRightCorner = lowerRightCorner;
                        networklinkItem.upperRightCorner = upperRightCorner;
                        networklinkItem.upperLeftCorner = upperLeftCorner;
                        networklinkItem.lowerLeftCorner = lowerLeftCorner;

                        var kmlDatasource = networklinkItem.kmlDatasource;
                        dataPoolKml[tileUrl] = networklinkItem;
                        var tmpId = CitydbUtil.generateUUID();
                        GlobeTileTaskQueue[tmpId] = tileUrl;
                        scope.taskNumber = taskQueue.length;

                        // loading data tile from Cache	
                        dataSourceCollection.add(kmlDatasource).then(function () {
                            delete GlobeTileTaskQueue[tmpId];
                            scope.oTask.triggerEvent('updateTaskStack');
                            scope.oTask.triggerEvent('updateDataPoolRecord');
                        }).otherwise(function (error) {
                            delete GlobeTileTaskQueue[tmpId];
                            scope.oTask.triggerEvent('updateTaskStack');
                        });
                    } else {
                        scope.oTask.triggerEvent('updateTaskStack');
                    }
                } else {
                    scope.oTask.triggerEvent('updateTaskStack');
                }
            } else {
                var newKmlDatasource = new CitydbKmlDataSource({
                    layerId: scope.citydbKmlLayerInstance.id,
                    camera: scope.citydbKmlLayerInstance.cesiumViewer.scene.camera,
                    canvas: scope.citydbKmlLayerInstance.cesiumViewer.scene.canvas
                });
                var newNetworklinkItem = {
                    url: tileUrl,
                    kmlDatasource: newKmlDatasource,
                    lowerRightCorner: lowerRightCorner,
                    upperRightCorner: upperRightCorner,
                    upperLeftCorner: upperLeftCorner,
                    lowerLeftCorner: lowerLeftCorner
                };

                if (pixelCoveringSize >= minLodPixels && pixelCoveringSize <= maxLodPixels) {
                    scope.oTask.triggerEvent('updateDataPoolRecord');
                    dataSourceCollection.add(newKmlDatasource);
                    dataPoolKml[tileUrl] = newNetworklinkItem;
                    networklinkCache[tileUrl] = {networklinkItem: newNetworklinkItem, cacheStartTime: new Date().getTime()};
                    var tmpId = CitydbUtil.generateUUID();
                    GlobeTileTaskQueue[tmpId] = tileUrl;
                    scope.taskNumber = taskQueue.length;
                    newKmlDatasource.load(tileUrl).then(function (dataSource) {
                        // loading data tile from Server
                        delete GlobeTileTaskQueue[tmpId];
                        scope.oTask.triggerEvent('updateTaskStack');
                    }).otherwise(function (error) {
                        delete GlobeTileTaskQueue[tmpId];
                        scope.oTask.triggerEvent('updateTaskStack');
                    });
                } else {
                    // prefetching...
                    if (matrixItem[4].preFetching && Object.keys(GlobeTileTaskQueue).length == 0) {
                        networklinkCache[tileUrl] = {networklinkItem: newNetworklinkItem, cacheStartTime: new Date().getTime()};
                        scope.taskNumber = taskQueue.length;
                        newKmlDatasource.load(tileUrl).then(function () {
                            if (scope.startPrefetching) {
                                scope.oTask.triggerEvent('updateTaskStack', 500);
                                scope.startPrefetching = false;
                            } else {
                                scope.oTask.triggerEvent('updateTaskStack', 500);
                            }
                            ;
                        }).otherwise(function (error) {
                            scope.oTask.triggerEvent('updateTaskStack');
                        });
                    } else {
                        matrixItem[4].preFetching = true;
                        scope.oTask.triggerEvent('pushTastItem', matrixItem);
                    }
                }
            }
        });

        /**
         * 
         * Cache Size = [number of displayed layers] + [cached layers]
         * [cached layers] should not be bigger than a threshold value...
         * 
         */
        scope.oTask.addListener("cleanCaching", function (maxCacheSize) {
            // default value
            var _maxCacheSize = scope.citydbKmlLayerInstance.maxSizeOfCachedTiles;

            if (Cesium.defined(maxCacheSize)) {
                _maxCacheSize = maxCacheSize;
            }

            var cacheSize = 0;
            var tempCache = new Object();
            for (var cacheID in networklinkCache) {
                if (!dataPoolKml.hasOwnProperty(cacheID)) {
                    tempCache[cacheID] = networklinkCache[cacheID].cacheStartTime;
                    cacheSize++;
                }
            }

            while (cacheSize > _maxCacheSize) {
                var cacheRecordMinTime = Number.MAX_VALUE;
                var cacheRocordID = null;
                for (var cacheID in tempCache) {
                    var cacheStartTime = tempCache[cacheID];
                    if (cacheStartTime < cacheRecordMinTime) {
                        cacheRecordMinTime = cacheStartTime;
                        cacheRocordID = cacheID;
                    }
                }
                tempCache[cacheRocordID] = Number.MAX_VALUE;
                Cesium.destroyObject(networklinkCache[cacheRocordID].networklinkItem.kmlDatasource);
                delete networklinkCache[cacheRocordID];
                cacheSize--;
            }
            //	console.log("Current Cache size is: " + Object.keys(scope.networklinkCache).length);		        										        							        			           
        });


        /**
         * 
         * update the status bar and Highlighting status of the KML objects		
         *  
         */
        scope.oTask.addListener("refreshView", function () {
            scope.oTask.oListeners["cleanCaching"].call(this);
            scope.oTask.sleep();

            // trigger Highlighting Manager again...
            if (scope.citydbKmlLayerInstance.isHighlightingActivated) {
                scope.citydbKmlLayerInstance.citydbKmlHighlightingManager.triggerWorker();
            }

            // Tiling manger keeps running to look up possible data tiles to be loaded event when Cesium idle...
            setTimeout(function () {
                scope.taskNumber = 0;
                scope.triggerWorker(false);
            }, 1000 + 1000 * Math.random());
        });

        //-------------------------------------------------------------------------------------------------//

        // event Listeners are so far, we start the Tiling Manager worker...
        var promise = scope.createFrameBbox();
        Cesium.when(promise, function (frame) {
            scope.oTask.triggerEvent('initWorker', frame, scope.citydbKmlLayerInstance.maxCountOfVisibleTiles);
        });

        this.runMonitoring();
    },
            CitydbKmlTilingManager.prototype.isDataStreaming = function () {
                if (this.oTask == null)
                    return false;
                return this.oTask.isSleep() ? false : true;
            },
            CitydbKmlTilingManager.prototype.clearCaching = function () {
                if (this.oTask == null)
                    return false;
                this.oTask.oListeners["cleanCaching"].call(this, 0);
            },
            /**
             * 
             * create and add bounding box geometry in Cesium
             * 
             */
            CitydbKmlTilingManager.prototype.createBboxGeometry = function (bbox) {
                var rectangle = Cesium.Rectangle.fromDegrees(bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax);
                var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
                this.boundingboxEntity = {
                    id: Cesium.createGuid(),
                    rectangle: {
                        coordinates: rectangle,
                        fill: false,
                        outline: true,
                        outlineWidth: 20,
                        outlineColor: Cesium.Color.BLUE
                    }
                }
                cesiumViewer.entities.add(this.boundingboxEntity);
            },
            /**
             * 
             * create bounding box in monitor coordinate system
             * 
             */
            CitydbKmlTilingManager.prototype.createFrameBbox = function () {
                var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
                var cesiumWidget = cesiumViewer.cesiumWidget;
                var scene = cesiumWidget.scene;
                var canvas = scene.canvas;
                var frameWidth = canvas.clientWidth;
                var frameHeight = canvas.clientHeight;

                var originHeight = 0;
                var stepSize = frameHeight / 10;

                return this.calcaulateFrameBbox(originHeight, stepSize, null);
            };

    CitydbKmlTilingManager.prototype.calcaulateFrameBbox = function (originHeight, stepSize, internalDeferred) {
        var scope = this;

        var deferred;
        if (internalDeferred == null) {
            deferred = Cesium.when.defer();
        } else {
            deferred = internalDeferred;
        }

        var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
        var cesiumWidget = cesiumViewer.cesiumWidget;
        var scene = cesiumWidget.scene;
        var camera = scene.camera;
        var canvas = scene.canvas;
        var globe = scene.globe;

        var frameWidth = canvas.clientWidth;
        var frameHeight = canvas.clientHeight;

        if (originHeight > frameHeight) {
            deferred.resolve(null);
        } else {
            var cartesian3LeftIndicator = pickGlobeOrEllipsoid(new Cesium.Cartesian2(0, originHeight), scene);
            var cartesian3RightIndicator = pickGlobeOrEllipsoid(new Cesium.Cartesian2(frameWidth, originHeight), scene);

            if (!Cesium.defined(cartesian3LeftIndicator) || !Cesium.defined(cartesian3RightIndicator)) {
                originHeight = originHeight + stepSize;
                scope.calcaulateFrameBbox(originHeight, stepSize, deferred);
            } else {
                var cartesian3OfFrameCorner1 = pickGlobeOrEllipsoid(new Cesium.Cartesian2(frameWidth, frameHeight), scene);
                var cartesian3OfFrameCorner2 = pickGlobeOrEllipsoid(new Cesium.Cartesian2(0, originHeight), scene);
                var cartesian3OfFrameCorner3 = pickGlobeOrEllipsoid(new Cesium.Cartesian2(0, frameHeight), scene);
                var cartesian3OfFrameCorner4 = pickGlobeOrEllipsoid(new Cesium.Cartesian2(frameWidth, originHeight), scene);

                if (Cesium.defined(cartesian3OfFrameCorner1) && Cesium.defined(cartesian3OfFrameCorner2) && Cesium.defined(cartesian3OfFrameCorner3) && Cesium.defined(cartesian3OfFrameCorner4)) {
                    var wgs84OfFrameCorner1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner1);
                    var wgs84OfFrameCorner2 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner2);
                    var wgs84OfFrameCorner3 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner3);
                    var wgs84OfFrameCorner4 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian3OfFrameCorner4);

                    var frameMinX = Math.min(Cesium.Math.toDegrees(wgs84OfFrameCorner1.longitude), Cesium.Math.toDegrees(wgs84OfFrameCorner2.longitude), Cesium.Math.toDegrees(wgs84OfFrameCorner3.longitude), Cesium.Math.toDegrees(wgs84OfFrameCorner4.longitude));
                    var frameMaxX = Math.max(Cesium.Math.toDegrees(wgs84OfFrameCorner1.longitude), Cesium.Math.toDegrees(wgs84OfFrameCorner2.longitude), Cesium.Math.toDegrees(wgs84OfFrameCorner3.longitude), Cesium.Math.toDegrees(wgs84OfFrameCorner4.longitude));
                    var frameMinY = Math.min(Cesium.Math.toDegrees(wgs84OfFrameCorner1.latitude), Cesium.Math.toDegrees(wgs84OfFrameCorner2.latitude), Cesium.Math.toDegrees(wgs84OfFrameCorner3.latitude), Cesium.Math.toDegrees(wgs84OfFrameCorner4.latitude));
                    var frameMaxY = Math.max(Cesium.Math.toDegrees(wgs84OfFrameCorner1.latitude), Cesium.Math.toDegrees(wgs84OfFrameCorner2.latitude), Cesium.Math.toDegrees(wgs84OfFrameCorner3.latitude), Cesium.Math.toDegrees(wgs84OfFrameCorner4.latitude));

                    var frame = {
                        minX: frameMinX,
                        maxX: frameMaxX,
                        minY: frameMinY,
                        maxY: frameMaxY
                    };
                    var funcName = CitydbUtil.generateUUID();
                    scope.oTask.triggerEvent('checkFrameBbox', funcName, frame);
                    scope.oTask.addListener(funcName, function (isValidFrame) {
                        if (isValidFrame) {
                            var refPoint = pickGlobeOrEllipsoid(new Cesium.Cartesian2(frameWidth / 2, frameHeight), scene);
                            var refX;
                            var refY;
                            if (Cesium.defined(refPoint)) {
                                var refPointCarto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(refPoint);
                                frame = {
                                    minX: frame.minX,
                                    maxX: frame.maxX,
                                    minY: frame.minY,
                                    maxY: frame.maxY,
                                    refX: Cesium.Math.toDegrees(refPointCarto.longitude),
                                    refY: Cesium.Math.toDegrees(refPointCarto.latitude)
                                }
                                deferred.resolve(frame);
                            } else {
                                deferred.resolve(null);
                            }
                        } else {
                            originHeight = originHeight + stepSize;
                            scope.calcaulateFrameBbox(originHeight, stepSize, deferred);
                        }
                        scope.oTask.removeListener(funcName);
                    });
                } else {
                    deferred.resolve(null);
                }
            }
        }
        return deferred.promise;
    }


    function pickGlobeOrEllipsoid(screenCoordinates, scene) {
        if (scene.mode == Cesium.SceneMode.SCENE3D) {
            return scene.globe.pick(scene.camera.getPickRay(screenCoordinates), scene);
        } else {
            return scene.camera.pickEllipsoid(screenCoordinates);
        }
    }

    /**
     * 
     * check if the Tiling manager is started of not
     * 
     */
    CitydbKmlTilingManager.prototype.isStarted = function () {
        if (this.oTask == null) {
            return false;
        } else {
            return true;
        }
    };

    /**
     * 
     * terminate the Tiling manager
     * 
     */
    CitydbKmlTilingManager.prototype.doTerminate = function () {
        if (this.oTask != null) {
            this.oTask.terminate();
            this.oTask = null;

            var cesiumViewer = this.citydbKmlLayerInstance._cesiumViewer;
            var dataSourceCollection = cesiumViewer._dataSourceCollection;

            for (var tileUrl in this.dataPoolKml) {
                var networklinkItem = this.dataPoolKml[tileUrl];
                var kmlDatasource = networklinkItem.kmlDatasource;
                dataSourceCollection.remove(kmlDatasource);
            }
            this.dataPoolKml = {};
            this.networklinkCache = {};

            if (this.boundingboxEntity != null) {
                cesiumViewer.entities.remove(this.boundingboxEntity);
            }

            // terminate Highlighting Manager
            if (this.citydbKmlLayerInstance.isHighlightingActivated) {
                this.citydbKmlLayerInstance.citydbKmlHighlightingManager.doTerminate();
            }
        }
    };

    /**
     * 
     * get worker instance
     * 
     */
    CitydbKmlTilingManager.prototype.getWorkerInstance = function () {
        return this.oTask;
    },
            /**
             * 
             * public function to trigger Tiling Manager
             * 
             */
            CitydbKmlTilingManager.prototype.triggerWorker = function (updateTaskQueue) {
                var scope = this;
                if (scope.oTask != null) {
                    if (scope.oTask.isSleep()) {
                        scope.oTask.wake();
                        scope.startPrefetching = true;
                        scope.oTask.triggerEvent('notifyWake');
                    } else {
                        if (updateTaskQueue) {
                            scope.startPrefetching = true;
                            scope.oTask.triggerEvent('abortAndnotifyWake');
                        }
                    }
                }
            },
            /**
             * 
             * Tiling manager and the highlighting events
             * 
             */
            CitydbKmlTilingManager.prototype.runMonitoring = function () {
                var scope = this;
                var cesiumViewer = this.citydbKmlLayerInstance.cesiumViewer;
                var scene = cesiumViewer.scene;
                scope.citydbKmlLayerInstance.registerEventHandler("VIEWCHANGED", function () {
                    if (scope.timer != null) {
                        clearTimeout(scope.timer);
                    }
                    scope.timer = setTimeout(function () {
                        scope.triggerWorker(true);
                        scope.timer = null;
                    }, 100 + 100 * Math.random());
                });
            };

    window.CitydbKmlTilingManager = CitydbKmlTilingManager;
})();
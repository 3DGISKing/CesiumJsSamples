(function() {
    (function() {
        var mapShelfHeight = 1000;

        var initialized = false;

        // default location : Grand Canyon
        const defaultCenterLng = -113.2665534;
        const defaultCenterLat = 36.0939345;

        const defaultWidth = 0.1 / 2;
        const defaultWest = defaultCenterLng - defaultWidth;
        const defaultEast = defaultCenterLng + defaultWidth;
        const defaultSouth = defaultCenterLat - defaultWidth;
        const defaultNorth = defaultCenterLat + defaultWidth;

        var west = defaultWest, east = defaultEast, north = defaultNorth, south = defaultSouth;

        const terrainProvider = Cesium.createWorldTerrain();

        function getUrlParam() {
            let urlParams = new URLSearchParams(window.location.search);

            if(!urlParams.has('west')){
                alert("west is required! default values will be used.");
                return false;
            }

            let west = parseFloat(urlParams.get('west'));

            if(isNaN(west))
                return false;

            if(!urlParams.has('east')){
                alert("east is required! default values will be used.");
                return false;
            }

            let east = parseFloat(urlParams.get('east'));

            if(isNaN(east))
                return false;

            if(!urlParams.has('south')){
                alert("south is required! default values will be used.");
                return false;
            }

            let south = parseFloat(urlParams.get('south'));

            if(isNaN(south))
                return false;

            if(!urlParams.has('north')){
                alert("north is required! default values will be used.");
                return false;
            }

            let north = parseFloat(urlParams.get('north'));

            if(isNaN(north))
                return false;

            return {
                west : west,
                east : east,
                south : south,
                north : north
            };
        }

        let ret = getUrlParam();

        if(ret !== false)
            west = ret.west, east = ret.east, north = ret.north, south = ret.south;

        var debugShowAxis = false;
        var debugShowBoundingBox = false;
        var debugShowCornerSpheres = false;
        var terrainExaggeration = 1;

        Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTIzNzQ4NS1iN2ZmLTQ3ZWQtYjU0OS1mZWI4Nzk0MjcwNDAiLCJpZCI6OTc4Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDkxODE3NH0.UUQf2vuc3PN3VPNSUYt5uAbrSv5irvkIe-A57Ocp6ow";

        var viewer = new Cesium.Viewer('cesiumContainer', {
            terrainProvider: terrainProvider,
            imageProvider : new Cesium.ArcGisMapServerImageryProvider({
                url:
                    "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
                enablePickFeatures: false,
            }),
            terrainExaggeration : terrainExaggeration,
            timeline : false,
            animation : false,
            baseLayerPicker : false,
            homeButton : false,
            sceneModePicker : false,
            navigationHelpButton : false,
            geocoder : false
        });

        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.skyAtmosphere.show = false;
        viewer.scene.skyBox.show = false;
        viewer.scene.backgroundColor = Cesium.Color.WHITE.clone();

        let globe = viewer.scene.globe;
        globe.backFaceCulling = true;
        globe.showSkirts = true;

        var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

        var centerLongi = west + (east - west) / 2;
        var centerLat = south + (north - south) / 2;

        var MAX_HEIGHT = 8848;

        var pc1_min = Cesium.Cartographic.fromDegrees(west, north);
        var p1_min = Cesium.Ellipsoid.WGS84.cartographicToCartesian(pc1_min);

        var pc1_max = Cesium.Cartographic.fromDegrees(west, north, MAX_HEIGHT);
        var p1_max = Cesium.Ellipsoid.WGS84.cartographicToCartesian(pc1_max);

        var pc2_min = Cesium.Cartographic.fromDegrees(east, north, 0);
        var p2_min = Cesium.Ellipsoid.WGS84.cartographicToCartesian(pc2_min);

        var pc2_max = Cesium.Cartographic.fromDegrees(east, north, MAX_HEIGHT);
        var p2_max = Cesium.Ellipsoid.WGS84.cartographicToCartesian(pc2_max);

        var pc3_min = Cesium.Cartographic.fromDegrees(east, south, 0);
        var p3_min = Cesium.Ellipsoid.WGS84.cartographicToCartesian(pc3_min);

        var pc3_max = Cesium.Cartographic.fromDegrees(east, south, MAX_HEIGHT);
        var p3_max = Cesium.Ellipsoid.WGS84.cartographicToCartesian(pc3_max);

        var pc4_min = Cesium.Cartographic.fromDegrees(west, south, 0);
        var p4_min = Cesium.Ellipsoid.WGS84.cartographicToCartesian(pc4_min);

        var pc4_max = Cesium.Cartographic.fromDegrees(west, south, MAX_HEIGHT);
        var p4_max = Cesium.Ellipsoid.WGS84.cartographicToCartesian(pc4_max);

        var distanceWidth = Cesium.Cartesian3.distance(p1_min, p2_min);
        var distanceHeight = Cesium.Cartesian3.distance(p2_min, p3_min);

        console.log(pc1_min.toString());
        console.log(`distanceWidth = ${distanceWidth}`);
        console.log(`distanceHeight = ${distanceHeight}`);

        var centerPosition = Cesium.Cartographic.toCartesian(new Cesium.Cartographic.fromDegrees(centerLongi, centerLat, 100));

        var clippingPlanesEnabled = true;
        var edgeStylingEnabled = false;

        globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            modelMatrix : Cesium.Transforms.eastNorthUpToFixedFrame(centerPosition),
            planes : [
                new Cesium.ClippingPlane(new Cesium.Cartesian3( 1.0,  0.0, 0.0), distanceWidth / 2),
                new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0,  0.0, 0.0), distanceWidth / 2),
                new Cesium.ClippingPlane(new Cesium.Cartesian3( 0.0,  1.0, 0.0), distanceHeight / 2),
                new Cesium.ClippingPlane(new Cesium.Cartesian3( 0.0, -1.0, 0.0), distanceHeight / 2 )
            ],
            unionClippingRegions : true,
            edgeWidth: edgeStylingEnabled ? 2.0 : 0.0,
            edgeColor: Cesium.Color.YELLOW,
            enabled: clippingPlanesEnabled,
        });

        if(debugShowAxis) {
            viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
                modelMatrix : Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(centerLongi, centerLat, 0), undefined, new Cesium.Matrix4()),
                length : distanceWidth,
                width : 5.0
            }));
        }

        var positions = [p1_min, p1_max, p2_min, p2_max, p3_min, p3_max,p4_min, p4_max];

        var boundingSphere = Cesium.BoundingSphere.fromPoints(positions);

        viewer.camera.flyToBoundingSphere(boundingSphere);

        viewer.scene.preRender.addEventListener(function() {
            if(viewer.scene.camera.pitch > -0.3) {
                globe.backFaceCulling = false;
                globe.showSkirts = false;
            }
            else {
                globe.backFaceCulling = true;
                globe.showSkirts = true;
            }
        });

        if(debugShowBoundingBox) {
            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(centerLongi, centerLat, 0.0),
                box: {
                    dimensions: new Cesium.Cartesian3(distanceWidth, distanceHeight, 2000.0),
                    material: Cesium.Color.WHITE.withAlpha(0.3),
                    outline: true,
                    outlineColor: Cesium.Color.WHITE,
                },
            });
        }

        if(debugShowCornerSpheres) {
            var debugShowCornerSphereRadius = 500;

            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(west, north, 1500.0),
                ellipsoid: {
                    radii: new Cesium.Cartesian3(debugShowCornerSphereRadius, debugShowCornerSphereRadius, debugShowCornerSphereRadius),
                    material: Cesium.Color.RED.withAlpha(0.5),
                    outline: true,
                    outlineColor: Cesium.Color.BLACK,
                },
            });

            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(east, north, 1500.0),
                ellipsoid: {
                    radii: new Cesium.Cartesian3(debugShowCornerSphereRadius, debugShowCornerSphereRadius, debugShowCornerSphereRadius),
                    material: Cesium.Color.RED.withAlpha(0.5),
                    outline: true,
                    outlineColor: Cesium.Color.BLACK,
                },
            });
        }

        viewer.scene.globe.tileLoadProgressEvent.addEventListener(function (queuedTileCount) {
            if(initialized)
                return;

            console.log(queuedTileCount);
            console.log(viewer.scene.globe.tilesLoaded);

            if(viewer.scene.globe.tilesLoaded){
                const terrainTileAvailability = terrainProvider.availability;

                const maximumLevel = terrainTileAvailability._maximumLevel;

                console.log(`maximumLevel = ${maximumLevel}`);

                //viewer.scene.globe._surface.tileProvider._debug.wireframe = true;

                const bestTerrainAvailableLevel = terrainTileAvailability.computeBestAvailableLevelOverRectangle(rectangle);

                console.log(`bestTerrainAvailableLevel = ${bestTerrainAvailableLevel}`);

                const heightMapWidth = terrainProvider._heightmapWidth;

                //var granularity =  Math.PI/ Math.pow(2, bestTerrainAvailableLevel);
                var granularity =  Math.PI/ Math.pow(2, bestTerrainAvailableLevel);

                granularity = granularity / (heightMapWidth - 1 );

                console.log(`granularity = ${granularity}`);

                granularity = Cesium.Math.toRadians(granularity);

                west = Cesium.Math.toRadians(west);
                east = Cesium.Math.toRadians(east);
                north = Cesium.Math.toRadians(north);
                south = Cesium.Math.toRadians(south);

                var northWestEastEdgePositions = [];

                for(var longitude = west; longitude <= east; longitude+= granularity) {
                    northWestEastEdgePositions.push(new Cesium.Cartographic(longitude, north))
                }

                for(latitude = north; latitude >= south; latitude-= granularity) {
                    northWestEastEdgePositions.push(new Cesium.Cartographic(east, latitude))
                }

                for(longitude = east; longitude >= west; longitude-= granularity) {
                    northWestEastEdgePositions.push(new Cesium.Cartographic(longitude, south))
                }

                for(var latitude = south; latitude <= north; latitude+= granularity) {
                    northWestEastEdgePositions.push(new Cesium.Cartographic(west, latitude))
                }

                Cesium.when(
                    Cesium.sampleTerrainMostDetailed(
                        viewer.terrainProvider,
                        northWestEastEdgePositions
                    ),
                    sampleTerrainSuccess
                );

                function sampleTerrainSuccess(terrainSamplePositions) {
                    var cartoArray = [];
                    var heights = [];

                    var minimumHeight = 8848;

                    for (var i = 0; i < terrainSamplePositions.length; ++i) {
                        var position = terrainSamplePositions[i];

                        cartoArray.push(position.longitude, position.latitude);
                        heights.push(position.height);

                        if(minimumHeight > position.height)
                            minimumHeight = position.height;
                    }

                    var minimumHeights = [];

                    for (i = 0; i < terrainSamplePositions.length; ++i) {
                        if(minimumHeight < mapShelfHeight)
                            minimumHeights.push(0);
                        else
                            minimumHeights.push(minimumHeight - mapShelfHeight);
                    }

                    viewer.entities.add({
                        wall: {
                            positions: Cesium.Cartesian3.fromRadiansArray(cartoArray),
                            maximumHeights: heights,
                            minimumHeights: minimumHeights,
                            material: new Cesium.Color(0.709, 0.792, 0.796),
                        },
                    });

                    var mapShelfBottomHeight = 100;
                    var boxCenterHeight;

                    if(minimumHeight < mapShelfHeight)
                        boxCenterHeight = -mapShelfBottomHeight / 2;
                    else
                        boxCenterHeight = (minimumHeight - mapShelfHeight) - mapShelfBottomHeight / 2;

                    viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(centerLongi, centerLat, boxCenterHeight),
                        box: {
                            dimensions: new Cesium.Cartesian3(distanceWidth, distanceHeight, mapShelfBottomHeight),
                            //material: Cesium.Color.RED,
                            material: new Cesium.Color(0.709, 0.792, 0.796),
                        },
                    });

                    initialized = true;
                    viewer.zoomTo(viewer.entities);
                }
            }
        });
    })();
})();



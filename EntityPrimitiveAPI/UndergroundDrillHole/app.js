Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTIzNzQ4NS1iN2ZmLTQ3ZWQtYjU0OS1mZWI4Nzk0MjcwNDAiLCJpZCI6OTc4Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDkxODE3NH0.UUQf2vuc3PN3VPNSUYt5uAbrSv5irvkIe-A57Ocp6ow";

const Viewer = Cesium.Viewer;
const createWorldTerrain= "cesium";
const Cartesian3 = Cesium.Cartesian3;
const CesiumMath= Cesium.Math;
const HeadingPitchRoll= Cesium.HeadingPitchRoll;
const Transforms = Cesium.Transforms;
const Matrix4 =Cesium.Matrix4;
const Color = Cesium.Color;
const defined = Cesium.defined;

    function App() {
        this._viewer = null;
        this._holes = null;

        this._init();

        let url = "./asset/Holes.json";

        this._holes = null;
        this._holesData = null;

        const self = this;

        $.getJSON(url, function (data) {
            self._holes = data;

            url = "./asset/HoleData.json";

            $.getJSON(url, function (data) {
                self._holesData = data;

                self._createDrillHolesEntities();
            });
        });
    }

    App.prototype._init = function() {
        let worldTerrain = Cesium.createWorldTerrain({
            requestWaterMask: true,
            requestVertexNormals: true
        });

        this._viewer = new Viewer("cesiumContainer", {
            //skyBox : false,
            //skyAtmosphere : false,
            terrainProvider: worldTerrain,
            // orderIndependentTranslucency: false
        });

        const viewer = this._viewer;

        //viewer.scene.screenSpaceCameraController.minimumZoomDistance = -this._maxToDistance;

        viewer.scene.screenSpaceCameraController.minimumZoomDistance = -195.65;

        this._enableUnderground();
    };

    App.prototype._createDrillHolesEntities = function () {
        const drillHoleRadius = 0.5;

        const holes = this._holes;

        for(let i = 0; i < holes.length; i++) {
            const hole = holes[i];

            const ID = hole['HoleID'];

            const latitude = hole['Lat'];
            const longitude = hole['Long'];
            const height = hole['Elevation'];

            this._viewer.entities.add({
                position: Cartesian3.fromDegrees(longitude, latitude, height),
                name: ID,
                billboard: {
                    image: 'http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png',
                    scale: 0.7,
                }
            });
        }

        let holesMinFrom = {};

        const holesData = this._holesData;

        this._holes = holes;

        const viewer = this._viewer;

        let maxToDistance = 0;

        for (let i = 0 ; i < holesData.length; i++) {
            const holeData = holesData[i];

            const holeID = holeData['Hole ID'];

            if(holeData == null)
                continue;

            const hole = this._getHole(holeID);

            if(hole == null)
                continue;

            const latitude = hole['Lat'];
            const longitude = hole['Long'];
            const height = hole['Elevation'];

            const dip = hole['DH_Dip'];
            const azimuth = hole['DH_Azimuth'];

            const position = Cartesian3.fromDegrees(longitude, latitude, height);

            const heading = CesiumMath.toRadians(azimuth);
            const pitch = CesiumMath.toRadians(dip + 90);

            const hpr = new HeadingPitchRoll(heading, pitch, 0);

            const matrix = Transforms.headingPitchRollToFixedFrame(position, hpr);

            const toDistance = parseFloat(holeData['To']);
            const fromDistance = parseFloat(holeData['From']);

            if(maxToDistance < toDistance)
                maxToDistance = toDistance;

            if(holesMinFrom[holeID] == null)
                holesMinFrom[holeID] = fromDistance;

            if(holesMinFrom[holeID] > fromDistance)
                holesMinFrom[holeID] = fromDistance;

            const length = toDistance- fromDistance;

            const middleDistance = fromDistance + length / 2;

            const localNewPosition = new Cartesian3(0, 0, -middleDistance);

            const newPosition = Matrix4.multiplyByPoint(matrix, localNewPosition, new Cartesian3());
            const orientation = Transforms.headingPitchRollQuaternion(newPosition, hpr);

            let entity = viewer.entities.add({
                name : holeID + ' ' + fromDistance + ' - ' + toDistance + ' (Dip : ' + dip + ' Azimuth : ' + azimuth + ')',
                position: newPosition,
                orientation: orientation,
                cylinder : {
                    length : length,
                    topRadius : drillHoleRadius,
                    bottomRadius : drillHoleRadius,
                    material :  Color.fromRandom().withAlpha(1.0),
                }
            });

            entity.description = 'data1 : ' + holeData['data1'] + ' data2 : ' + holeData['data2'] + ' data3 : ' + holeData['data3'];
        }

        console.info('maxToDistance : ' + maxToDistance);

        this._maxToDistance = maxToDistance;

        for (const holeID in holesMinFrom) {
            if (!holesMinFrom.hasOwnProperty(holeID))
                    continue;

            const hole = this._getHole(holeID);

            if(hole == null)
                continue;


            const latitude = hole['Lat'];
            const longitude = hole['Long'];
            const height = hole['Elevation'];

            const dip = hole['DH_Dip'];
            const azimuth = hole['DH_Azimuth'];

            const position = Cartesian3.fromDegrees(longitude, latitude, height);

            const heading = CesiumMath.toRadians(azimuth);
            const pitch = CesiumMath.toRadians(dip + 90);

            const hpr = new HeadingPitchRoll(heading, pitch, 0);

            const matrix = Transforms.headingPitchRollToFixedFrame(position, hpr);

            const minFrom = holesMinFrom[holeID];

            const localNewPosition = new Cartesian3(0, 0, - minFrom / 2);

            const newPosition = Matrix4.multiplyByPoint(matrix, localNewPosition, new Cartesian3());
            const orientation = Transforms.headingPitchRollQuaternion(newPosition, hpr);

            viewer.entities.add({
                name : holeID,
                position: newPosition,
                orientation: orientation,
                cylinder : {
                    length : minFrom,
                    topRadius : drillHoleRadius * 5,
                    bottomRadius : drillHoleRadius * 5,
                    material :  Color.BLACK.withAlpha(0.2),
                    //outline : true,
                    //outlineColor : Color.BLACK.withAlpha(0.3),
                }
            });
        }

        viewer.zoomTo(viewer.entities);
    };

    App.prototype._enableUnderground = function() {
        const viewer = this._viewer;

        // this is default
        //viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;



        const screenSpaceCameraController = viewer.scene.screenSpaceCameraController;
        const minimumCollisionTerrainHeight = screenSpaceCameraController.minimumCollisionTerrainHeight;
        const globe = viewer.scene.globe;

        viewer.scene._postRender.addEventListener(function(scene, time) {
            const cameraPositionCartographic = viewer.camera.positionCartographic;

            let isUnderground = false;

            if(cameraPositionCartographic.height < minimumCollisionTerrainHeight) {
                const terrainHeight = globe.getHeight(cameraPositionCartographic);

                if(defined(terrainHeight)) {
                    if(cameraPositionCartographic.height < terrainHeight) {
                        isUnderground = true;
                    }
                }
            }

            if(cameraPositionCartographic.height < 2500) {
                 viewer.scene.screenSpaceCameraController._zoomFactor = 0.1;
                 viewer.terrainProvider.skirtRatio = 0;
            }else {
                 viewer.scene.screenSpaceCameraController._zoomFactor = 5;
                viewer.terrainProvider.skirtRatio = 5;
            }

            console.info('isUnderground: ' + isUnderground + ' current camera height: ' + viewer.camera.positionCartographic.height);

            if(isUnderground) {
                viewer.scene.globe._surface.tileProvider._debug.wireframe = true;
                viewer.scene.backgroundColor = Color.WHITE.clone();

                viewer.scene.skyBox.show = false;
            }
            else {
                viewer.scene.globe._surface.tileProvider._debug.wireframe = false;
                viewer.scene.backgroundColor = Color.clone(Color.BLACK);
                //viewer.terrainProvider.skirtRatio = 5;
                viewer.scene.skyBox.show = true;
            }
        });
    };

    App.prototype._getHole = function (holeId) {
        for (let i = 0; i < this._holes.length; i++) {
            if(this._holes[i]['HoleID'] === holeId)
                return this._holes[i];
        }

        return null;
    };


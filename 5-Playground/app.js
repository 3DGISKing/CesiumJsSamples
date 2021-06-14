const ArcType = Cesium.ArcType;
const CallbackProperty = Cesium.CallbackProperty;
const Cartesian2 = Cesium.Cartesian2;
const Cartesian3 = Cesium.Cartesian3;
const Cartographic = Cesium.Cartographic;
const Cesium3DTileFeature = Cesium.Cesium3DTileFeature;
const Cesium3DTileset = Cesium.Cesium3DTileset;
const CesiumMath = Cesium.Math;
const Color = Cesium.Color;
const defined = Cesium.defined;
const Ellipsoid = Cesium.Ellipsoid;
const knockout = Cesium.knockout;
const Matrix4 = Cesium.Matrix4;
const Model = Cesium.Model;
const PolylineArrowMaterialProperty = Cesium.PolylineArrowMaterialProperty;
const Ray = Cesium.Ray;
const HorizontalOrigin = Cesium.HorizontalOrigin;
const Transforms = Cesium.Transforms;
const VerticalOrigin = Cesium.VerticalOrigin;

const defaultLongitude = 129.50778;
const defaultLatitude = 42.9075;
const defaultHeight = 100000;
const defaultCartesian = Cartesian3.fromDegrees(defaultLongitude, defaultLatitude, defaultHeight);

let viewModel = null;
let viewer = null;

let updatedFromCartesian;

function createModel() {
    viewModel = {
        cartesianX: defaultCartesian.x,
        cartesianY: defaultCartesian.y,
        cartesianZ: defaultCartesian.z,
        longitude: defaultLongitude,
        latitude: defaultLatitude,
        height: defaultHeight
    };

    knockout.track(viewModel);

    const toolbar = document.getElementById("toolbar");

    knockout.applyBindings(viewModel, toolbar);

    Cesium.knockout.getObservable(viewModel, 'cartesianX').subscribe(updateFromCartesian);
    Cesium.knockout.getObservable(viewModel, 'cartesianY').subscribe(updateFromCartesian);
    Cesium.knockout.getObservable(viewModel, 'cartesianZ').subscribe(updateFromCartesian);

    Cesium.knockout.getObservable(viewModel, 'longitude').subscribe(updateFromDegrees);
    Cesium.knockout.getObservable(viewModel, 'latitude').subscribe(updateFromDegrees);
    Cesium.knockout.getObservable(viewModel, 'height').subscribe(updateFromDegrees);
}

function createViewer() {
    Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTIzNzQ4NS1iN2ZmLTQ3ZWQtYjU0OS1mZWI4Nzk0MjcwNDAiLCJpZCI6OTc4Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDkxODE3NH0.UUQf2vuc3PN3VPNSUYt5uAbrSv5irvkIe-A57Ocp6ow";

    viewer = new Cesium.Viewer("cesiumContainer", {
        animation: false,
        timeline: false
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;
}

function updateFromDegrees() {
    if(updatedFromCartesian)
        return;

    const longitude = parseFloat(viewModel.longitude);
    const latitude = parseFloat(viewModel.latitude);
    const height = parseFloat(viewModel.height);

    const cartesian = Cartesian3.fromDegrees(longitude, latitude, height);

    viewModel.cartesianX = cartesian.x;
    viewModel.cartesianY = cartesian.y;
    viewModel.cartesianZ = cartesian.z;
}

function updateFromCartesian() {
    const x = parseFloat(viewModel.cartesianX);
    const y = parseFloat(viewModel.cartesianY);
    const z = parseFloat(viewModel.cartesianZ);

    const carto = Cartographic.fromCartesian(new Cesium.Cartesian3(x, y, z));

    updatedFromCartesian = true;

    viewModel.longitude = CesiumMath.toDegrees(carto.longitude);
    viewModel.latitude = CesiumMath.toDegrees(carto.latitude);
    viewModel.height = carto.height;

    updatedFromCartesian = false;
}

function goTo() {
    viewer.camera.flyTo({
        destination : Cartesian3.fromDegrees(viewModel.longitude, viewModel.latitude, viewModel.height)
    });
}

function main() {
    createModel();
    createViewer();
    goTo();
}

main();
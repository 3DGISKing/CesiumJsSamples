const { TileCoordinatesImageryProvider, Viewer } = window.Cesium;

const viewer = new Viewer("cesiumContainer", {
    baseLayerPicker: false
});

const imageryLayers = viewer.imageryLayers;

imageryLayers.addImageryProvider(new TileCoordinatesImageryProvider());

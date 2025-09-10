const { GridImageryProvider, Viewer } = window.Cesium;

const viewer = new Viewer("cesiumContainer", {});

viewer.imageryLayers.layerAdded.addEventListener(function (layer) {
    console.log("layer added", layer);
});

viewer.imageryLayers.addImageryProvider(new GridImageryProvider());

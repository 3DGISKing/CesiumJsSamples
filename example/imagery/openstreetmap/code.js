const { OpenStreetMapImageryProvider, Viewer } = Cesium;

const viewer = new Viewer("cesiumContainer", {});

const osmImageryProvider = new OpenStreetMapImageryProvider({
    url: "https://a.tile.openstreetmap.org/"
});

viewer.imageryLayers.removeAll();
viewer.imageryLayers.addImageryProvider(osmImageryProvider);

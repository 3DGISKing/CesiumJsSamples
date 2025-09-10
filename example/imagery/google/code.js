const { UrlTemplateImageryProvider, Viewer } = window.Cesium;

const tms = new UrlTemplateImageryProvider({
    url: "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
    credit: new Cesium.Credit("Google Maps", "https://google.com/maps", true) // Mandatory attribution
});

const viewer = new Viewer("cesiumContainer", {
    imageProvider: tms
});

viewer.imageryLayers.removeAll();

viewer.imageryLayers.addImageryProvider(tms);

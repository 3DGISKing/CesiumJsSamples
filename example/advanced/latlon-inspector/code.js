var viewer = new Cesium.Viewer("cesiumContainer");

viewer.extend(Cesium.viewerLatlonMixin, {
    fractionDigits: 10
});

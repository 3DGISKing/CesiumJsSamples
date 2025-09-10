// https://community.cesium.com/t/show-3d-globe-from-a-glb-file-at-the-center/40421/2
const viewer = new Cesium.Viewer("cesiumContainer");

const modelPromise = Cesium.Model.fromGltfAsync({
    url: `./assets/models/earth.glb`
});

modelPromise.then((model) => {
    viewer.scene.globe.show = false;

    viewer.scene.primitives.add(model);
});

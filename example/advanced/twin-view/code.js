const { OpenStreetMapImageryProvider, UrlTemplateImageryProvider, Viewer } = Cesium;

if (Cesium.VERSION !== "1.79.1") {
    console.warn("This example is only verified with Cesium 1.79.1, current version is " + Cesium.VERSION);
}

const viewerLeft = new Viewer("cesiumContainerLeft", {});

viewerLeft.imageryLayers.remove(viewerLeft.imageryLayers.get(0));

viewerLeft.camera.percentageChanged = 0.001;

let origAspect = viewerLeft.camera.frustum.aspectRatio;

viewerLeft.camera.frustum.aspectRatio = origAspect * 2;

let scene = viewerLeft.scene;

scene.viewportX = 0;
scene.viewportY = 0;
scene.viewportWidth = viewerLeft.canvas.width * 2;
scene.viewportHeight = viewerLeft.canvas.height;

const viewerRight = new Viewer("cesiumContainerRight", {});

const osmImageryProvider = new OpenStreetMapImageryProvider({
    url: "https://a.tile.openstreetmap.org/"
});

viewerRight.imageryLayers.remove(viewerRight.imageryLayers.get(0));
viewerRight.imageryLayers.addImageryProvider(osmImageryProvider);

viewerRight.camera.percentageChanged = 0.001;

origAspect = viewerRight.camera.frustum.aspectRatio;

viewerRight.camera.frustum.aspectRatio = origAspect * 2;

scene = viewerRight.scene;

scene.viewportX = -viewerRight.canvas.width * 1;
scene.viewportY = 0;
scene.viewportWidth = viewerRight.canvas.width * 2;
scene.viewportHeight = viewerRight.canvas.height;

viewerLeft.camera.changed.addEventListener(() => {
    cameraCopy(viewerLeft.camera, viewerRight.camera);
});

viewerRight.camera.changed.addEventListener(() => {
    cameraCopy(viewerRight.camera, viewerLeft.camera);
});

function cameraCopy(srcCamera, destCamera) {
    destCamera.setView({
        destination: srcCamera.position,
        orientation: {
            heading: destCamera.heading,
            pitch: destCamera.pitch,
            roll: destCamera.roll
        }
    });
}

const { Cartesian3, Cartographic, createOsmBuildingsAsync, knockout, Matrix4, Viewer } = window.Cesium;
const CesiumMath = window.Cesium.Math;

async function main() {
    const viewer = new Viewer("cesiumContainer");

    viewer.scene.globe.depthTestAgainstTerrain = true;

    const viewModel = {
        height: 0
    };

    knockout.track(viewModel);

    const toolbar = document.getElementById("toolbar");
    knockout.applyBindings(viewModel, toolbar);

    const tileset = await createOsmBuildingsAsync();

    viewer.scene.primitives.add(tileset);

    knockout.getObservable(viewModel, "height").subscribe(function (height) {
        height = Number(height);
        if (isNaN(height)) {
            return;
        }

        const cartographic = Cartographic.fromCartesian(Cartesian3.fromDegrees(-74.019, 40.6912, 750));
        const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
        const offset = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
        const translation = Cartesian3.subtract(offset, surface, new Cartesian3());
        tileset.modelMatrix = Matrix4.fromTranslation(translation);
    });

    viewer.scene.camera.flyTo({
        destination: Cartesian3.fromDegrees(-74.019, 40.6912, 750),
        orientation: {
            heading: CesiumMath.toRadians(20),
            pitch: CesiumMath.toRadians(-20)
        }
    });
}

main();

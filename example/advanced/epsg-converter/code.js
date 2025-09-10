const { Cartesian3, createWorldTerrainAsync, KmlDataSource, Viewer } = window.Cesium;

async function main() {
    const terrainProvider = await createWorldTerrainAsync();

    const viewer = new Viewer("cesiumContainer", {
        terrainProvider: terrainProvider,
        infoBox: false,
        timeline: false,
        fullscreenElement: "cesiumContainer"
    });

    const options = {
        camera: viewer.scene.camera,
        canvas: viewer.scene.canvas
    };

    viewer.dataSources.add(KmlDataSource.load("./assets/test1.kml", options));

    viewer.scene.camera.flyTo({
        destination: Cartesian3.fromDegrees(114.45196, -24.05534, 50000.0)
    });

    const cesiumViewerElement = document.getElementsByClassName("cesium-viewer");
    const cesiumViewerBottomElement = document.getElementsByClassName("cesium-viewer-bottom");

    cesiumViewerElement[0].removeChild(cesiumViewerBottomElement[0]);

    //const converter = new CesiumEPSGConverter(viewer, 28356);
    const converter = new CesiumEPSGConverter(viewer, 28356, "./assets/AUSGeoid2020");
    //const converter = new CesiumEPSGConverter(viewer, 28356, "AUSGeoid09");
}

main();

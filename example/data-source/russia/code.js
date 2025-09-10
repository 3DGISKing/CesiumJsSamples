const { defined, GeoJsonDataSource, Viewer } = window.Cesium;

const viewer = new Viewer("cesiumContainer");

const dataSource = GeoJsonDataSource.load("./assets/geojsons/russia.json");

dataSource.then(function (data) {
    // Change the arcType to GEODESIC, which is what it was in CesiumJS 1.53.
    for (let i = 0; i < data.entities.values.length; i++) {
        const entity = data.entities.values[i];
        if (defined(entity.polygon)) {
            entity.polygon.arcType = Cesium.ArcType.GEODESIC;
        }
    }

    viewer.dataSources.add(dataSource);

    viewer.zoomTo(dataSource);
});

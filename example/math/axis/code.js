const { Viewer, Cartesian3, ArcType, PolylineArrowMaterialProperty, Color } = window.Cesium;

const viewer = new Viewer("cesiumContainer", {
    selectionIndicator: false
});

const xAxis = viewer.entities.add({
    name: "X axis",
    polyline: {
        positions: [new Cartesian3(0.000001, 0, 0), new Cartesian3(10000000, 0, 0)],
        width: 10,
        arcType: ArcType.NONE,
        material: new PolylineArrowMaterialProperty(Color.RED),
        depthFailMaterial: new PolylineArrowMaterialProperty(new Color(1.0, 0, 0, 0.2))
    }
});

const yAxis = viewer.entities.add({
    name: "Y axis",
    polyline: {
        positions: [new Cartesian3(0, 0.000001, 0), new Cartesian3(0, 10000000, 0)],
        width: 10,
        arcType: ArcType.NONE,
        material: new PolylineArrowMaterialProperty(Color.GREEN),
        depthFailMaterial: new PolylineArrowMaterialProperty(new Color(0, 1, 0, 0.2))
    }
});

const zAxis = viewer.entities.add({
    name: "Z axis",
    polyline: {
        positions: [new Cartesian3(0, 0, 0.000001), new Cartesian3(0, 0, 10000000)],
        width: 10,
        arcType: ArcType.NONE,
        material: new PolylineArrowMaterialProperty(Color.BLUE),
        depthFailMaterial: new PolylineArrowMaterialProperty(new Color(0, 0, 1, 0.2))
    }
});

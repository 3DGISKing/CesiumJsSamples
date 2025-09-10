// to answer https://stackoverflow.com/questions/72441544/cesium-how-to-check-two-entities-have-overlapping-area

const { BoundingSphere, BoundingSphereState, Cartesian3, Color, Viewer } = window.Cesium;

const viewer = new Viewer("cesiumContainer");

const redPolygon = viewer.entities.add({
    name: "Red polygon on surface",
    polygon: {
        hierarchy: Cartesian3.fromDegreesArray([-115.0, 44.0, -115.0, 34.0, -107.0, 35.0, -102.0, 34.0, -102.0, 41.0]),
        material: Color.RED
    }
});

const greenPolygon = viewer.entities.add({
    name: "Green extruded polygon",
    polygon: {
        hierarchy: Cartesian3.fromDegreesArray([-108.0, 42.0, -100.0, 42.0, -104.0, 40.0]),
        extrudedHeight: 500000.0,
        material: Color.GREEN,
        closeTop: false,
        closeBottom: false
    }
});

const orangePolygon = viewer.entities.add({
    name: "Orange polygon with per-position heights and outline",
    polygon: {
        hierarchy: Cartesian3.fromDegreesArrayHeights([-108.0, 20.0, 100000, -100.0, 20.0, 100000, -100.0, 25.0, 100000, -108.0, 25.0, 300000]),
        extrudedHeight: 0,
        perPositionHeight: true,
        material: Color.ORANGE.withAlpha(0.5),
        outline: true,
        outlineColor: Color.BLACK
    }
});

viewer.zoomTo(viewer.entities);

function intersect(e1, e2) {
    const b1 = new BoundingSphere();
    const b2 = new BoundingSphere();

    const state1 = viewer.dataSourceDisplay.getBoundingSphere(e1, false, b1);

    if (state1 !== BoundingSphereState.DONE) {
        return false;
    }

    const state2 = viewer.dataSourceDisplay.getBoundingSphere(e2, false, b2);

    if (state2 !== BoundingSphereState.DONE) {
        return false;
    }

    const dist = Cartesian3.distance(b1.center, b2.center);

    return dist < b1.radius + b2.radius;
}

setTimeout(() => {
    console.log(intersect(redPolygon, greenPolygon));
    console.log(intersect(redPolygon, orangePolygon));
}, 6000);

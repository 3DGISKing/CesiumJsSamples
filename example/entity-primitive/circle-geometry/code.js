const { Viewer, CircleGeometry, Cartesian3, PerInstanceColorAppearance, GeometryInstance, ColorGeometryInstanceAttribute, Primitive } = window.Cesium;

const viewer = new Viewer("cesiumContainer", {});

const circle = new CircleGeometry({
    center: Cartesian3.fromDegrees(-75.59777, 40.03883),
    radius: 1000000.0,
    height: 1000000,
    extrudedHeight: 500000,
    vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT // very important
});

const geometry = CircleGeometry.createGeometry(circle);

const instance = new GeometryInstance({
    geometry: geometry,
    attributes: {
        color: new ColorGeometryInstanceAttribute(0.0, 0.0, 1.0, 0.5)
    }
});

viewer.scene.primitives.add(
    new Primitive({
        geometryInstances: instance,
        appearance: new PerInstanceColorAppearance(),
        asynchronous: false
    })
);

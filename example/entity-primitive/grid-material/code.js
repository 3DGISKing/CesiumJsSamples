const { Cartesian2, Cartesian3, Color, ColorGeometryInstanceAttribute, CoplanarPolygonGeometry, GeometryInstance, Material, MaterialAppearance, PerInstanceColorAppearance, Primitive, Viewer } =
    window.Cesium;

const viewer = new Viewer("cesiumContainer");

const positions = Cartesian3.fromDegreesArray([-115.0, 37.0, -115.0, 32.0, -107.0, 33.0, -102.0, 31.0, -102.0, 35.0]);

const geometry = CoplanarPolygonGeometry.fromPositions({
    positions: positions,
    vertexFormat: MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat
});

const uniforms = {
    color: Color.YELLOW,
    cellAlpha: 0.1,
    lineCount: new Cartesian2(10, 10)
};

const material = new Material({
    translucent: false,
    fabric: {
        type: "Grid",
        uniforms: uniforms
    }
});

const materialAppearance = new MaterialAppearance({
    material: material,
    translucent: true
});

const primitive = new Primitive({
    geometryInstances: new GeometryInstance({
        geometry: geometry
    }),
    appearance: materialAppearance,
    asynchronous: false
});

viewer.scene.primitives.add(primitive);

const redPolygon = viewer.entities.add({
    name: "Red polygon on surface",
    show: false,
    polygon: {
        hierarchy: positions,
        material: Color.RED
    }
});

viewer.zoomTo(viewer.entities);

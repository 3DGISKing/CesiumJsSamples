const {
    buildModuleUrl,
    Cartesian3,
    Color,
    ColorGeometryInstanceAttribute,
    createWorldTerrainAsync,
    EllipsoidSurfaceAppearance,
    FeatureDetection,
    GeometryInstance,
    Material,
    MaterialAppearance,
    Matrix4,
    Primitive,
    Rectangle,
    RectangleGeometry,
    VertexFormat,
    Viewer,
    WallGeometry
} = window.Cesium;

async function main() {
    const viewer = new Viewer("cesiumContainer", {
        terrainProvider: await createWorldTerrainAsync()
    });

    if (FeatureDetection.supportsImageRenderingPixelated()) {
        viewer.resolutionScale = window.devicePixelRatio;
    }

    viewer.scene.postProcessStages.fxaa.enabled = true;
    viewer.scene.globe.depthTestAgainstTerrain = true;

    viewer.scene.primitives.add(
        new Primitive({
            geometryInstances: new GeometryInstance({
                geometry: new RectangleGeometry({
                    rectangle: Rectangle.fromDegrees(103.3, 29.25, 103.45, 29.35),
                    height: 1000 - 470,
                    vertexFormat: VertexFormat.DEFAULT
                })
            }),
            appearance: new EllipsoidSurfaceAppearance({
                material: new Material({
                    fabric: {
                        type: "Water",
                        uniforms: {
                            baseWaterColor: new Color(64 / 255.0, 157 / 255.0, 200 / 255.0, 0.5),
                            normalMap: buildModuleUrl("Assets/Textures/waterNormals.jpg"),
                            frequency: 1000.0,
                            animationSpeed: 0.1,
                            amplitude: 10,
                            specularIntensity: 10
                        }
                    }
                })
            })
        })
    );

    const center = Cartesian3.fromDegrees(103.37, 29.15);

    viewer.camera.lookAt(center, new Cartesian3(0.0, -47900.0, 39300.0));
    viewer.camera.lookAtTransform(Matrix4.IDENTITY);
}

main();

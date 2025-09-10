const {
    Viewer,
    Cartesian3,
    Cartographic,
    Ellipsoid,
    Color,
    ColorGeometryInstanceAttribute,
    CircleOutlineGeometry,
    GeometryInstance,
    Primitive,
    PerInstanceColorAppearance,
    Matrix3,
    Matrix4,
    Math: CesiumMath,
    DebugModelMatrixPrimitive,
    Transforms
} = window.Cesium;

const viewer = new Viewer("cesiumContainer", {});

const height = 5000;
const firstCartographic = Cartographic.fromDegrees(129.47814, 42.89356, height);
const secondCartographic = Cartographic.fromDegrees(128.478141, 42.89356, height);

const firstPosition = Ellipsoid.WGS84.cartographicToCartesian(firstCartographic);
const secondPosition = Ellipsoid.WGS84.cartographicToCartesian(secondCartographic);

const center = Cartesian3.add(firstPosition, secondPosition, new Cartesian3());
Cartesian3.multiplyByScalar(center, 0.5, center);

const centercartoGraphic = Cartographic.fromCartesian(center);
console.log(centercartoGraphic.height);

viewer.entities.add({
    position: center,
    ellipsoid: {
        radii: new Cartesian3(1000.0, 1000, 1000.0),
        material: Color.BLUE
    }
});

const line = viewer.entities.add({
    polyline: {
        positions: [firstPosition, secondPosition],
        width: 2,
        material: Color.RED
    }
});

viewer.zoomTo(viewer.entities);

// Create a circle.
const circle = new CircleOutlineGeometry({
    center: center,
    //center : new Cartesian3(10,0,0),
    radius: 10000.0,
    height: 5000
});

const geometry = CircleOutlineGeometry.createGeometry(circle);

const angle = CesiumMath.PI_OVER_TWO;

const rotationZ = Matrix3.fromRotationZ(0.0, new Matrix3());

//const translation = new Cartesian3(0, 0, 90000);
const translation = new Cartesian3(0, 0, 5000);

const rotationZMatrix4 = Matrix4.fromRotationTranslation(rotationZ, translation, new Matrix4());

const instanceForOutline = new GeometryInstance({
    geometry: geometry,
    modelMatrix: rotationZMatrix4,
    attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(Color.WHITE)
    }
});

viewer.scene.primitives.add(
    new Primitive({
        geometryInstances: instanceForOutline,
        appearance: new PerInstanceColorAppearance({
            flat: true,
            renderState: {
                lineWidth: Math.min(2.0, viewer.scene.maximumAliasedLineWidth)
            }
        }),
        modelMatrix: rotationZMatrix4,
        //modelMatrix : Transforms.eastNorthUpToFixedFrame(center),
        asynchronous: false
    })
);

viewer.scene.primitives.add(
    new DebugModelMatrixPrimitive({
        modelMatrix: Transforms.eastNorthUpToFixedFrame(center, undefined, new Matrix4()),
        length: 100000.0,
        width: 5.0
    })
);

const { Viewer, CircleGeometry, Cartesian3, ColorGeometryInstanceAttribute, GeometryInstance, PerInstanceColorAppearance, Primitive, knockout } = window.Cesium;

class CirclePrimitive {
    constructor(options) {
        this._primitive = undefined;
        this.show = true;
        this._update = true;
        this._radius = 1000000.0;
        if (options && options.radius !== undefined) {
            this._radius = options.radius;
        }
    }

    set radius(r) {
        this._radius = r;
        this._update = true;
    }

    isDestroyed() {
        return false;
    }

    update(frameState) {
        if (!this.show) return;
        if (this._update) {
            this._update = false;
            if (this._primitive) this._primitive.destroy();
            const circle = new CircleGeometry({
                center: Cartesian3.fromDegrees(-75.59777, 40.03883),
                radius: this._radius,
                height: 1000000,
                extrudedHeight: 500000,
                vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT // very important
            });
            const geometry = CircleGeometry.createGeometry(circle);
            const instance = new GeometryInstance({
                geometry,
                attributes: {
                    color: new ColorGeometryInstanceAttribute(0.0, 0.0, 1.0, 0.5)
                }
            });
            this._primitive = new Primitive({
                geometryInstances: instance,
                appearance: new PerInstanceColorAppearance(),
                asynchronous: false
            });
        }
        this._primitive.update(frameState);
    }
}

const viewer = new Viewer("cesiumContainer", {});

const viewModel = {
    radius: 5000000
};

const circlePrimitive = new CirclePrimitive({
    radius: viewModel.radius
});

viewer.scene.primitives.add(circlePrimitive);

const toolbar = document.getElementById("toolbar");

knockout.track(viewModel);
knockout.applyBindings(viewModel, toolbar);
knockout.getObservable(viewModel, "radius").subscribe(updateRadius);

function updateRadius() {
    circlePrimitive.radius = viewModel.radius;
}

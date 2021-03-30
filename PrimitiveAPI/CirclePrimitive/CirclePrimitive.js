import {CircleGeometry, Cartesian3, ColorGeometryInstanceAttribute, GeometryInstance, PerInstanceColorAppearance, Primitive} from "../../0-Common/CesiumJsInc.js"

class CirclePrimitive {
    constructor(options) {
        this._primitive = undefined;
        this.show = true;
        this._update = true;
        this._radius = 1000000.0;
    }

    set radius(r) {
        this._radius = r;
        this._update = true;
    }

    update(frameState) {
        if (!this.show) {
            return;
        }

        if(this._update) {
            this._update = false;

            if(this._primitive)
                this._primitive.destroy();

            let circle = new CircleGeometry({
                center : Cartesian3.fromDegrees(-75.59777, 40.03883),
                radius : this._radius,
                height: 1000000,
                extrudedHeight: 500000,
                vertexFormat : PerInstanceColorAppearance.VERTEX_FORMAT // very important
            });

            let geometry = CircleGeometry.createGeometry(circle);

            const instance = new GeometryInstance({
                geometry : geometry,
                attributes: {
                    color : new ColorGeometryInstanceAttribute(0.0, 0.0, 1.0, 0.5)
                }
            });

            this._primitive = new Primitive({
                geometryInstances: instance,
                appearance : new PerInstanceColorAppearance(),
                asynchronous : false
            });
        }

        this._primitive.update(frameState);
    }
}

export {CirclePrimitive}
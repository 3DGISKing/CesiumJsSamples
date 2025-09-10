// for https://stackoverflow.com/questions/78513985/how-to-clamp-a-primitive-to-the-ground
const {
    ArcType,
    BoundingSphere,
    Cartesian3,
    ColorGeometryInstanceAttribute,
    defaultValue,
    defined,
    Color,
    GeometryInstance,
    GroundPolylineGeometry,
    GroundPolylinePrimitive,
    Material,
    PolylineColorAppearance,
    PolylineGeometry,
    PolylineMaterialAppearance,
    Primitive,
    Viewer
} = window.Cesium;

class PolylinePrimitive {
    constructor(options) {
        this._show = defaultValue(options.show, true);
        const isArrow = defaultValue(options.arrow, false);
        this._width = options.width ? options.width : isArrow ? 5 : 3;
        this._isArrow = isArrow;
        this._color = Color.clone(defaultValue(options.color, Color.WHITE));
        this._primitive = undefined;
        this._dashed = defaultValue(options.dashed, false);
        this._loop = defaultValue(options.loop, false);
        const positions = defaultValue(options.positions, []);
        this._positions = positions;
        this._boundingSphere = positions.length > 0 ? BoundingSphere.fromPoints(this._positions) : new BoundingSphere();
        this._transformedBoundingSphere = BoundingSphere.clone(this._boundingSphere);
        this._depthTest = defaultValue(options.depthTest, false);
        this._clampToGround = defaultValue(options.clampToGround, false);
        this._update = true;
        this._allowPicking = defaultValue(options.allowPicking, false);
    }

    get positions() {
        return this._positions;
    }

    set positions(positions) {
        this._positions = positions;
        this._update = true;
    }

    get color() {
        return this._color;
    }

    set color(color) {
        this._color = color;
        this._update = true;
    }

    get boundingVolume() {
        return this._transformedBoundingSphere;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
        this._update = true;
    }

    get dashed() {
        return this._dashed;
    }

    get loop() {
        return this._loop;
    }

    get show() {
        return this._show;
    }

    set show(show) {
        this._show = show;
    }

    get clampToGround() {
        return this._clampToGround;
    }

    set clampToGround(val) {
        this._clampToGround = val;
        this._update = true;
    }

    get allowPicking() {
        return this._allowPicking;
    }

    set allowPicking(b) {
        this._allowPicking = b;
        this._update = true;
    }

    update(frameState) {
        if (!this._show) return;
        let positions = this._positions;
        if (!defined(positions) || positions.length < 2) {
            if (this._primitive) {
                this._primitive.destroy();
                this._primitive = undefined;
            }
            return;
        }
        if (this._update) {
            this._update = false;
            if (this._primitive) this._primitive.destroy();
            if (this._loop) {
                positions = positions.slice();
                positions.push(positions[0]);
            }
            let geometry;
            if (this._clampToGround) {
                geometry = new GroundPolylineGeometry({
                    positions,
                    width: this.width,
                    vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
                    arcType: ArcType.GEODESIC
                });
            } else {
                geometry = new PolylineGeometry({
                    positions,
                    width: this.width,
                    vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
                    arcType: ArcType.NONE
                });
            }
            let appearance;
            if (this._dashed) {
                appearance = new PolylineMaterialAppearance({
                    material: Material.fromType(Material.PolylineDashType, {
                        color: this._color
                    })
                });
            } else if (this._isArrow) {
                appearance = new PolylineMaterialAppearance({
                    material: Material.fromType(Material.PolylineArrowType, {
                        color: this._color
                    })
                });
            } else {
                appearance = new PolylineColorAppearance();
            }
            if (this._clampToGround) {
                this._primitive = new GroundPolylinePrimitive({
                    geometryInstances: new GeometryInstance({
                        geometry,
                        attributes: {
                            color: ColorGeometryInstanceAttribute.fromColor(this._color),
                            depthFailColor: ColorGeometryInstanceAttribute.fromColor(this._color)
                        }
                    }),
                    appearance,
                    depthFailAppearance: this._depthTest ? undefined : appearance,
                    asynchronous: false,
                    allowPicking: this._allowPicking,
                    debugShowBoundingVolume: false,
                    debugShowShadowVolume: false
                });
            } else {
                this._primitive = new Primitive({
                    geometryInstances: new GeometryInstance({
                        geometry,
                        attributes: {
                            color: ColorGeometryInstanceAttribute.fromColor(this._color),
                            depthFailColor: ColorGeometryInstanceAttribute.fromColor(this._color)
                        }
                    }),
                    appearance,
                    depthFailAppearance: this._depthTest ? undefined : appearance,
                    asynchronous: false,
                    allowPicking: this._allowPicking
                });
            }
            this._boundingSphere = BoundingSphere.fromPoints(positions, this._boundingSphere);
            this._transformedBoundingSphere = BoundingSphere.transform(this._boundingSphere, this._transformedBoundingSphere);
        }
        this._primitive.update(frameState);
    }

    isDestroyed() {
        return false;
    }
}

const viewer = new Viewer("cesiumContainer");

viewer.scene.globe.depthTestAgainstTerrain = true;

GroundPolylinePrimitive.initializeTerrainHeights().then(() => {
    const polylinePrimitive = new PolylinePrimitive({
        arrow: true,
        clampToGround: true,
        positions: Cartesian3.fromDegreesArray([-75, 37, -125, 37])
    });
    viewer.scene.primitives.add(polylinePrimitive);
});

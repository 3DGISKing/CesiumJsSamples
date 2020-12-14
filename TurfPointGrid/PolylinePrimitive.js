const PolylinePrimitive = (function () {
    const createGuid = Cesium.createGuid;
    const defaultValue = Cesium.defaultValue;
    const defined = Cesium.defined;
    const destroyObject = Cesium.destroyObject;
    const ArcType = Cesium.ArcType;
    const BoundingSphere = Cesium.BoundingSphere;
    const Color = Cesium.Color;
    const ColorGeometryInstanceAttribute = Cesium.ColorGeometryInstanceAttribute;
    const Ellipsoid = Cesium.Ellipsoid;
    const GeometryInstance = Cesium.GeometryInstance;
    const PolylineGeometry = Cesium.PolylineGeometry;
    const Material = Cesium.Material;
    const PolylineColorAppearance = Cesium.PolylineColorAppearance;
    const PolylineMaterialAppearance = Cesium.PolylineMaterialAppearance;
    const GroundPolylineGeometry = Cesium.GroundPolylineGeometry;
    const GroundPolylinePrimitive = Cesium.GroundPolylinePrimitive;
    const Primitive = Cesium.Primitive;

    /**
     * @private
     * @ionsdk
     */
    function PolylinePrimitive(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this.show = defaultValue(options.show, true);

        this._ellipsoid = defaultValue(options.ellipsoid, Ellipsoid.WGS84);
        this._width = defaultValue(options.width, 3);
        this._color = Color.clone(defaultValue(options.color, Color.WHITE));
        this._id = createGuid();
        this._positions = defaultValue(options.positions, []);
        this._primitive = undefined;
        this._boundingSphere = new BoundingSphere();
        this._dashed = defaultValue(options.dashed, false);
        this._loop = defaultValue(options.loop, false);

        this._update = true;
    }

    Object.defineProperties(PolylinePrimitive.prototype, {
        positions : {
            get : function() {
                return this._positions;
            },
            set : function(positions) {
                this._positions = positions;
                this._update = true;
            }
        },
        color : {
            get : function() {
                return this._color;
            }
        },
        boundingVolume : {
            get : function() {
                return this._boundingSphere;
            }
        },
        width : {
            get : function() {
                return this._width;
            }
        },
        ellipsoid : {
            get : function() {
                return this._ellipsoid;
            }
        },
        dashed : {
            get : function() {
                return this._dashed;
            }
        },
        loop : {
            get : function() {
                return this._loop;
            }
        }
    });

    PolylinePrimitive.prototype.update = function(frameState) {
        if (!this.show) {
            return;
        }

        let positions = this._positions;

        if (!defined(positions) || positions.length < 2) {
            this._primitive = this._primitive && this._primitive.destroy();
            return;
        }

        if (this._update) {
            this._update = false;
            this._id = this.id;

            this._primitive = this._primitive && this._primitive.destroy();

            if (this._loop) {
                positions = positions.slice();
                positions.push(positions[0]);
            }

            const geometry = new GroundPolylineGeometry({
                positions : positions,
                width : this.width,
                arcType : undefined
            });

            this._primitive = new GroundPolylinePrimitive({
                geometryInstances : new GeometryInstance({
                    geometry : geometry,
                    id : this.id
                }),
                appearance : new PolylineMaterialAppearance(),
                asynchronous : true,
                allowPicking : false
            });

            this._boundingSphere = BoundingSphere.fromPoints(positions, this._boundingSphere);
        }

        this._primitive.update(frameState);
    };

    PolylinePrimitive.prototype.isDestroyed = function() {
        return false;
    };

    PolylinePrimitive.prototype.destroy = function() {
        this._primitive = this._primitive && this._primitive.destroy();
        return destroyObject(this);
    };

    return PolylinePrimitive;
})();

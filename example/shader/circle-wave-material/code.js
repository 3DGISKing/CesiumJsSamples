const { Cartesian3, Color, createPropertyDescriptor, defaultValue, defined, Event, Material, Property, Viewer } =
    window.Cesium;

function CircleWaveMaterialProperty(options) {
    this.options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    this._definitionChanged = new Event();

    this._color = undefined;

    this._colorSubscription = undefined;

    this.color = options.color;

    this.duration = defaultValue(options.duration, 1e3);

    this.count = defaultValue(options.count, 2);

    if (this.count <= 0) this.count = 1;

    this.gradient = defaultValue(options.gradient, 0.1);

    if (this.gradient < 0) this.gradient = 0;
    else if (this.gradient > 1) this.gradient = 1;

    this._time = performance.now();
}

Object.defineProperties(CircleWaveMaterialProperty.prototype, {
    isConstant: {
        get: function () {
            return false;
        }
    },

    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        }
    },

    color: createPropertyDescriptor("color")
});

CircleWaveMaterialProperty.prototype.getType = function (time) {
    return Material.CircleWaveMaterialType;
};

CircleWaveMaterialProperty.prototype.getValue = function (time, result) {
    if (!defined(result)) {
        result = {};
    }

    result.color = Property.getValueOrClonedDefault(this._color, time, Color.WHITE, result.color);

    result.time = (performance.now() - this._time) / this.duration;

    result.count = this.count;

    result.gradient = 1 + 10 * (1 - this.gradient);

    return result;
};

CircleWaveMaterialProperty.prototype.equals = function (other) {
    return (
        this === other || (other instanceof CircleWaveMaterialProperty && Property.equals(this._color, other._color))
    );
};

Material.CircleWaveMaterialType = "CircleWaveMaterial";

Material.PolylineTrailSource =
    "czm_material czm_getMaterial(czm_materialInput materialInput)\n" +
    "{\n" +
    "    czm_material material = czm_getDefaultMaterial(materialInput);\n" +
    "    \n" +
    "    material.diffuse = 1.5 * color.rgb;\n" +
    "    vec2 st = materialInput.st;\n" +
    "    vec3 str = materialInput.str;\n" +
    "    \n" +
    "    float dis = distance(st, vec2(0.5, 0.5));\n" +
    "    \n" +
    "    float per = fract(time);\n" +
    "    //float per = 1;\n" +
    "    //float gradient = 1;\n" +
    "    //float count = 1;\n" +
    "    \n" +
    "    if (abs(str.z) > 0.001) {\n" +
    "        discard;\n" +
    "    }\n" +
    "    \n" +
    "    if (dis > 0.5 ) {\n" +
    "        discard;\n" +
    "    }\n" +
    "    else {\n" +
    "        float perDis = 0.5 / count;\n" +
    "        float disNum;\n" +
    "        float bl = 0.0;\n" +
    "        \n" +
    "        for(int i = 0; i <= 999; i++ ) {\n" +
    "            if(float(i) <= count) {\n" +
    "            \tdisNum = perDis * float(i) - dis + per / count;\n" +
    "            \n" +
    "                if(disNum > 0.0) {\n" +
    "                    if(disNum < perDis) {\n" +
    "                        bl = 1.0 - disNum / perDis;\n" +
    "                    }\n" +
    "                    else if (disNum - perDis < perDis) {\n" +
    "                        bl = 1.0 - abs(1.0 - disNum / perDis);\n" +
    "                    }\n" +
    "                }    \n" +
    "                \n" +
    "                material.alpha = pow(bl, gradient);\n" +
    "            }\n" +
    "        }\n" +
    "    }\n" +
    "    \n" +
    "    return material;\n" +
    "}";

Material._materialCache.addMaterial(Material.CircleWaveMaterialType, {
    fabric: {
        type: Material.CircleWaveMaterialType,
        uniforms: {
            color: new Color(1.0, 0.0, 0.0, 1.0),
            time: 1,
            count: 1,
            gradient: 0.1
        },
        source: Material.PolylineTrailSource
    },
    translucent: function (material) {
        return !0;
    }
});

Cesium.CircleWaveMaterialProperty = CircleWaveMaterialProperty;

const viewer = new Viewer("cesiumContainer");

viewer.entities.add({
    name: "",
    position: Cartesian3.fromDegrees(116.4074, 39.9042, 0),
    ellipse: {
        height: 0,
        semiMinorAxis: 1000000,
        semiMajorAxis: 1000000,
        material: new Cesium.CircleWaveMaterialProperty({
            duration: 2e3,
            gradient: 0,
            color: new Color(1.0, 0.0, 0.0, 1.0),
            count: 3
        })
    }
});

viewer.zoomTo(viewer.entities);

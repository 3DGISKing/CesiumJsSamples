Cesium.Ion.defaultAccessToken = window.CesiumIonAccessToken;

// step1
Object.defineProperties(Cesium.Scene.prototype, {
    splitPosition: {
        get: function () {
            return this._frameState.splitPosition;
        },
        set: function (value) {
            this._frameState.splitPosition = value;
        }
    }
});

// step 2
Cesium.FrameState.prototype.splitPosition = 0.0;

// step 3

Cesium.UniformState.prototype._splitPosition = 0.0;

Object.defineProperties(Cesium.UniformState.prototype, {
    splitPosition: {
        get: function () {
            return this._splitPosition;
        }
    }
});

//step 4

function AutomaticUniform(options) {
    this._size = options.size;
    this._datatype = options.datatype;
    this.getValue = options.getValue;
}

Cesium.AutomaticUniforms.czml_splitPosition = new AutomaticUniform({
    size: 1,
    datatype: Cesium.WebGLConstants.FLOAT,
    getValue: function (uniformState) {
        return uniformState.splitPosition;
    }
});

const viewer = new Cesium.Viewer("cesiumContainer", {});

//step 5
viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources[1] = globeFS;

//step6

let viewModel = {
    splitPosition: 1
};

const knockout = Cesium.knockout;

knockout.track(viewModel);

const toolbar = document.getElementById("toolbar");

knockout.applyBindings(viewModel, toolbar);

Cesium.knockout.getObservable(viewModel, "splitPosition").subscribe(updateSplitPosition);

function updateSplitPosition() {
    viewer.scene.splitPosition = viewModel.splitPosition;
}

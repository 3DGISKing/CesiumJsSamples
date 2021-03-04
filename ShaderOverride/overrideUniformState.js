const Cartographic = Cesium.Cartographic;
const Cartesian3 = Cesium.Cartesian3;
const Color = Cesium.Color;
const defaultValue = Cesium.defaultValue;
const defined = Cesium.defined;
const Matrix3 = Cesium.Matrix3;
const SceneMode = Cesium.SceneMode;
const Simon1994PlanetaryPositions = Cesium.Simon1994PlanetaryPositions;
const SunLight = Cesium.SunLight;
const Transforms = Cesium.Transforms;

var transformMatrix = new Matrix3();
var sunCartographicScratch = new Cartographic();

function setSunAndMoonDirections(uniformState, frameState) {
    if (
        !defined(
            Transforms.computeIcrfToFixedMatrix(frameState.time, transformMatrix)
        )
    ) {
        transformMatrix = Transforms.computeTemeToPseudoFixedMatrix(
            frameState.time,
            transformMatrix
        );
    }

    var position = Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(
        frameState.time,
        uniformState._sunPositionWC
    );
    Matrix3.multiplyByVector(transformMatrix, position, position);

    Cartesian3.normalize(position, uniformState._sunDirectionWC);

    position = Matrix3.multiplyByVector(
        uniformState.viewRotation3D,
        position,
        uniformState._sunDirectionEC
    );
    Cartesian3.normalize(position, position);

    position = Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(
        frameState.time,
        uniformState._moonDirectionEC
    );
    Matrix3.multiplyByVector(transformMatrix, position, position);
    Matrix3.multiplyByVector(uniformState.viewRotation3D, position, position);
    Cartesian3.normalize(position, position);

    var projection = frameState.mapProjection;
    var ellipsoid = projection.ellipsoid;
    var sunCartographic = ellipsoid.cartesianToCartographic(
        uniformState._sunPositionWC,
        sunCartographicScratch
    );
    projection.project(sunCartographic, uniformState._sunPositionColumbusView);
}

var EMPTY_ARRAY = [];
var defaultLight = new SunLight();

Cesium.UniformState.prototype.update = function (frameState) {
    this._mode = frameState.mode;
    this._mapProjection = frameState.mapProjection;
    this._ellipsoid = frameState.mapProjection.ellipsoid;
    this._pixelRatio = frameState.pixelRatio;

    var camera = frameState.camera;
    this.updateCamera(camera);

    if (frameState.mode === SceneMode.SCENE2D) {
        this._frustum2DWidth = camera.frustum.right - camera.frustum.left;
        this._eyeHeight2D.x = this._frustum2DWidth * 0.5;
        this._eyeHeight2D.y = this._eyeHeight2D.x * this._eyeHeight2D.x;
    } else {
        this._frustum2DWidth = 0.0;
        this._eyeHeight2D.x = 0.0;
        this._eyeHeight2D.y = 0.0;
    }

    setSunAndMoonDirections(this, frameState);

    var light = defaultValue(frameState.light, defaultLight);
    if (light instanceof SunLight) {
        this._lightDirectionWC = Cartesian3.clone(
            this._sunDirectionWC,
            this._lightDirectionWC
        );
        this._lightDirectionEC = Cartesian3.clone(
            this._sunDirectionEC,
            this._lightDirectionEC
        );
    } else {
        this._lightDirectionWC = Cartesian3.normalize(
            Cartesian3.negate(light.direction, this._lightDirectionWC),
            this._lightDirectionWC
        );
        this._lightDirectionEC = Matrix3.multiplyByVector(
            this.viewRotation3D,
            this._lightDirectionWC,
            this._lightDirectionEC
        );
    }

    var lightColor = light.color;
    var lightColorHdr = Cartesian3.fromElements(
        lightColor.red,
        lightColor.green,
        lightColor.blue,
        this._lightColorHdr
    );
    lightColorHdr = Cartesian3.multiplyByScalar(
        lightColorHdr,
        light.intensity,
        lightColorHdr
    );
    var maximumComponent = Cartesian3.maximumComponent(lightColorHdr);
    if (maximumComponent > 1.0) {
        Cartesian3.divideByScalar(
            lightColorHdr,
            maximumComponent,
            this._lightColor
        );
    } else {
        Cartesian3.clone(lightColorHdr, this._lightColor);
    }

    var brdfLutGenerator = frameState.brdfLutGenerator;
    var brdfLut = defined(brdfLutGenerator)
        ? brdfLutGenerator.colorTexture
        : undefined;
    this._brdfLut = brdfLut;

    this._environmentMap = defaultValue(
        frameState.environmentMap,
        frameState.context.defaultCubeMap
    );

    // IE 11 doesn't optimize out uniforms that are #ifdef'd out. So undefined values for the spherical harmonic
    // coefficients and specular environment map atlas dimensions cause a crash.
    this._sphericalHarmonicCoefficients = defaultValue(
        frameState.sphericalHarmonicCoefficients,
        EMPTY_ARRAY
    );
    this._specularEnvironmentMaps = frameState.specularEnvironmentMaps;
    this._specularEnvironmentMapsMaximumLOD =
        frameState.specularEnvironmentMapsMaximumLOD;

    if (defined(this._specularEnvironmentMaps)) {
        Cartesian2.clone(
            this._specularEnvironmentMaps.dimensions,
            this._specularEnvironmentMapsDimensions
        );
    }

    this._fogDensity = frameState.fog.density;

    this._invertClassificationColor = frameState.invertClassificationColor;

    this._frameState = frameState;
    this._temeToPseudoFixed = Transforms.computeTemeToPseudoFixedMatrix(
        frameState.time,
        this._temeToPseudoFixed
    );

    // Convert the relative imagerySplitPosition to absolute pixel coordinates
    this._imagerySplitPosition =
        frameState.imagerySplitPosition * frameState.context.drawingBufferWidth;

    // custom
    this._splitPosition =
        frameState.splitPosition * frameState.context.drawingBufferWidth;
    // end

    var fov = camera.frustum.fov;
    var viewport = this._viewport;
    var pixelSizePerMeter;
    if (defined(fov)) {
        if (viewport.height > viewport.width) {
            pixelSizePerMeter = (Math.tan(0.5 * fov) * 2.0) / viewport.height;
        } else {
            pixelSizePerMeter = (Math.tan(0.5 * fov) * 2.0) / viewport.width;
        }
    } else {
        pixelSizePerMeter = 1.0 / Math.max(viewport.width, viewport.height);
    }

    this._geometricToleranceOverMeter =
        pixelSizePerMeter * frameState.maximumScreenSpaceError;
    Color.clone(frameState.backgroundColor, this._backgroundColor);

    this._minimumDisableDepthTestDistance =
        frameState.minimumDisableDepthTestDistance;
    this._minimumDisableDepthTestDistance *= this._minimumDisableDepthTestDistance;
    if (this._minimumDisableDepthTestDistance === Number.POSITIVE_INFINITY) {
        this._minimumDisableDepthTestDistance = -1.0;
    }
};
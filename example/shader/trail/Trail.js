const { BlendingState, Cartesian3, DrawCommand, Geometry, GeometryAttribute, Matrix4, Pass, PrimitiveType, RenderState, ShaderProgram, VertexArray, Viewer } = Cesium;

const UPDATE_COUNT_OF_PARTICLE_COUNT = 1000;
const POSITION_ATTRIBUTE_COUNT = 3;
const MOUSE_ATTRIBUTE_COUNT = 4;
const scratchStep = new Cartesian3();

class Trail {
    constructor(scene) {
        this._scene = scene;

        this._totalParticleCount = UPDATE_COUNT_OF_PARTICLE_COUNT * 30;

        const count = this._totalParticleCount;

        this._positions = new Float32Array(count * POSITION_ATTRIBUTE_COUNT);
        this._mouse = new Float32Array(count * MOUSE_ATTRIBUTE_COUNT);
        this._afront = new Float32Array(count * 2);
        this._random = new Float32Array(count);

        const positions = this._positions;
        const mouse = this._mouse;
        const aFront = this._afront;

        this._positionIndex = 0;
        this._mouseIndex = 0;

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            mouse[i * 4 + 0] = -1;
            mouse[i * 4 + 1] = Math.random();
            mouse[i * 4 + 2] = Math.random();
            mouse[i * 4 + 3] = Math.random();

            aFront[i * 2 + 0] = 0;
            aFront[i * 2 + 1] = 0;

            this._random[i] = Math.random();
        }

        this._timestamp = 0; // JulianDate.secondsOfDay
        this._oldPosition = null;
        this._modelMatrix = new Matrix4();
        this._inverseModelMatrix = new Matrix4();
    }

    isDestroyed() {
        return false;
    }

    _createVertexArray(modelMatrix) {
        Matrix4.clone(modelMatrix, this._modelMatrix);

        Matrix4.inverse(modelMatrix, this._inverseModelMatrix);

        const position = Matrix4.getTranslation(modelMatrix, new Cartesian3());

        const diff = new Cartesian3();

        if (this._oldPosition) {
            Cartesian3.subtract(position, this._oldPosition, diff);
        }

        const totalParticleCount = this._totalParticleCount;

        for (let i = 0; i < UPDATE_COUNT_OF_PARTICLE_COUNT; i++) {
            const ci = (this._positionIndex % (totalParticleCount * POSITION_ATTRIBUTE_COUNT)) + i * POSITION_ATTRIBUTE_COUNT;

            let subPosition = position;

            if (this._oldPosition) {
                const step = Cartesian3.multiplyByScalar(diff, i / UPDATE_COUNT_OF_PARTICLE_COUNT, scratchStep);

                subPosition = Cartesian3.add(this._oldPosition, step, position);
            }

            this._positions[ci + 0] = subPosition.x;
            this._positions[ci + 1] = subPosition.y;
            this._positions[ci + 2] = subPosition.z;
        }

        for (let i = 0; i < UPDATE_COUNT_OF_PARTICLE_COUNT; i++) {
            const ci = (this._mouseIndex % (totalParticleCount * MOUSE_ATTRIBUTE_COUNT)) + i * MOUSE_ATTRIBUTE_COUNT;

            this._mouse[ci + 0] = this._timestamp;
        }

        this._oldPosition = position;
        this._positionIndex += POSITION_ATTRIBUTE_COUNT * UPDATE_COUNT_OF_PARTICLE_COUNT;
        this._mouseIndex += MOUSE_ATTRIBUTE_COUNT * UPDATE_COUNT_OF_PARTICLE_COUNT;

        const geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: this._positions
                }),
                mouse: new GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 4,
                    values: this._mouse
                }),
                aFront: new GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: this._afront
                }),
                random: new GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 1,
                    values: this._random
                })
            },
            primitiveType: PrimitiveType.POINTS
        });

        return VertexArray.fromGeometry({
            context: this._scene.context,
            geometry: geometry,
            attributeLocations: {
                position: 0,
                mouse: 1,
                aFront: 2,
                random: 3
            }
        });
    }

    _createDrawCommand(vertexArray) {
        const vs = `
                        precision highp float;
                        precision highp int;

                        in vec3 position;
                        in vec4 mouse;
                        in vec2 aFront;
                        in float random;
                     
                        uniform float pixelRatio;
                        uniform float timestamp;
                        uniform float size;
                        uniform float minSize;
                        uniform float speed;
                        uniform float far;
                        uniform float spread;
                        uniform float maxSpread;
                        uniform float maxZ;
                        uniform float maxDiff;
                        uniform float diffPow;
                        uniform mat4 modelMatrix;
                        uniform mat4 inverseModelMatrix;

                        out float vProgress;
                        out float vRandom;
                        out float vDiff;
                        out float vSpreadLength;
                        out float vPositionZ;

                        const float PI = 3.1415926;
                        const float PI2 = PI * 2.0;

                        float cubicOut(float t) {
                            float f = t - 1.0;

                            return f * f * f + 1.0;
                        }

                        void main() {
                            if(position.x == 0.0 && position.y == 0.0 && position.z == 0.0){    
                                gl_PointSize = 0.0;
                                return;
                            }

                            // mouse.x means timestamp
                            float progress = clamp((timestamp - mouse.x) * speed , 0.0, 1.);

                            vec3 startPosition = position;

                            vec4 localCenter = inverseModelMatrix * vec4(position, 1.0);

                            vec3 cPosition = vec3(mouse.y, mouse.z, mouse.w);
                            cPosition = cPosition * 2.0 - 1.0;

                            // mouse.y means random 0~1
                            float theta = cPosition.x * PI2 - PI;

                            float viewDependentRad = 1.0;
                            float rad = viewDependentRad * spread * cPosition.y;

                            float x = localCenter.x + rad * cos(theta);
                            float y = localCenter.y + rad * sin(theta);
                            float z = 0.0;

                            vec4 endPosition4 = modelMatrix * vec4(vec3(x, y, z), 1.0);
                            vec3 endPosition = endPosition4.xyz; 
                            
                            float positionProgress = cubicOut(progress * random);
                            vec3 currentPosition = mix(startPosition, endPosition, positionProgress);

                            float diff = 100.0; 

                            vProgress = progress;
                            vRandom = random;
                            vDiff = diff;
                            vSpreadLength = cPosition.y;
                            vPositionZ = 1.0;

                            gl_Position = czm_modelViewProjection * vec4(currentPosition, 1.0);;

                            float factor = pow(progress, 0.1);
                          
                            gl_PointSize = max(size * diff * pixelRatio * factor , minSize * (pixelRatio > 1. ? 1.3 : 1.));
                           // gl_PointSize = 10.0;
                        }`;

        const fs = `
                        precision highp float;
             
                        in float vRandom;
                        in float vProgress;
                        in float vSpreadLength;
                        in float vPositionZ;
                        in float vDiff;

                        uniform float fadeSpeed;
                        uniform float shortRangeFadeSpeed;
                        uniform float minFlashingSpeed;
                        uniform float blur;
                        
                        highp float random(vec2 co) {
                            highp float a = 12.9898;
                            highp float b = 78.233;
                            highp float c = 43758.5453;
                            highp float dt = dot(co.xy, vec2(a, b));
                            highp float sn = mod(dt, 3.14);

                            return fract(sin(sn) * c);
                        }

                        float quadraticIn(float t) {
                            return t * t;
                        }

                        #ifndef HALF_PI
                        #define HALF_PI 1.5707963267948966
                        #endif

                        float sineOut(float t) {
                            return sin(t * HALF_PI);
                        }
                       
                        const vec3 baseColor = vec3(170., 133., 88.) / 255.;

                        void main() {
                            vec2 p = gl_PointCoord * 2. - 1.0;
                            float len = length(p);

                            float cRandom = random(vec2(vProgress * mix(minFlashingSpeed, 1., vRandom)));
                            cRandom = mix(0.3, 2.0, cRandom);
           
                            float cBlur = blur * mix(1.0, 0.3, vPositionZ);
                            float shape = smoothstep(1. - cBlur, 1. + cBlur, (1. - cBlur) / len);
                            shape *= mix(0.5, 1.0, vRandom);

                            if (shape == 0.0)  {
                                discard;
                            }

                            float darkness = mix(0.1, 1., vPositionZ);
                            float alphaProgress = vProgress * fadeSpeed * 50.0 * mix(2.5, 1., pow(vDiff, 0.6));
                            alphaProgress *= mix(shortRangeFadeSpeed, 1., sineOut(vSpreadLength) * quadraticIn(vDiff));

                            float alpha = 1. - min(alphaProgress, 1.);
                            alpha *= cRandom * vDiff;

                            out_FragColor = vec4(baseColor * darkness * cRandom, shape * alpha);

                           // out_FragColor = vec4(1.0, 1.0, 0.0, shape * alpha);
                        }`;

        const shaderProgram = ShaderProgram.fromCache({
            context: this._scene.context,
            vertexShaderSource: vs,
            fragmentShaderSource: fs,
            attributeLocations: {
                position: 0,
                mouse: 1,
                aFront: 2,
                random: 3
            }
        });

        return new DrawCommand({
            vertexArray: vertexArray,
            shaderProgram: shaderProgram,
            uniformMap: {
                pixelRatio: () => window.devicePixelRatio,
                timestamp: () => this._timestamp,
                size: () => 0.05,
                minSize: () => 1,
                speed: () => 0.012,
                fadeSpeed: () => 1.1,
                shortRangeFadeSpeed: () => 1.3,
                minFlashingSpeed: () => 0.1,
                spread: () => 7,
                maxSpread: () => 5,
                maxZ: () => 100,
                blur: () => 1,
                far: () => 10,
                maxDiff: () => 100,
                diffPow: () => 0.24,
                modelMatrix: () => this._modelMatrix,
                inverseModelMatrix: () => this._inverseModelMatrix
            },
            renderState: RenderState.fromCache({
                blending: BlendingState.ADDITIVE_BLEND
            }),
            pass: Pass.OPAQUE,
            primitiveType: PrimitiveType.POINTS
        });
    }

    updatePosition(modelMatrix) {
        const vertexArray = this._createVertexArray(modelMatrix);

        if (this._command) {
            this._command.vertexArray = vertexArray;
        } else {
            this._command = this._createDrawCommand(vertexArray);
        }
    }

    updateTimestamp(julianDate) {
        this._timestamp = julianDate.secondsOfDay;
    }

    update(frameState) {
        if (!this._command) {
            return;
        }

        const commandList = frameState.commandList;
        const passes = frameState.passes;

        if (passes.render) {
            commandList.push(this._command);
        }
    }
}

export default Trail;

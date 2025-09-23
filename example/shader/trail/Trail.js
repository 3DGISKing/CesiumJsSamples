const { BlendingState, Cartesian2, Cartesian3, DrawCommand, Geometry, GeometryAttribute, Pass, PrimitiveType, RenderState, ShaderProgram, VertexArray, Viewer } = Cesium;

const PARTICLE_COUNT_PER_MOUSE = 800;
const COUNT = PARTICLE_COUNT_PER_MOUSE * 400;
const POSITION_ATTRIBUTE_COUNT = 3;
const MOUSE_ATTRIBUTE_COUNT = 4;

const scratchFront = new Cartesian3();
const scratchStep = new Cartesian3();

class Trail {
    constructor(scene) {
        this._scene = scene;

        this._count = COUNT;

        const count = this._count;

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
            mouse[i * 4 + 1] = -1;
            mouse[i * 4 + 2] = 0;
            mouse[i * 4 + 3] = 0;

            aFront[i * 2 + 0] = 0;
            aFront[i * 2 + 1] = 0;

            this._random[i] = Math.random();
        }

        this._timestamp = 0; // JulianDate.secondsOfDay
        this._oldPosition = null;
    }

    isDestroyed() {
        return false;
    }

    _createVertexArray(position) {
        const diff = new Cartesian3();

        if (this._oldPosition) {
            Cartesian3.subtract(position, this._oldPosition, diff);
        }

        const length = Cartesian3.magnitude(diff);
        const front = Cartesian3.normalize(diff, scratchFront);

        for (let i = 0; i < PARTICLE_COUNT_PER_MOUSE; i++) {
            const ci = (this._positionIndex % (COUNT * POSITION_ATTRIBUTE_COUNT)) + i * POSITION_ATTRIBUTE_COUNT;

            let subPosition = position;

            if (this._oldPosition) {
                const step = Cartesian3.multiplyByScalar(diff, i / PARTICLE_COUNT_PER_MOUSE, scratchStep);

                subPosition = Cartesian3.add(this._oldPosition, step, position);
            }

            this._positions[ci + 0] = subPosition.x;
            this._positions[ci + 1] = subPosition.y;
            this._positions[ci + 2] = subPosition.z;
        }

        for (let i = 0; i < PARTICLE_COUNT_PER_MOUSE; i++) {
            const ci = (this._mouseIndex % (COUNT * MOUSE_ATTRIBUTE_COUNT)) + i * MOUSE_ATTRIBUTE_COUNT;

            this._mouse[ci + 0] = this._timestamp;
        }

        this._oldPosition = position;
        this._positionIndex += POSITION_ATTRIBUTE_COUNT * PARTICLE_COUNT_PER_MOUSE;
        this._mouseIndex += MOUSE_ATTRIBUTE_COUNT * PARTICLE_COUNT_PER_MOUSE;

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

        const scene = this._scene;
        const context = scene.context;

        return VertexArray.fromGeometry({
            context: context,
            geometry: geometry,
            attributeLocations: {
                position: 0,
                mouse: 1,
                aFront: 2,
                random: 3
            }
        });
    }

    updatePosition(position) {
        const vertexArray = this._createVertexArray(position);

        if (this._command) {
            this._command.vertexArray = vertexArray;
        } else {
            const vs = `
                        precision highp float;
                        precision highp int;

                        in vec3 position;
                        in vec4 mouse;
                        in vec2 aFront;
                        in float random;
                     
                        uniform vec2 resolution;
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

                        out float vProgress;
                        out float vRandom;
                        out float vDiff;
                        out float vSpreadLength;
                        out float vPositionZ;

                        const float PI = 3.1415926;
                        const float PI2 = PI * 2.;

                        float cubicOut(float t) {
                            float f = t - 1.0;
                            return f * f * f + 1.0;
                        }

 
                        vec2 cartesianToPolar(vec2 p) {
                            return vec2((atan(p.y, p.x) + PI) / PI2, length(p));
                        }

                        vec2 polarToCartesian(vec2 p) {
                            float r = p.x * PI2 - PI;
                            float l = p.y;
                            return vec2(cos(r) * l, sin(r) * l);
                        }

                        void main() {
                            if(position.x == 0.0 && position.y == 0.0 && position.z == 0.0){    
                                
                                gl_PointSize = 0.0;
                                return;
                            }

                            // mouse.x means timestamp
                            float progress = clamp((timestamp - mouse.x) * speed , 0., 1.);

                            float u = random;
                            float v = random;

                            float theta = 2.0 * PI * u;
                            float phi = acos(2.0 * v - 1.0);

                            float d = 1.0;

                            float x = position.x + (d * sin(phi) * cos(theta));
                            float y = position.y + (d * sin(phi) * sin(theta));
                            float z = position.z + (d * cos(phi));

                            vec3 currentPosition = vec3(x, y, z);

                            vRandom = random;
                            vProgress = progress;

                            gl_Position = czm_modelViewProjection * vec4(currentPosition, 1.);

                            float diff = 50.0; 

                            gl_PointSize = max(random * size * diff * pixelRatio, minSize * (pixelRatio > 1. ? 1.3 : 1.));
                        }`;

            const fs = `
                        precision highp float;
             
                        in float vRandom;
                        in float vProgress;

                        uniform float fadeSpeed;
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
                       
                        const vec3 baseColor = vec3(170., 133., 88.) / 255.;

                        void main() {
                            float vPositionZ = 1.0;
                            float vDiff = 1.0;

                            vec2 p = gl_PointCoord * 2. - 1.0;

                            float len = 0.1;

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
                            float alpha = 1. - min(alphaProgress, 1.);
                            alpha *= cRandom * vDiff;

                            out_FragColor = vec4(baseColor * darkness * cRandom, shape * alpha);
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

            const scene = this._scene;

            this._command = new DrawCommand({
                vertexArray: vertexArray,
                shaderProgram: shaderProgram,
                uniformMap: {
                    resolution: () => new Cartesian2(scene.canvas.width, scene.canvas.height),
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
                    diffPow: () => 0.24
                },
                renderState: RenderState.fromCache({
                    blending: BlendingState.ADDITIVE_BLEND
                }),
                pass: Pass.OPAQUE,
                primitiveType: PrimitiveType.POINTS
            });
        }
    }

    updateTimestamp(julianDate) {
        this._timestamp = julianDate.secondsOfDay;
        //  console.log(this._timestamp);
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

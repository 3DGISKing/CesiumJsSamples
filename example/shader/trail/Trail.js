const { BlendingState, Cartesian2, DrawCommand, Geometry, GeometryAttribute, Pass, PrimitiveType, RenderState, ShaderProgram, VertexArray, Viewer } = Cesium;

const PARTICLE_COUNT_PER_MOUSE = 80;
const COUNT = PARTICLE_COUNT_PER_MOUSE * 400;
const MOUSE_ATTRIBUTE_COUNT = 4;

const scratchFront = new Cartesian2();
const scratchStep = new Cartesian2();

class Trail {
    constructor(scene) {
        this._scene = scene;

        this._count = COUNT;

        const count = this._count;

        this._positions = new Float32Array(count * 3);
        this._mouse = new Float32Array(count * 4);
        this._afront = new Float32Array(count * 2);
        this._random = new Float32Array(count);

        const positions = this._positions;
        const mouse = this._mouse;
        const aFront = this._afront;

        this.mouseI = 0;

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = Math.random();
            positions[i * 3 + 1] = Math.random();
            positions[i * 3 + 2] = Math.random();

            mouse[i * 4 + 0] = -1;
            mouse[i * 4 + 1] = -1;
            mouse[i * 4 + 2] = 0;
            mouse[i * 4 + 3] = 0;

            aFront[i * 2 + 0] = 0;
            aFront[i * 2 + 1] = 0;

            this._random[i] = Math.random();
        }

        this.oldPosition = null;
    }

    isDestroyed() {
        return false;
    }

    _createVertexArray(position, screenPosition, julianDate) {
        const secondsOfDay = julianDate.secondsOfDay;
        const x = screenPosition.x;
        const y = screenPosition.y;

        const newPosition = new Cartesian2(x, y);
        const diff = new Cartesian2();

        if (this.oldPosition) {
            Cartesian2.subtract(newPosition, this.oldPosition, diff);
        }

        const length = Cartesian2.magnitude(diff);
        const front = Cartesian2.normalize(diff, scratchFront);

        for (let i = 0; i < PARTICLE_COUNT_PER_MOUSE; i++) {
            const ci = (this.mouseI % (COUNT * MOUSE_ATTRIBUTE_COUNT)) + i * MOUSE_ATTRIBUTE_COUNT;

            let position = newPosition;

            if (this.oldPosition) {
                const step = Cartesian2.multiplyByScalar(diff, i / PARTICLE_COUNT_PER_MOUSE, scratchStep);

                position = Cartesian2.add(this.oldPosition, step, position);
            }

            //  console.log(ci);

            this._mouse[ci] = position.x;
            this._mouse[ci + 1] = position.y;
            this._mouse[ci + 2] = secondsOfDay;
            this._mouse[ci + 3] = length;

            this._afront[ci] = front.x;
            this._afront[ci + 1] = front.y;
        }

        this.oldPosition = newPosition;
        this.mouseI += MOUSE_ATTRIBUTE_COUNT * PARTICLE_COUNT_PER_MOUSE;

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

    updatePosition(position, screenPosition, julianDate) {
        const vertexArray = this._createVertexArray(position, screenPosition, julianDate);

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


                        float cubicOut(float t) {
                            float f = t - 1.0;
                            return f * f * f + 1.0;
                        }

                        const float PI = 3.1415926;
                        const float PI2 = PI * 2.;

                        vec2 cartesianToPolar(vec2 p) {
                            return vec2((atan(p.y, p.x) + PI) / PI2, length(p));
                        }

                        vec2 polarToCartesian(vec2 p) {
                            float r = p.x * PI2 - PI;
                            float l = p.y;
                            return vec2(cos(r) * l, sin(r) * l);
                        }

                        void main() {
                            float progress = clamp((timestamp - mouse.z) * speed, 0., 1.);
                            progress *= step(0., mouse.x);

                            float startX = mouse.x - resolution.x / 2.;
                            float startY = mouse.y - resolution.y / 2.;
                            vec3 startPosition = vec3(startX, startY, random);

                            float diff = clamp(mouse.w / maxDiff, 0., 1.);
                            diff = pow(diff, diffPow);

                            vec3 cPosition = position * 2. - 1.;

                            float radian = cPosition.x * PI2 - PI;
                            vec2 xySpread = vec2(cos(radian), sin(radian)) * spread * mix(1., maxSpread, diff) * cPosition.y;

                            vec3 endPosition = startPosition;
                            endPosition.xy += xySpread;
                            endPosition.xy -= aFront * far * random;
                            endPosition.z += cPosition.z * maxZ * (pixelRatio > 1. ? 1.2 : 1.);

                            float positionProgress = cubicOut(progress * random);

                            vec3 currentPosition = mix(startPosition, endPosition, positionProgress);

                            vProgress = progress;
                            vRandom = random;
                            vDiff = diff;
                            vSpreadLength = cPosition.y;
                            vPositionZ = position.z;

                            gl_Position = czm_modelViewProjection * vec4(currentPosition, 1.);
                            gl_PointSize = max(currentPosition.z * size * diff * pixelRatio, minSize * (pixelRatio > 1. ? 1.3 : 1.));

                            
                            gl_PointSize = 10.0;
                        }`;

            const fs = `
                        in vec4 v_color;
                        
                        void main() {
                            out_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
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
                    timestamp: () => julianDate.secondsOfDay,
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
                    blending: BlendingState.ALPHA_BLEND
                }),
                pass: Pass.TRANSLUCENT,
                primitiveType: PrimitiveType.POINTS
            });
        }
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

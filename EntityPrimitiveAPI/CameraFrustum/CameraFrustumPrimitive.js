const {
    Cartesian3,
    Color,
    ColorGeometryInstanceAttribute,
    FrustumOutlineGeometry,
    GeometryInstance,
    Matrix3,
    Matrix4,
    PerInstanceColorAppearance,
    Primitive,
    Transforms
} = window.Cesium;

export class CameraFrustumPrimitive {
    constructor(options) {
        this._cameraPosition = options.cameraPosition;

        this._frustum = options.frustum;

        this._update = true;
        this._show = true;
        this._modelMatrix = new Matrix4();
        this._heading = options.heading; // in radian
        this._pitch = options.pitch;
        this._roll = options.roll;
    }

    get position() {
        return this._cameraPosition;
    }

    set position(pos) {
        Cartesian3.clone(pos, this._cameraPosition);
        this._update = true;
    }

    get heading() {
        return this._heading;
    }

    set heading(val) {
        this._heading = val;
        this._update = true;
    }

    get pitch() {
        return this._pitch;
    }

    set pitch(val) {
        this._pitch = val;
        this._update = true;
    }

    get roll() {
        return this._roll;
    }

    set roll(val) {
        this._roll = val;
        this._update = true;
    }

    update(frameState) {
        if (!this._show) {
            return;
        }

        if (this._update) {
            this._update = false;

            const origin = this._cameraPosition;

            const heading = this._heading;
            const pitch = this._pitch;
            let roll = this._roll;

            const til = pitch + Math.PI / 2;

            roll *= -1;

            const ch = Math.cos(heading);
            const sh = Math.sin(heading);
            const ct = Math.cos(til);
            const st = Math.sin(til);
            const cr = Math.cos(roll);
            const sr = Math.sin(roll);

            //calc rot mat in terms of local ENU frame
            const myrig = new Cartesian3(ch * cr + sh * ct * sr, sh * cr * -1 + ch * ct * sr, st * sr);
            const mydir = new Cartesian3(sh * st, ch * st, ct * -1);
            const myup = new Cartesian3(sh * ct * cr + ch * sr * -1, ch * ct * cr + sh * sr, st * cr);

            //transform rot mat to world coordinates
            const GD_transform = Transforms.eastNorthUpToFixedFrame(origin); //rot-tran

            const GD_rotmat = Matrix4.getMatrix3(GD_transform, new Matrix3());

            Matrix3.multiplyByVector(GD_rotmat, myrig, myrig);
            Matrix3.multiplyByVector(GD_rotmat, mydir, mydir);
            Matrix3.multiplyByVector(GD_rotmat, myup, myup);

            const rot = [myrig.x, myrig.y, myrig.z, mydir.x, mydir.y, mydir.z, myup.x, myup.y, myup.z];

            this._primitive = new Primitive({
                geometryInstances: new GeometryInstance({
                    geometry: new FrustumOutlineGeometry({
                        origin: new Cartesian3(),
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        frustum: this._frustum
                    }),
                    modelMatrix: [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1], // twist 90deg around x
                    attributes: {
                        color: ColorGeometryInstanceAttribute.fromColor(new Color(1, 1, 1))
                    }
                }),
                modelMatrix: [
                    rot[0],
                    rot[1],
                    rot[2],
                    0,
                    rot[3],
                    rot[4],
                    rot[5],
                    0,
                    rot[6],
                    rot[7],
                    rot[8],
                    0,
                    origin.x,
                    origin.y,
                    origin.z,
                    1
                ],
                appearance: new PerInstanceColorAppearance({
                    translucent: false,
                    flat: true
                }),
                asynchronous: false,
                show: true
            });
        }

        this._primitive.update(frameState);
    }
}

const { Cartesian3, DebugModelMatrixPrimitive, HeadingPitchRoll, Ion, PerspectiveFrustum, Transforms, Viewer } =
    window.Cesium;

import { CameraFrustumPrimitive } from "./CameraFrustumPrimitive.js";

const CesiumMath = window.Cesium.Math;

Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMGQ4MTRjOS00OWE3LTQyMmItYTAwZC0wZjUyNDlhOGNhYzkiLCJpZCI6OTc4NiwiaWF0IjoxNjk3MDMwMTEyfQ.eMHVqKOByOrvvhwJN9BgcZ57eLMiNJh7yCiJ9lFtzUc";

const viewer = new Viewer("cesiumContainer");

const position = Cartesian3.fromDegrees(-107.0, 40.0, 300000.0);

const air = viewer.entities.add({
    show: true,
    position: position,
    model: {
        uri: "./Cesium_Air.glb",
        minimumPixelSize: 128 * 5,
        maximumScale: 100000
    }
});

const frustum = new PerspectiveFrustum({
    fov: viewer.camera.frustum.fov,
    aspectRatio: 3,
    near: 0.01,
    far: 5000000
});

const frustumPrimitive = viewer.scene.primitives.add(
    new CameraFrustumPrimitive({
        cameraPosition: position,
        frustum: frustum,
        heading: CesiumMath.toRadians(90),
        pitch: 0,
        roll: 0
    })
);

viewer.scene.primitives.add(
    new DebugModelMatrixPrimitive({
        modelMatrix: Transforms.eastNorthUpToFixedFrame(position),
        length: 5000000.0,
        width: 3.0
    })
);

const viewModel = {
    heading: 0,
    pitch: 0,
    roll: 0
};

Cesium.knockout.track(viewModel);

const toolbar = document.getElementById("toolbar");

Cesium.knockout.applyBindings(viewModel, toolbar);

Cesium.knockout.getObservable(viewModel, "heading").subscribe(update);
Cesium.knockout.getObservable(viewModel, "pitch").subscribe(update);
Cesium.knockout.getObservable(viewModel, "roll").subscribe(update);

update();

function update() {
    const heading = CesiumMath.toRadians(parseFloat(viewModel.heading));
    const pitch = CesiumMath.toRadians(parseFloat(viewModel.pitch));
    const roll = CesiumMath.toRadians(parseFloat(viewModel.roll));

    const hpr = new HeadingPitchRoll(heading, pitch, roll);

    const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

    air.orientation = orientation;

    frustumPrimitive.heading = CesiumMath.toRadians(parseFloat(viewModel.heading) + 90);
    frustumPrimitive.pitch = pitch;
    frustumPrimitive.roll = roll;
}

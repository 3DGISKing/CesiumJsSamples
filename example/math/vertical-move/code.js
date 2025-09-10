// for https://stackoverflow.com/questions/69045207/cesium-cartesian3-move-vertically-up

const viewer = new Cesium.Viewer("cesiumContainer");

const viewModel = {
    verticalAmount: 0
};

Cesium.knockout.track(viewModel);
const toolbar = document.getElementById("toolbar");
Cesium.knockout.applyBindings(viewModel, toolbar);

const position = Cesium.Cartesian3.fromDegrees(129.50778, 42.9075, 0);
const origMagnitude = Cesium.Cartesian3.magnitude(position);

const radius = 10;

const ballPosition = new Cesium.Cartesian3();

viewer.entities.add({
    position: new Cesium.CallbackProperty(function () {
        const newMagnitude = origMagnitude + parseFloat(viewModel.verticalAmount);

        const scalar = newMagnitude / origMagnitude;

        return Cesium.Cartesian3.multiplyByScalar(position, scalar, ballPosition);
    }, false),
    ellipsoid: {
        radii: new Cesium.Cartesian3(radius, radius, radius)
    }
});

viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(position, radius * 10));

function newBall() {
    const newMagnitude = origMagnitude + parseFloat(viewModel.verticalAmount);

    const scalar = newMagnitude / origMagnitude;

    Cesium.Cartesian3.multiplyByScalar(position, scalar, ballPosition);

    viewer.entities.add({
        position: ballPosition,
        ellipsoid: {
            radii: new Cesium.Cartesian3(radius, radius, radius)
        }
    });
}

Sandcastle.addToolbarButton("New ball", function () {
    newBall();
});

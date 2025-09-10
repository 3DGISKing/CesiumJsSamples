const {
    Cartesian3,
    HeadingPitchRange,
    HeadingPitchRoll,
    Math: CesiumMath,
    Matrix4,
    Model,
    ModelAnimationLoop,
    ModelInstanceCollection,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    Transforms,
    Viewer
} = window.Cesium;

Cesium.Ion.defaultAccessToken = window.CesiumIonAccessToken;

const viewer = new Viewer("cesiumContainer", { shouldAnimate: true });
const scene = viewer.scene;
const context = scene.context;
const camera = viewer.camera;
scene.debugShowFramesPerSecond = true;

const instancedArraysExtension = context._instancedArrays;
const count = 1024;
const spacing = 0.0002;
var modelPath = "./assets/models/";

const url = modelPath + "Cesium_Air.glb";

const useCollection = true;

const centerLongitude = -75.61209431;
const centerLatitude = 40.042530612;
const height = 50.0;

function orientCamera(center, radius) {
    const range = Math.max(radius, camera.frustum.near) * 2.0;
    const heading = CesiumMath.toRadians(230.0);
    const pitch = CesiumMath.toRadians(-20.0);
    camera.lookAt(center, new HeadingPitchRange(heading, pitch, range));
    camera.lookAtTransform(Matrix4.IDENTITY);
}

function createCollection(instances) {
    const collection = scene.primitives.add(
        new ModelInstanceCollection({
            url: url,
            instances: instances
        })
    );

    collection.readyPromise
        .then(function (collection) {
            // Play and loop all animations at half-speed
            collection.activeAnimations.addAll({
                multiplier: 0.5,
                loop: ModelAnimationLoop.REPEAT
            });
            orientCamera(collection._boundingSphere.center, collection._boundingSphere.radius);
        })
        .otherwise(function (error) {
            window.alert(error);
        });
}

function createModels(instances) {
    const points = [];
    let model;

    const length = instances.length;

    for (const i = 0; i < length; ++i) {
        const instance = instances[i];
        const modelMatrix = instance.modelMatrix;
        const translation = new Cartesian3();
        Matrix4.getTranslation(modelMatrix, translation);
        points.push(translation);

        model = scene.primitives.add(
            Model.fromGltf({
                url: url,
                modelMatrix: modelMatrix
            })
        );

        model.readyPromise
            .then(function (model) {
                // Play and loop all animations at half-speed
                model.activeAnimations.addAll({
                    multiplier: 0.5,
                    loop: ModelAnimationLoop.REPEAT
                });
            })
            .otherwise(function (error) {
                window.alert(error);
            });
    }

    model.readyPromise.then(function (model) {
        const boundingSphere = new BoundingSphere();
        BoundingSphere.fromPoints(points, boundingSphere);
        orientCamera(boundingSphere.center, boundingSphere.radius + model.boundingSphere.radius);
    });
}

function reset() {
    scene.primitives.removeAll();
    const instances = [];
    const gridSize = Math.sqrt(count);

    for (let y = 0; y < gridSize; ++y) {
        for (const x = 0; x < gridSize; ++x) {
            const longitude = centerLongitude + spacing * (x - gridSize / 2);
            const latitude = centerLatitude + spacing * (y - gridSize / 2);
            const position = Cartesian3.fromDegrees(longitude, latitude, height);

            const heading = Math.random();
            const pitch = Math.random();
            const roll = Math.random();
            const scale = (Math.random() + 1.0) / 2.0;

            const modelMatrix = Transforms.headingPitchRollToFixedFrame(position, new HeadingPitchRoll(heading, pitch, roll));
            Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix);

            instances.push({
                modelMatrix: modelMatrix
            });
        }
    }

    if (useCollection) {
        createCollection(instances);
    } else {
        createModels(instances);
    }
}

// Scale picked instances
const handler = new ScreenSpaceEventHandler(viewer.canvas);

handler.setInputAction(function (movement) {
    const pickedInstance = scene.pick(movement.position);
    if (defined(pickedInstance)) {
        console.log(pickedInstance);
        const instance = useCollection ? pickedInstance : pickedInstance.primitive;
        const scaleMatrix = Matrix4.fromUniformScale(1.1);
        const modelMatrix = Matrix4.multiply(instance.modelMatrix, scaleMatrix, new Matrix4());
        instance.modelMatrix = modelMatrix;
    }
}, ScreenSpaceEventType.LEFT_CLICK);

Sandcastle.addToolbarMenu([
    {
        text: "1024 instances",
        onselect: function () {
            count = 1024;
            reset();
        }
    },
    {
        text: "100 instances",
        onselect: function () {
            count = 100;
            reset();
        }
    },
    {
        text: "25 instances",
        onselect: function () {
            count = 25;
            reset();
        }
    },
    {
        text: "4 instances",
        onselect: function () {
            count = 4;
            reset();
        }
    },
    {
        text: "10000 instances",
        onselect: function () {
            count = 10000;
            reset();
        }
    }
]);

Sandcastle.addToolbarMenu([
    {
        text: "Aircraft",
        onselect: function () {
            url = modelPath + "CesiumAir/Cesium_Air.gltf";
            spacing = 0.0002;
            reset();
        }
    },
    {
        text: "Ground Vehicle",
        onselect: function () {
            url = modelPath + "GroundVehicle.glb";
            spacing = 0.00008;
            reset();
        }
    },
    {
        text: "Milk Truck",
        onselect: function () {
            url = modelPath + "CesiumMilkTruck.glb";
            spacing = 0.00008;
            reset();
        }
    },
    {
        text: "Skinned Character",
        onselect: function () {
            url = modelPath + "Cesium_Man.glb";
            spacing = 0.00001;
            reset();
        }
    }
]);

Sandcastle.addToolbarMenu([
    {
        text: "Instancing Enabled",
        onselect: function () {
            context._instancedArrays = instancedArraysExtension;
            useCollection = true;
            reset();
        }
    },
    {
        text: "Instancing Disabled",
        onselect: function () {
            context._instancedArrays = undefined;
            useCollection = true;
            reset();
        }
    },
    {
        text: "Individual models",
        onselect: function () {
            useCollection = false;
            reset();
        }
    }
]);

Sandcastle.addToolbarButton("2D", function () {
    scene.morphTo2D(0.0);
});

Sandcastle.addToolbarButton("CV", function () {
    scene.morphToColumbusView(0.0);
});

Sandcastle.addToolbarButton("3D", function () {
    scene.morphTo3D(0.0);
});

reset();

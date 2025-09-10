// https://stackoverflow.com/questions/69121206/background-image-not-changed-in-cesium-map

var viewer = new Cesium.Viewer("cesiumContainer", {
    animation: false,

    timeline: false
});

var scene = viewer.scene;
scene.skyBox = new Cesium.SkyBox({
    sources: {
        positiveX: "https://threejs.org/examples/textures/cube/Park3Med/px.jpg",
        negativeX: "https://threejs.org/examples/textures/cube/Park3Med/nx.jpg",
        positiveY: "https://threejs.org/examples/textures/cube/Park3Med/py.jpg",
        negativeY: "https://threejs.org/examples/textures/cube/Park3Med/ny.jpg",
        positiveZ: "https://threejs.org/examples/textures/cube/Park3Med/pz.jpg",
        negativeZ: "https://threejs.org/examples/textures/cube/Park3Med/nz.jpg"
    }
});

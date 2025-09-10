const {
    ArcType,
    BoundingSphere,
    Cartesian3,
    Color,
    HeadingPitchRoll,
    PolylineArrowMaterialProperty,
    Transforms,
    Viewer
} = window.Cesium;
const CesiumMath = window.Cesium.Math;

let cesiumViewer;
let camera, scene, renderer, threeSphere, axesHelper, gridHelper;

const torusKnotSize = 100;
const torusKnotPosition = [129.3653799, 42.9093989];
const earthRadius = 6378137;

function initCesium() {
    cesiumViewer = new Viewer(cesiumContainer, {
        useDefaultRenderLoop: false,
        contextOptions: {
            webgl: {
                alpha: false,
                antialias: true,
                preserveDrawingBuffer: true,
                failIfMajorPerformanceCaveat: false,
                depth: true,
                stencil: false,
                anialias: false
            }
        }
    });

    cesiumViewer.scene.globe.depthTestAgainstTerrain = true;

    const axisLength = earthRadius * 2;

    const xAxisEnd = new Cartesian3(axisLength, 0, 0);
    const yAxisEnd = new Cartesian3(0, axisLength, 0);
    const zAxisEnd = new Cartesian3(0, 0, axisLength);

    cesiumViewer.entities.add({
        polyline: {
            positions: [new Cartesian3(1, 0, 0), xAxisEnd],
            width: 10,
            arcType: ArcType.NONE,
            material: new PolylineArrowMaterialProperty(Color.RED)
        }
    });

    cesiumViewer.entities.add({
        polyline: {
            positions: [new Cartesian3(1, 0, 0), yAxisEnd],
            width: 10,
            arcType: ArcType.NONE,
            material: new PolylineArrowMaterialProperty(Color.YELLOW)
        }
    });

    cesiumViewer.entities.add({
        polyline: {
            positions: [new Cartesian3(1, 0, 0), zAxisEnd],
            width: 10,
            arcType: ArcType.NONE,
            material: new PolylineArrowMaterialProperty(Color.BLUE)
        }
    });
}

function initThree(viewer) {
    let container = document.getElementById("threeContainer");

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        CesiumMath.toDegrees(viewer.camera.frustum.fovy),
        window.innerWidth / window.innerHeight,
        viewer.camera.frustum.near,
        viewer.camera.frustum.far
    );

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    window.addEventListener("resize", onWindowResize, false);

    // helpers
    axesHelper = new THREE.AxesHelper(earthRadius * 2.5);

    axesHelper.visible = false;
    scene.add(axesHelper);

    const size = earthRadius * 3;
    const divisions = 10;

    gridHelper = new THREE.GridHelper(size, divisions);

    gridHelper.visible = false;
    scene.add(gridHelper);

    // sphere
    const geometry = new THREE.SphereGeometry(earthRadius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    threeSphere = new THREE.Mesh(geometry, material);

    threeSphere.visible = false;
    scene.add(threeSphere);

    // teapot
    const torusKnotGeometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);

    const rot90X = new THREE.Matrix4().makeRotationX(CesiumMath.toRadians(90));

    torusKnotGeometry.applyMatrix4(rot90X);

    const wgs84Position = Cartesian3.fromDegrees(torusKnotPosition[0], torusKnotPosition[1]);

    const matrix = Transforms.headingPitchRollToFixedFrame(wgs84Position, new HeadingPitchRoll(0, 0, 0));

    const localToWgs84Mat = new THREE.Matrix4();

    localToWgs84Mat.set(
        matrix[0],
        matrix[4],
        matrix[8],
        matrix[12],
        matrix[1],
        matrix[5],
        matrix[9],
        matrix[13],
        matrix[2],
        matrix[6],
        matrix[10],
        matrix[14],
        matrix[3],
        matrix[7],
        matrix[11],
        matrix[15]
    );

    torusKnotGeometry.applyMatrix4(localToWgs84Mat);

    const teapot = new THREE.Mesh(torusKnotGeometry, new THREE.MeshPhongMaterial({ side: THREE.DoubleSide }));

    scene.add(teapot);

    const light = new THREE.DirectionalLight(0xffffff, 1.0);

    scene.add(light);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function syncThreeCameraWithCesium(camera, viewer) {
    camera.matrixAutoUpdate = false;

    let cvm = viewer.camera.viewMatrix;

    let civm = viewer.camera.inverseViewMatrix;

    camera.matrixWorld.set(
        civm[0],
        civm[4],
        civm[8],
        civm[12],
        civm[1],
        civm[5],
        civm[9],
        civm[13],
        civm[2],
        civm[6],
        civm[10],
        civm[14],
        civm[3],
        civm[7],
        civm[11],
        civm[15]
    );

    camera.matrixWorldInverse.set(
        cvm[0],
        cvm[4],
        cvm[8],
        cvm[12],
        cvm[1],
        cvm[5],
        cvm[9],
        cvm[13],
        cvm[2],
        cvm[6],
        cvm[10],
        cvm[14],
        cvm[3],
        cvm[7],
        cvm[11],
        cvm[15]
    );

    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);
    syncThreeCameraWithCesium(camera, cesiumViewer);

    render();
}

function render() {
    cesiumViewer.render();

    renderer.render(scene, camera);
}

function main() {
    initCesium();
    initThree(cesiumViewer);
    animate();

    Sandcastle.addToggleButton("Show / Hide Earth Coordinate", true, (checked) => {
        const entities = cesiumViewer.entities;

        for (let i = 0; i < entities.values.length; i++) {
            const entity = entities.values[i];

            entity.show = checked;
        }
    });

    Sandcastle.addToggleButton("Show / Hide Three Js Coordinate", false, (checked) => {
        gridHelper.visible = checked;
        axesHelper.visible = checked;
        threeSphere.visible = checked;
    });

    Sandcastle.addToolbarButton("Go to Three js Teapot", function () {
        const wgs84Position = Cartesian3.fromDegrees(torusKnotPosition[0], torusKnotPosition[1], 0);

        cesiumViewer.camera.flyToBoundingSphere(new BoundingSphere(wgs84Position, torusKnotSize * 10));
    });

    Sandcastle.addToggleButton("Show / Hide Cesium Globe", true, function (checked) {
        cesiumViewer.scene.globe.show = checked;
    });
}

main();

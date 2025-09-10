const { Rectangle, Camera, Viewer, ScreenSpaceEventHandler, Color, HeightReference, ColorMaterialProperty, CallbackProperty, defined, Cartesian3, Matrix4, ScreenSpaceEventType } = window.Cesium;

const extent = Rectangle.fromDegrees(117.896284, 31.499028, 139.59738, 43.3115285);
Camera.DEFAULT_VIEW_RECTANGLE = extent;
Camera.DEFAULT_VIEW_FACTOR = 0.7;

const viewer = new Viewer("cesiumContainer", {
    selectionIndicator: false,
    infoBox: false,
    timeline: false,
    animation: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false
});

const scene = viewer.scene;
let drawingMode = "line";
let activeShapePoints = [];
let activeShape;
let floatingPoint;
const handler = new ScreenSpaceEventHandler(viewer.canvas);
let shape;
let point;

var options = [
    {
        text: "Line",
        onselect: () => {
            terminateShape();
            drawingMode = "line";
        }
    },
    {
        text: "Polygon",
        onselect: () => {
            terminateShape();
            drawingMode = "polygon";
        }
    },
    {
        text: "Clear",
        onselect: () => {
            clearView();
        }
    }
];

const createPoint = (worldPosition) => {
    point = viewer.entities.add({
        position: worldPosition,
        point: {
            color: Color.RED,
            pixelSize: 10,
            heightReference: HeightReference.CLAMP_TO_GROUND
        }
    });
    return point;
};

const drawShape = (positionData) => {
    if (drawingMode === "line") {
        shape = viewer.entities.add({
            polyline: {
                positions: positionData,
                clampToGround: true,
                width: 3
            }
        });
    } else if (drawingMode === "polygon") {
        shape = viewer.entities.add({
            polygon: {
                hierarchy: positionData,
                material: new ColorMaterialProperty(Color.AQUA.withAlpha(0.15))
            }
        });
    }
    return shape;
};

handler.setInputAction((event) => {
    const earthPosition = viewer.scene.pickPosition(event.position);
    if (defined(earthPosition)) {
        if (activeShapePoints.length === 0) {
            floatingPoint = createPoint(earthPosition);
            activeShapePoints.push(earthPosition);
            const dynamicPositions = new CallbackProperty(() => {
                const positions = {};
                positions.positions = activeShapePoints;
                if (drawingMode === "line") return activeShapePoints;
                else return positions;
            }, false);
            activeShape = drawShape(dynamicPositions);
        }
        activeShapePoints.push(earthPosition);
        createPoint(earthPosition);
    }
}, ScreenSpaceEventType.LEFT_CLICK);

handler.setInputAction((event) => {
    if (defined(floatingPoint)) {
        const newPosition = viewer.scene.pickPosition(event.endPosition);
        if (defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
        }
    }
}, ScreenSpaceEventType.MOUSE_MOVE);

const terminateShape = () => {
    activeShapePoints.pop();
    drawShape(activeShapePoints);
    viewer.entities.remove(floatingPoint);
    viewer.entities.remove(activeShape);
    floatingPoint = undefined;
    activeShape = undefined;
    activeShapePoints = [];
};

handler.setInputAction(() => {
    terminateShape();
}, ScreenSpaceEventType.RIGHT_CLICK);

const clearView = () => {
    viewer.entities.removeAll(shape);
    viewer.entities.remove(point);
    viewer.entities.remove(floatingPoint);
    viewer.entities.remove(activeShape);
};

Sandcastle.addToolbarMenu(options, "toolbar");

viewer.camera.lookAt(Cartesian3.fromDegrees(126.969195, 37.497851, 1000.0), new Cartesian3(5000.0, 5000.0, 5000.0));
viewer.camera.lookAtTransform(Matrix4.IDENTITY);

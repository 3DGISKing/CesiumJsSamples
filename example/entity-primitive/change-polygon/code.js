// to answer https://stackoverflow.com/questions/72198612/cesium-polygon-callback-using-javascript

const { Cartesian3, CallbackProperty, Color, defined, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer } = window.Cesium;

const viewer = new Viewer("cesiumContainer");

let redPolygon;
const polygonCollection = [];
const pointsCollection = [];
const polygonId = "myArray";

let polygonPoints = [-95.8079865631313, 30.24038650541154, -60.10509002138564, 23.526593580490083, -59.06372427570612, 2.245934026097194, -117.00668212362282, 3.938434130034481];

function loadPoly() {
    redPolygon = viewer.entities.add({
        id: polygonId,
        name: "myArray",
        polygon: {
            hierarchy: new CallbackProperty(() => {
                return {
                    positions: Cartesian3.fromDegreesArray(polygonPoints)
                };
            }, false),
            material: Color.fromBytes(221, 240, 235, 160)
        }
    });

    polygonCollection.push(redPolygon);

    adding_billboard(-95.8079865631313, 30.24038650541154, "A", "-95.8079865631313, 30.24038650541154");
    adding_billboard(-60.10509002138564, 23.526593580490083, "A", "-60.10509002138564, 23.526593580490083");
    adding_billboard(-59.06372427570612, 2.245934026097194, "A", "-59.06372427570612, 2.245934026097194");
    adding_billboard(-117.00668212362282, 3.938434130034481, "A", "-117.00668212362282, 3.938434130034481");

    viewer.flyTo(redPolygon);
}

function adding_billboard(lon, lat, name, popup) {
    const entity = viewer.entities.add({
        name: name,
        position: Cartesian3.fromDegrees(lon, lat, 2000),
        billboard: {
            image: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png",
            show: true, // default
            pixelOffset: new Cesium.Cartesian2(0, -20), // default: (0, 0)
            eyeOffset: new Cartesian3(0.0, 0.0, 0.0), // default
            horizontalOrigin: Cesium.HorizontalOrigin.bottom, // default
            alignedAxis: Cesium.Cartesian3.ZERO, // default
            width: 20, // default: undefined
            height: 25 // default: undefined
            //disableDepthTestDistance: Number.POSITIVE_INFINITY, // draws the label in front of terrain
            // on ground show
        },
        label: {
            text: popup,
            font: "7pt sans-serif",
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BASELINE,
            fillColor: Color.BLACK,
            showBackground: true,
            backgroundColor: new Color(1, 1, 1, 0.7),
            backgroundPadding: new Cesium.Cartesian2(8, 4),
            disableDepthTestDistance: Number.POSITIVE_INFINITY // draws the label in front of terrain
        }
    });

    pointsCollection.push(entity);
}

loadPoly();

const scene = viewer.scene;
const handler = new ScreenSpaceEventHandler(scene.canvas);

handler.setInputAction(function (click) {
    const pickedObject = scene.pick(click.position);

    if (defined(pickedObject) && pickedObject.id && pickedObject.id.id === polygonId) {
        const newPolygonPoints = [76.82071632075994, 33.4134542888633, 77.83750798568438, 33.39276536442791, 77.32892923803021, 32.93547457354476];

        polygonPoints = newPolygonPoints;

        viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(76.82071632075994, 33.4134542888633, 1000)
        });
    }
}, ScreenSpaceEventType.LEFT_CLICK);

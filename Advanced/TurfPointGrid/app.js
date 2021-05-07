const Cartesian3 = Cesium.Cartesian3;
const Color = Cesium.Color;

let viewer, scene;
let thePolygonDrawing = null;
let theGridPointPrimitiveCollectionRequest = null;
let thePointPrimitiveCollectionInGrid = null;

function main() {
    // create cesium viewer.
    viewer = new Cesium.Viewer('cesiumContainer');

    // store scene
    scene = viewer.scene;

    var tileset = new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(40866),
    });

    viewer.scene.primitives.add(tileset);
    viewer.zoomTo(tileset);

    // construct the polygon drawing tool as global
    thePolygonDrawing = new PolygonDrawing({
        scene : scene,
        polygonOptions : {
            color : Color.WHITE.withAlpha(0.5),
        },
        polylineOptions : {
            color : Color.BLUE,
        },
        pointOptions : {
            pixelSize : 10,
            color : Color.RED,
            position : new Cartesian3(),
            disableDepthTestDistance : Number.POSITIVE_INFINITY, // for draw-over
            show : false
        }
    });

    // when the user clicks the 'Start Drawing' button
    Sandcastle.addToolbarButton("Start Drawing", function () {
        if(thePolygonDrawing.started()) {
            alert('already started!');
            return;
        }

        if(theGridPointPrimitiveCollectionRequest)
        {
            alert("please wait until generating is finished!");
            return;
        }

        thePolygonDrawing.startDrawing();
    });

    // when the user clicks the 'Stop Drawing' button
    Sandcastle.addToolbarButton("Stop Drawing", function () {
        if(!thePolygonDrawing.started()) {
            alert('not started!');
            return;
        }

        if(theGridPointPrimitiveCollectionRequest)
        {
            alert("please wait until generating is finished!");
            return;
        }

        thePolygonDrawing.stopDrawing();
    });

    // when the user clicks the 'Generate Point Grid' button
    Sandcastle.addToolbarButton("Generate Point Grid", function () {
        const cartesians = thePolygonDrawing.positions();

        if(cartesians.length <= 2) {
            alert("please draw polygon!");
            return;
        }

        if(theGridPointPrimitiveCollectionRequest){
            alert("please wait until generating is finished!");
            return;
        }

        if(thePointPrimitiveCollectionInGrid) {
            scene.primitives.remove(thePointPrimitiveCollectionInGrid);
            thePointPrimitiveCollectionInGrid = null;
        }

        const cellSide = 0.0001; // 10 cm

        // make the async request to get points in the drawn polygon
        theGridPointPrimitiveCollectionRequest = new GridPointPrimitiveCollectionRequest({
            scene : scene,           // viewer 's scene
            cartesians : cartesians, // vertexes of polygon
            cellSide : cellSide,    // cell side parameter of Turf.PointGrid
            updateCount : 10        // updated count of point primitive per frame
        });

        theGridPointPrimitiveCollectionRequest.readyPromise.then(function (pointPrimitiveCollection) {
            // when the request is resolved, we add the point primitives to the scene.

            scene.primitives.add(pointPrimitiveCollection);
            thePointPrimitiveCollectionInGrid = pointPrimitiveCollection;
            theGridPointPrimitiveCollectionRequest = null;
        })
    });

    // when the user clicks the 'Clear' button
    Sandcastle.addToolbarButton("Clear", function () {
        if(!thePointPrimitiveCollectionInGrid) {
            alert('no generated!');
            return;
        }

        scene.primitives.remove(thePointPrimitiveCollectionInGrid);

        thePointPrimitiveCollectionInGrid = null;
    });
}

main();

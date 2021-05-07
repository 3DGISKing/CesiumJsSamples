importScripts('https://npmcdn.com/@turf/turf/turf.min.js');

function getPointsGrid(degrees, bbox, cellSide) {

    // utility function which converts the degree array to turf polygon
    function turfPolygon(degrees) {
        const first = degrees[0];

        degrees.push(first);

        return turf.polygon(
            [ degrees]
        );
    }

    // mask
    const polygon = turfPolygon(degrees);

    // options
    const options = {
        units: 'kilometers',
        mask : polygon
    };

    // run pointGrid. this may take some time for large area.
    // this is why we do this in web worker
    const grid = turf.pointGrid(bbox, cellSide, options);

    let ret = [];

    // convert turf point features to degree array
    for(let i = 0 ; i < grid.features.length; i++) {
        const feature = grid.features[i];
        const geometry = feature.geometry;

        const coordinates = geometry.coordinates;

        ret.push(coordinates);
    }

    return ret;
}

onmessage = (e) => {
    const degrees = e.data.degrees;
    const bbox = e.data.bbox;
    const cellSide = e.data.cellSide;

    // get parameters from main GUL thread
    const pointGrid = getPointsGrid(degrees, bbox, cellSide);

    // sends the result to the GUL thread
    postMessage(pointGrid);
};



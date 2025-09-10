var viewer = new Cesium.Viewer("cesiumContainer");

const positions = [
    new Cesium.Cartesian3(27491.83918202976, 5887903.419371324, 2443888.2134126844),
    new Cesium.Cartesian3(27557.75122417272, 5887900.396694381, 2443894.709614702),
    new Cesium.Cartesian3(27551.263158606627, 5887877.391666118, 2443949.8348835153),
    new Cesium.Cartesian3(27485.3511164649, 5887880.414343057, 2443943.3386814957),
    new Cesium.Cartesian3(27491.83918202976, 5887903.419371324, 2443888.2134126844)
];

// note that offsetY does not affect for the polyline volume 's shape.
const offsetY = 1000000;
const shapeWidth = 10;
const height = 19;

const shape = [new Cesium.Cartesian2(0, 0 + offsetY), new Cesium.Cartesian2(shapeWidth, 0 + offsetY), new Cesium.Cartesian2(shapeWidth, height + offsetY), new Cesium.Cartesian2(0, height + offsetY)];

var redTube = viewer.entities.add({
    name: "Red tube with rounded corners",
    polylineVolume: {
        positions: new Cesium.CallbackProperty(() => {
            const ret = [];

            positions.forEach((position) => {
                const carto = Cesium.Cartographic.fromCartesian(position);

                carto.height = carto.height + height / 2;

                ret.push(Cesium.Cartographic.toCartesian(carto));
            });

            return ret;
        }, false),
        cornerType: Cesium.CornerType.MITERED,
        shape: new Cesium.CallbackProperty(() => {
            return shape;
        }, false),
        material: Cesium.Color.RED.withAlpha(0.5)
    }
});

const radius = 2;

positions.forEach((position) => {
    viewer.entities.add({
        position: position,
        ellipsoid: {
            radii: new Cesium.Cartesian3(radius, radius, radius),
            material: Cesium.Color.YELLOW
        }
    });
});

viewer.zoomTo(viewer.entities);

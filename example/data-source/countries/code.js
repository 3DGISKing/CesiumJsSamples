const { Cartesian3, Color, Viewer } = window.Cesium;

const viewer = new Viewer("cesiumContainer");

const xhr = new XMLHttpRequest();
xhr.open("GET", "./assets/geojsons/ne_110_country.geojson", true);

xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);

        data.features.forEach(function (el, i) {
            el.geometry.coordinates.forEach(function (geometry_s) {
                const boundary = {};

                geometry_s.forEach(function (coordinates, k) {
                    const positions = [];

                    coordinates.forEach(function (coordinate) {
                        positions.push(coordinate[0], coordinate[1]);
                    });

                    if (boundary.positions) {
                        boundary.holes = boundary.holes || [];
                        boundary.holes.push({
                            positions: Cartesian3.fromDegreesArray(positions)
                        });
                    } else {
                        boundary.positions = Cartesian3.fromDegreesArray(positions);
                    }
                });

                viewer.entities.add({
                    polygon: {
                        hierarchy: boundary,
                        height: 1,
                        material: Color.fromRandom({ alpha: 1 }),
                        outline: false
                    }
                });
            });
        });
    }
};

xhr.send(null);

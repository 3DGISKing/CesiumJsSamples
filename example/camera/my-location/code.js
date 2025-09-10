const viewer = new Cesium.Viewer("cesiumContainer", {});

let label;

Sandcastle.addToolbarButton("Show My location", function () {
    function showPosition(position) {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;

        if (label) {
            viewer.entities.remove(label);
        }

        label = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
            label: {
                text: "My location",
                scale: 0.8,
                pixelOffset: new Cesium.Cartesian2(0, -30),
                font: "32px Helvetica",
                fillColor: Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE
            }
        });

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 1000000)
        });
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

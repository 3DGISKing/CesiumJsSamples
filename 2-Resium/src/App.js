import React from "react";
import { Viewer, KmlDataSource, GeoJsonDataSource } from "resium";

const data = {
    type: 'Feature',
    properties: {
        name: 'Coors Field',
        amenity: 'Baseball Stadium',
        popupContent: 'This is where the Rockies play!'
    },
    geometry: {
        type: 'Point',
        coordinates: [-104.99404, 39.75621]
    }
};

const App = () => (
    <Viewer full>
        <KmlDataSource data={"./kml/facilities/facilities.kml"} />
        <GeoJsonDataSource data={data} />
    </Viewer>
);

export default App;

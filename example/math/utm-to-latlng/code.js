const { Cartesian2, Cartesian3, Color, LabelStyle, Viewer } = window.Cesium;

const zoneNumber = 11;

function utmToLatlon(easting, northing) {
    const utm = `+proj=utm +zone=${zoneNumber}`;
    const wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

    return proj4(utm, wgs84, [easting, northing]);
}

const viewer = new Viewer("cesiumContainer", {});

/**
 * @param p1 upper left
 * @param p2 upper right
 * @param p3 lower right
 * @param p4 lower left
 * @param sectionName
 */
function addSection(p1, p2, p3, p4, sectionName) {
    const latlng1 = utmToLatlon(p1[0], p1[1], zoneNumber);
    const latlng2 = utmToLatlon(p2[0], p2[1], zoneNumber);
    const latlng3 = utmToLatlon(p3[0], p3[1], zoneNumber);
    const latlng4 = utmToLatlon(p4[0], p4[1], zoneNumber);

    viewer.entities.add({
        position: Cartesian3.fromDegrees(latlng1[0], latlng1[1], p1[2]),
        label: {
            text: sectionName,
            scale: 0.8,
            pixelOffset: new Cartesian2(0, -30),
            font: "32px Helvetica",
            fillColor: Color.YELLOW,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            style: LabelStyle.FILL_AND_OUTLINE
        }
    });

    viewer.entities.add({
        polygon: {
            hierarchy: {
                positions: [
                    Cartesian3.fromDegrees(latlng1[0], latlng1[1], p1[2]),
                    Cartesian3.fromDegrees(latlng2[0], latlng2[1], p2[2]),
                    Cartesian3.fromDegrees(latlng3[0], latlng3[1], p3[2]),
                    Cartesian3.fromDegrees(latlng4[0], latlng4[1], p4[2])
                ]
            },
            perPositionHeight: true,
            material: Color.BLUE.withAlpha(0.5)
        }
    });
}

addSection(
    [493330.72, 4234613.68, 100],
    [493562.72, 4234670.48, 100],
    [493562.83, 4234613.68, 0],
    [493330.72, 4234613.68, 0],
    "sectionAA"
);

addSection(
    [493517.59, 4234443.92, 100],
    [493701.21, 4234543.18, 100],
    [493701.21, 4234543.18, 0],
    [493517.59, 4234443.92, 0],
    "sectionBB"
);

addSection(
    [493095.89, 4234475.47, 100],
    [493345.5, 4234910.77, 100],
    [493345.5, 4234910.77, 0],
    [493095.89, 4234475.47, 0],
    "sectionCC"
);

addSection(
    [493833.56, 4234172.11, 100],
    [494004.05, 4234634.66, 100],
    [494004.05, 4234634.66, 0],
    [493833.56, 4234172.11, 0],
    "sectionDD"
);

addSection(
    [493877.67, 4233939.21, 100],
    [494260.5, 4234110.6, 100],
    [494260.5, 4234110.6, 0],
    [493877.67, 4233939.21, 0],
    "sectionEE"
);

viewer.zoomTo(viewer.entities);

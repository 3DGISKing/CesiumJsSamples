var epoch;
var viewerTime = 0;
var lead = 0;
var linger = 300;
var reverse = true;
var ascale = 0.0;
var vmin = -10;
var vmax = 65;
var vrange = vmax - vmin;
var hmin = 0.83;
var hrange = 0.83;
var scale = hrange / vrange;

document.getElementById("lead").oninput = async (e) => {
    lead = e.target.valueAsNumber;
    updateTimeWindow();
};

document.getElementById("linger").oninput = async (e) => {
    linger = e.target.valueAsNumber;
    updateTimeWindow();
};

document.getElementById("vmin").oninput = async (e) => {
    vmin = e.target.valueAsNumber;
    vrange = vmax - vmin;
    scale = hrange / vrange;
    document.getElementById("min").innerHTML = e.target.valueAsNumber;
    update();
};

document.getElementById("vmax").oninput = async (e) => {
    vmax = e.target.valueAsNumber;
    vrange = vmax - vmin;
    scale = hrange / vrange;
    document.getElementById("max").innerHTML = e.target.valueAsNumber;
    update();
};

document.getElementById("hmin").oninput = async (e) => {
    hmin = e.target.valueAsNumber / 1000;
    update();
};

document.getElementById("hrange").oninput = async (e) => {
    hrange = e.target.valueAsNumber / 1000;
    scale = hrange / vrange;
    update();
};

document.getElementById("alpha").oninput = async (e) => {
    ascale = e.target.valueAsNumber / 1000;
    update();
};

document.getElementById("reverse").onchange = async (e) => {
    reverse = e.target.checked;
    update();
};

var updateTimeWindow = async () => {
    hiwrapTileset.style.show = getShowExpression();
    hiwrapTileset.makeStyleDirty();
};

var update = async () => {
    getColorMap();
    hiwrapTileset.style.color = getColorExpression();
    hiwrapTileset.makeStyleDirty();
};

var reset = () => {
    document.getElementById("vmin").value = -10;
    document.getElementById("vmax").value = 65;
    document.getElementById("hmin").value = 833;
    document.getElementById("hrange").value = 833;
    document.getElementById("alpha").value = 0;
    document.getElementById("reverse").checked = true;
    document.getElementById("min").innerHTML = vmin.toString();
    document.getElementById("max").innerHTML = vmax.toString();
    viewerTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, epoch);
};

var getColorExpression = () => {
    let revScale = "";
    if (reverse) {
        revScale = " * -1.0 + 1.0";
    }
    return `hsla((((clamp(\${value}, ${vmin}, ${vmax}) + ${vmin}) / ${vrange}) ${revScale}) * ${hrange} + ${hmin}, 1.0, 0.5, pow((\${value} - ${vmin})/${vrange}, ${ascale}))`;
};

var getShowExpression = () => {
    return `\${time} <= ${viewerTime + lead} && \${time} >= ${viewerTime - linger}`;
};

var getColorMap = async () => {
    let h1 = Math.floor(360 * hmin);
    let h2 = Math.floor(360 * (hmin + hrange));
    let steps = Math.max(Math.floor(12 * hrange), 1);
    let gradient = Array(steps + 1)
        .fill()
        .map((e, i) => {
            return `hsl(${i * 30 + h1}, 100%, 50%) ${Math.floor((i * 100) / steps)}%${i != steps ? "," : ""}`;
        });
    document.getElementById("stripe").style.backgroundImage = `linear-gradient(${reverse ? `270` : `90`}deg,${gradient.join("")})`;
};

var viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true,
    shadows: false,
    automaticallyTrackDataSourceClocks: false
});

viewer.clock.startTime = Cesium.JulianDate.fromIso8601("2015-12-03T14:00:00Z");
viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2015-12-03T14:40:00Z");
viewer.clock.stopTime = Cesium.JulianDate.fromIso8601("2015-12-03T17:50:00Z");
viewer.timeline.zoomTo(Cesium.JulianDate.fromIso8601("2015-12-03T14:00:00Z"), Cesium.JulianDate.fromIso8601("2015-12-03T17:50:00Z"));
viewer.clock.multiplier = 10;
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

var previousTime = Cesium.JulianDate.clone(viewer.clock.currentTime);

const tilesetPromise = Cesium.Cesium3DTileset.fromUrl("./assets/3dtiles/time-series/tileset.json", {
    maximumScreenSpaceError: 512,
    debugShowContentBoundingVolume: true
});

var hiwrapTileset;

tilesetPromise.then((tileset) => {
    hiwrapTileset = tileset;

    epoch = Cesium.JulianDate.fromIso8601(tileset.properties.epoch);
    tileset.style = new Cesium.Cesium3DTileStyle();
    reset();
    tileset.style.color = getColorExpression();
    tileset.style.show = getShowExpression(viewerTime);
    tileset.makeStyleDirty();
    viewer.clock.onTick.addEventListener((e) => {
        if (!Cesium.JulianDate.equalsEpsilon(previousTime, viewer.clock.currentTime, 1)) {
            previousTime = Cesium.JulianDate.clone(viewer.clock.currentTime);
            viewerTime = Cesium.JulianDate.secondsDifference(previousTime, epoch);
            tileset.style.show = getShowExpression();
            tileset.makeStyleDirty();
        }
    });

    viewer.scene.primitives.add(hiwrapTileset);
    viewer.zoomTo(hiwrapTileset);
});

var flightTrackCzml = Cesium.CzmlDataSource.load("./assets/czml/er2.czml").then((ds) => {
    modelRef = ds.entities.getById("nasa_er2");
    modelRef.orientation = new Cesium.CallbackProperty((time, result) => {
        let position = modelRef.position.getValue(time);
        let att = modelRef.properties.attitude.getValue(time);
        let hpr = Cesium.HeadingPitchRoll.fromDegrees(att.x, att.y, att.z);
        return Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
    }, false);
    viewer.dataSources.add(ds);
});

var credit = new Cesium.Credit(
    `<div>Heymsfield, Gerald M and Lin Tian. 2017.</div>
                                    <div>GPM Ground Validation High Altitude Imaging Wind and Rain Airborne Profiler (HIWRAP) OLYMPEX</div>
                                    <div>Shown data is ku band from flight on 2015-12-03.</div>
                                    <div>Dataset available online from the NASA Global Hydrology Resource Center DAAC, Huntsville, Alabama, U.S.A.</div>
                                    <div>DOI: <a href="http://dx.doi.org/10.5067/GPMGV/OLYMPEX/HIWRAP/DATA101">http://dx.doi.org/10.5067/GPMGV/OLYMPEX/HIWRAP/DATA101</a></div>`,
    true
);

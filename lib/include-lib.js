/* eslint-disable */

window.CesiumIonAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NTEwZTU2Yi0wOGEyLTQyZjgtOTJjNi04Mzc2NGRlNzA4NTkiLCJpZCI6MjU5LCJpYXQiOjE3NTY4NDExOTJ9._Y3MIsYgGKTVTpkEpKPNT0cQSa_hUocY0DdH7h0U-xM";
window.cesiumJSVersion = "1.133";
window.cesiumJSBaseUrl = `https://cesium.com/downloads/cesiumjs/releases/${cesiumJSVersion}`;

window.configLibs = {
    cesiumjs: [
        `${cesiumJSBaseUrl}/Build/Cesium/Cesium.js`,
        // `${cesiumJSBaseUrl}/Build/CesiumUnminified/Cesium.js`,
        // `https://cdn.jsdelivr.net/npm/cesium@1.132.0/Build/Cesium/Cesium.js`,
        `${cesiumJSBaseUrl}/Build/Cesium/Widgets/widgets.css`
        // `https://cdn.jsdelivr.net/npm/cesium@1.132.0/Build/Cesium/Widgets/widgets.css`
    ],
    sandcastle: ["sandcastle/bucket.css", "sandcastle/Sandcastle-header.js"],
    turf: ["https://cdn.jsdelivr.net/npm/@turf/turf@7/turf.min.js"],
    openlayers: ["https://cdn.jsdelivr.net/npm/ol@v10.6.0/dist/ol.js"],
    proj4: ["https://cdn.jsdelivr.net/npm/proj4@2.19.10/dist/proj4.min.js"],
    math: ["https://cdn.jsdelivr.net/npm/mathjs@12.4.0/lib/browser/math.min.js"],
    threejs: ["https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js"],
    jquery: ["https://code.jquery.com/jquery-3.7.1.min.js"]
};

if (localStorage.getItem("muyao-debugger") === "1") {
    for (const key in window.configLibs) {
        if (key.startsWith("mars3d")) {
            const arrUrl = window.configLibs[key];
            for (let index = 0; index < arrUrl.length; index++) {
                const url = arrUrl[index];
                const fileName = url?.substring(url.lastIndexOf("/") + 1, url.length);
                if (fileName.startsWith("mars3d")) {
                    arrUrl[index] = arrUrl[index].replace(".js", "-src.js").replace(".css", "-src.css");
                } else if (fileName.indexOf("Cesium") !== -1) {
                    // arrUrl[index] = arrUrl[index].replace("Cesium", "CesiumUnminified")
                }
            }
        }
    }
}

(function () {
    var r = new RegExp("(^|(.*?\\/))(include-lib.js)(\\?|$)"),
        s = document.getElementsByTagName("script"),
        targetScript;
    for (var i = 0; i < s.length; i++) {
        var src = s[i].getAttribute("src");
        if (src) {
            var m = src.match(r);
            if (m) {
                targetScript = s[i];
                break;
            }
        }
    }

    var cssExpr = new RegExp("\\.css");

    function inputLibs(list, baseUrl) {
        if (list == null || list.length === 0) {
            return;
        }

        for (var i = 0, len = list.length; i < len; i++) {
            var url = list[i];
            if (!url.startsWith("http") && !url.startsWith("//:")) {
                url = baseUrl + url;
            }

            if (cssExpr.test(url)) {
                var css = '<link rel="stylesheet" href="' + url + '">';
                document.writeln(css);
            } else {
                var script = '<script type="text/javascript" src="' + url + '"><' + "/script>";
                document.writeln(script);
            }
        }
    }

    //加载类库资源文件
    function load() {
        var arrInclude = (targetScript.getAttribute("include") || "").split(",");
        var libpath = targetScript.getAttribute("libpath") || "";
        if (libpath.lastIndexOf("/") !== libpath.length - 1) {
            libpath += "/";
        }

        var keys = {};
        for (var i = 0, len = arrInclude.length; i < len; i++) {
            var key = arrInclude[i];

            if (keys[key]) {
                //规避重复引入lib
                continue;
            }
            keys[key] = true;

            inputLibs(configLibs[key], libpath);
        }
    }

    load();
})();


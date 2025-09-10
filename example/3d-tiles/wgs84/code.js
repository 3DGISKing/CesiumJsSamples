const { Cartesian3, Matrix4, Cesium3DTileset, Viewer } = window.Cesium;

const viewer = new Viewer("cesiumContainer");
const scene = viewer.scene;

// all vertex of this tileset are directly defined in WGS84

const url = "https://s3.us-east-2.wasabisys.com/construkted-assets/a44y1ry6536/tileset.json";

const tilesetPromise = Cesium3DTileset.fromUrl(url, {
    debugShowBoundingVolume: true
});

tilesetPromise
    .then(function (tileset) {
        scene.primitives.add(tileset);

        if (tileset.modelMatrix.equals(Matrix4.IDENTITY) && tileset.root.transform.equals(Matrix4.IDENTITY) && Cartesian3.magnitude(tileset.boundingSphere.center) >= 6300000) {
            // this will output the identity matrix
            console.log("tileset 's model matrix", tileset.modelMatrix);

            // this also will output the identity matrix
            console.log("root tile 's transform", tileset.root.transform);

            console.log("bounding sphere center", tileset.boundingSphere.center);

            console.log("it seems that all vertex are defined in WGS84");
        }

        viewer.zoomTo(tileset);
    })
    .catch(function (err) {
        console.error(err.message);
    });

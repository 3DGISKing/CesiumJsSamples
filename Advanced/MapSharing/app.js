Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTIzNzQ4NS1iN2ZmLTQ3ZWQtYjU0OS1mZWI4Nzk0MjcwNDAiLCJpZCI6OTc4Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDkxODE3NH0.UUQf2vuc3PN3VPNSUYt5uAbrSv5irvkIe-A57Ocp6ow";

var SERVER = null;

var isLocalHost = location.hostname === "localhost" || location.hostname === "127.0.0.1";

isLocalHost = false;

if (isLocalHost)
    SERVER = 'http://localhost';
else
    SERVER = 'https://cesiumgis.com';

var IMAGE_UPLOAD_API_URL = null;
var JSON_UPLOAD_API_URL = null;
var PDF_UPLOAD_API_URL = null;

if (isLocalHost) {
    IMAGE_UPLOAD_API_URL = SERVER + '/MapSharing/source/upload_image.php';
    JSON_UPLOAD_API_URL = SERVER + '/MapSharing/source/upload_json.php';
    PDF_UPLOAD_API_URL = SERVER + '/MapSharing/source/upload_pdf.php';
}
else {
    IMAGE_UPLOAD_API_URL = SERVER + '/projects/cesium/MapSharing/upload_image.php';
    JSON_UPLOAD_API_URL = SERVER + '/projects/cesium/MapSharing/upload_json.php';
    PDF_UPLOAD_API_URL = SERVER + '/projects/cesium/MapSharing/upload_pdf.php';
}

var SERVER_IMAGE_DIR_URL = null;
var SERVER_HTML_TEMPLATE_URL = null;
var SERVER_PDF_DIR_URL = null;

if(isLocalHost) {
    SERVER_IMAGE_DIR_URL = SERVER + '/MapSharing/source/uploads/';
    SERVER_HTML_TEMPLATE_URL = SERVER + '/MapSharing/source/';
    SERVER_PDF_DIR_URL = SERVER + '/MapSharing/source/uploads/pdf/';
}
else {
    SERVER_IMAGE_DIR_URL = SERVER + '/projects/cesium/MapSharing/uploads/';
    SERVER_HTML_TEMPLATE_URL = SERVER + '/projects/cesium/MapSharing/';
    SERVER_PDF_DIR_URL = SERVER + '/projects/cesium/MapSharing/uploads/pdf/';
}

var pdfViewerURL = null;

if(isLocalHost) {
    pdfViewerURL = SERVER + '/Abimap/pdfViewer.html';
}
else
    pdfViewerURL = SERVER + '/pdfViewer.html';

var explanationPushpinUrl = 'https://raw.githubusercontent.com/3DGISKing/image/master/info.png';
var photoPushpinUrl = 'https://raw.githubusercontent.com/3DGISKing/image/master/cam.png';
var drillPushpinUrl = 'https://raw.githubusercontent.com/3DGISKing/image/master/icons8-select-24.png';
var pdfPushpinUrl = 'https://raw.githubusercontent.com/3DGISKing/image/master/documents-symbol.png';
var explanationPushpinScale = 0.5;
var photoPushpinScale = 1;
var pdfPushpinScale = 0.1;

var App = (function () {
    function App() {
        this._init();
    }

    App.prototype._init = function () {
        this._viewer = new Cesium.Viewer('cesiumContainer', {
            terrainProvider: isLocalHost ? undefined : Cesium.createWorldTerrain(),
            timeline: false,
            animation: false
        });

        this._viewer.extend(Cesium.viewerCesiumNavigationMixin, {});

        var url = window.location.href;

        var tokens = url.split('/');

        var lastToken = tokens.pop();

        if(lastToken !== '' && !lastToken.includes('html')) {
            var jsonDataFileName = lastToken + '.json';

            $('#editor-panel').hide();
            this._initForOnlyDisplayMap(jsonDataFileName);
        }

        this._polygonCocordinateTextArea = $('#polygon-coordinates');

        this._explanationPushpinCoordinateInput = $('#explanation-pushpin-coordinate');
        this._explanationPushpinNameInput = $('#explanation-pushpin-name');
        this._explanationPushpinTextInput = $('#explanation-pushpin-text');

        this._explanationPushpinAddButton = $('#explanation-pushpin-add');
        this._explanationPushpinUpdateButton = $('#explanation-pushpin-update');

        this._imagePushpinCoordinateInput = $('#image-pushpin-coordinate');
        this._imagePushpinNameInput = $('#image-pushpin-name');
        this._imageFileInput = $('#fileToUpload');

        this._imagePushpinAddButton = $('#image-pushpin-add');
        this._imagePushpinUpdateButton = $('#image-pushpin-update');

        this._deleteButton = $('#delete');
        this._makePolygoonButton = $('#make-polygon');
        this._createLinkButton = $('#create-link');
        this._imageDiv = $('.hover_bkgr_fricc');

        this._holesFileInput = $('#fileHoles');
        this._holesDataFileInput = $('#fileHolesData');
        this._holesDrawButton = $('#holes-draw');
        this._jQCustomLinkName = $('#custom-link-name');

        this._jQPdfPushpinCoordinateInput = $('#pdf-pushpin-coordinate');
        this._jQPdfFileInput = $('#pdfFileToUpload');

        var self = this;

        this._explanationPushpinAddButton.click(function () {
            self._onAddExplanationPushpin();
        });

        this._explanationPushpinUpdateButton.click(function () {
            self._onUpdateExplanationPushpin();
        });

        this._imagePushpinAddButton.click(function () {
            self._onAddImagePushpin();
        });

        this._imagePushpinUpdateButton.click(function () {
            self._onUpdateImagePushpin();
        });

        this._deleteButton.click(function () {
            self._onDelete();
        });

        this._createLinkButton.click(function () {
            self._onCreateLink();
        });

        this._makePolygoonButton.click(function () {
            self._onMakePolygon();
        });

        $('.popupCloseButton').click(function () {
            self._hideImage();
        });

        $('#pdf-pushpin-add').click(function () {
            self._onAddPdfPushpin();
        });

        $('#pdf-pushpin-update').click(function () {
            self._onUpdatePdfPushpin();
        });

        $('#clipping').click(function() {
            self._onClippingButtonClicked();
        });

        $('#cancel-clipping').click(function() {
            self._onCancelClippingButtonClicked();
        });

        $('#embed-code').hide();

        $('#create-embed-code').click(function() {
           self._getEmbedCode();
        });

        this._viewer.selectedEntityChanged.addEventListener(function (newEntity) {
            if (newEntity && newEntity.imageLink && newEntity.imageLink !== '') {
                self._viewer.infoBox.container.hidden = true;
                self._showImage(newEntity.imageLink);
            }
            else if (newEntity.pdfFileLink) {
                self._viewer.infoBox.container.hidden = true;
                self._showPdf(newEntity.pdfFileLink);
            }
            else {
                self._viewer.infoBox.container.hidden = false;
            }
        });

        this._polygonColorOption = 'white';

        var jQPolygonColorSelect = $('#polygon-color-select');

        jQPolygonColorSelect.on('change', function () {
            self._polygonColorOption = this.value;
        });

        this._holesDrawButton.click(function () {
            self._onDrawHolesButtonClicked();
        });

        this._holes = [];
        this._holesData = [];

        //this._enableUnderground();

        this._initMouseHandler();

        this._viewer.camera.flyTo({
            destination : Cesium.Cartographic.toCartesian(new Cesium.Cartographic.fromDegrees(116.4074, 39.9042, 5000000))
        });
    };

    App.prototype._initMouseHandler = function (data) {
        var viewer = this._viewer;
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

        var jQBottomBar = $('#bottomBar');

        handler.setInputAction(function(movement) {
            var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);

            var fractionDigits = 9;

            if (cartesian) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(fractionDigits);
                var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(fractionDigits);

                var text =
                    'Lon: ' + ('   ' + longitudeString) + '\u00B0' +
                    '\nLat: ' + ('   ' + latitudeString) + '\u00B0';

                jQBottomBar.html(text);
                jQBottomBar.show();
            } else {
                jQBottomBar.hide();
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };

    App.prototype._parseJson = function (data) {
        var polygons = data.polygons;

        for (var i = 0; i < polygons.length; i++) {
            var polygon = polygons[i];
            var positions = polygon.positions;

            var cartesians = [];

            for (var j = 0; j < positions.length; j++) {

                var cartesian = new Cesium.Cartesian3(positions[j].x, positions[j].y, positions[j].z);

                cartesians.push(cartesian);
            }

            var color = Cesium.Color.fromCssColorString(polygon.color);

            this._viewer.entities.add({
                polyline: {
                    positions: cartesians,
                    material: color,
                    clampToGround: true,
                    width: 3
                }
            });
        }

        for (i = 0; i < data.pushpins.length; i++) {
            var pushpin = data.pushpins[i];
            var position = pushpin.position;
            var cartesian3 = new Cesium.Cartesian3(position.x, position.y, position.z);

            var pushPinImageUrl = explanationPushpinUrl;
            var scale = explanationPushpinScale;

            if(pushpin.imageLink !== "") {
                pushPinImageUrl = photoPushpinUrl;
                scale = photoPushpinScale;
            }
            else if (pushpin.pdfFileLink !== "") {
                pushPinImageUrl = pdfPushpinUrl;
                scale = pdfPushpinScale;
            }

            this._viewer.entities.add({
                position: cartesian3,
                name: pushpin.name,
                description: pushpin.description,
                imageLink: pushpin.imageLink ? pushpin.imageLink : '',
                pdfFileLink: pushpin.pdfFileLink ? pushpin.pdfFileLink : '',
                billboard: {
                    image: pushPinImageUrl,
                    scale: scale,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    // if distance from the camera is less than 6000000, disable depth testing
                    disableDepthTestDistance: 6000000,
                    // if distance from the camera is less than 6000000.0, show it
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6000000.0)
                },
                label: {
                    text: pushpin.name,
                    scale: 0.8,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    pixelOffset: new Cesium.Cartesian2(0, -30)
                }
            });
        }

        this._holes = data.holes;
        this._holesData = data.holesData;
        this._createDrillHolesEntities();

        if(data.clippingData) {
            this._clipping(data.clippingData.longitude,
                           data.clippingData.latitude,
                           data.clippingData.width,
                           data.clippingData.height);
        }

        this._viewer.zoomTo(this._viewer.entities);
    };

    App.prototype._initForOnlyDisplayMap = function (jsonDataFileName) {
        var self = this;

        $.getJSON('uploads/' + jsonDataFileName, function (jsonData) {
            self._parseJson(jsonData);
        }).done(function () {
            console.log("second success");
        })
            .fail(function () {
                console.log("error");
            })
            .always(function () {
                console.log("complete");
            })
    };

    App.prototype._getCoordinateFromString = function (coordinateString) {
        if (coordinateString.trim() === '')
            return null;

        var tokens = coordinateString.split(',');

        if (tokens.length !== 2)
            return null;

        if (isNaN(tokens[0]))
            return null;

        if (isNaN(tokens[1]))
            return null;

        var ret = [];

        ret.push(parseFloat(tokens[0]));
        ret.push(parseFloat(tokens[1]));

        return ret;
    };

    App.prototype._onAddExplanationPushpin = function () {
        var coordinateString = this._explanationPushpinCoordinateInput.val();

        var coordinates = this._getCoordinateFromString(coordinateString);

        if (coordinates === null) {
            alert('invalid coordinate!');
            return;
        }

        var name = this._explanationPushpinNameInput.val();
        var text = this._explanationPushpinTextInput.val();

        var explanationPushpin = this._viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]),
            name: name,
            description: text,
            billboard: {
                image: explanationPushpinUrl,
                scale: explanationPushpinScale,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                // if distance from the camera is less than 6000000, disable depth testing
                disableDepthTestDistance: 6000000,
                // if distance from the camera is less than 6000000.0, show it
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6000000.0)
            },
            label: {
                text: name,
                scale: 0.8,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                pixelOffset: new Cesium.Cartesian2(0, -30)
            }
        });

        this._viewer.flyTo(explanationPushpin);
    };

    App.prototype._onUpdateExplanationPushpin = function () {
        var selectedEntity = this._viewer.selectedEntity;

        if (!selectedEntity) {
            alert('no selected!');
            return;
        }

        if (selectedEntity.imageLink != null) {
            alert('this is not explanation pushpin!');
            return;
        }

        var coordinateString = this._explanationPushpinCoordinateInput.val();

        var coordinates = this._getCoordinateFromString(coordinateString);

        if (coordinates === null) {
            alert('invalid coordinate!');
            return;
        }

        var name = this._explanationPushpinNameInput.val();
        var text = this._explanationPushpinTextInput.val();

        selectedEntity.name = name;
        selectedEntity.description.setValue(text);
        selectedEntity.position.setValue(Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]));

        this._viewer.flyTo(selectedEntity);
    };

    App.prototype._onAddImagePushpin = function () {
        var coordinateString = this._imagePushpinCoordinateInput.val();

        var coordinates = this._getCoordinateFromString(coordinateString);

        if (coordinates === null) {
            alert('invalid coordinate!');
            return;
        }

        if (this._imageFileInput.val() === "") {
            alert("please select image!");
            return;
        }

        var self = this;

        var fileData = this._imageFileInput.prop('files')[0];
        var formData = new FormData();

        formData.append('fileToUpload', fileData);

        $.ajax({
            url: IMAGE_UPLOAD_API_URL,
            type: 'post',
            data: formData,
            dataType: 'text', // what to expect back from the server
            cache: false,
            contentType: false,
            processData: false,
            enctype: 'multipart/form-data',
            success: function (response) {
                var data = JSON.parse(response);

                if (data.error && data.error !== '') {
                    alert("Can not add because image uploading failed! Server sent error: " + '"' + data.error + '"');
                    return;
                }

                var imageLink = SERVER_IMAGE_DIR_URL + data.image;

                var name = self._imagePushpinNameInput.val();

                var imagePushpin = self._viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]),
                    name: name,
                    description: '<div style="height: 200px">\
                    <img height="200" src = " ' + imageLink + '"/>' +
                        '</div>',
                    billboard: {
                        image: photoPushpinUrl,
                        scale: photoPushpinScale,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        // if distance from the camera is less than 6000000, disable depth testing
                        disableDepthTestDistance: 6000000,
                        // if distance from the camera is less than 6000000.0, show it
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6000000.0)
                    },
                    label: {
                        text: name,
                        scale: 0.8,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        pixelOffset: new Cesium.Cartesian2(0, -30)
                    }
                });

                imagePushpin.imageFile = data.image; // for delete
                imagePushpin.imageLink = imageLink;

                self._viewer.flyTo(imagePushpin);
            },
            error: function (xhr, status, error) {
                if (xhr.responseText) {
                    var err = JSON.parse(xhr.responseText);
                    alert(err.message);
                } else {
                    alert('no response');
                }
            }
        });
    };

    App.prototype._onUpdateImagePushpin = function () {
        var selectedEntity = this._viewer.selectedEntity;

        if (!selectedEntity) {
            alert('no selected!');
            return;
        }

        if (selectedEntity.imageLink == null) {
            alert('this is not image pushpin!');
            return;
        }

        var coordinateString = this._imagePushpinCoordinateInput.val();

        var coordinates = this._getCoordinateFromString(coordinateString);

        if (coordinates === null) {
            alert('invalid coordinate!');
            return;
        }

        if (this._imageFileInput.val() === "") {
            alert("please select image!");
            return;
        }

        var self = this;

        var fileData = this._imageFileInput.prop('files')[0];
        var formData = new FormData();

        formData.append('fileToUpload', fileData);

        $.ajax({
            url: IMAGE_UPLOAD_API_URL,
            type: 'post',
            data: formData,
            dataType: 'text', // what to expect back from the server
            cache: false,
            contentType: false,
            processData: false,
            enctype: 'multipart/form-data',
            success: function (response) {
                var data = JSON.parse(response);

                if (data.error && data.error !== '') {
                    alert("Can not add because image uploading failed! Server sent error: " + '"' + data.error + '"');
                    return;
                }

                var imageLink = SERVER_IMAGE_DIR_URL + data.image;

                var name = self._imagePushpinNameInput.val();

                var newDescription = '<div style="height: 200px">\
                    <img height="200" src = " ' + imageLink + '"/>' +
                    '</div>';

                selectedEntity.name = name;
                selectedEntity.description.setValue(newDescription);
                selectedEntity.position.setValue(Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]));
                selectedEntity.imageFile = data.image; // for delete
                selectedEntity.imageLink = imageLink;

                self._viewer.flyTo(selectedEntity);
            },
            error: function (response) {
                alert(response);
            }
        });
    };

    App.prototype._onDelete = function () {
        if (!this._viewer.selectedEntity) {
            alert('no selected!');
            return;
        }

        this._viewer.entities.remove(this._viewer.selectedEntity);
    };

    App.prototype._onCreateLink = function () {
        this._createLink();
    };

    App.prototype._createLink = function () {
        if(!this._canCreatLink())
            return;

        this._doCreateLink();
    };

    App.prototype._canCreatLink = function() {
        var customLinkName = this._jQCustomLinkName.val();

        if(customLinkName === '')
        {
            alert("please input custom link name");
            return false;
        }

        var entities = this._viewer.entities.values;

        var polygonCount = 0;

        for (var i = 0; i < entities.length; i++) {
            if(entities[i].polyline)
                polygonCount++;
        }

        if (polygonCount === 0) {
            alert('please make polygon!');
            return false;
        }

        return true;
    };

    App.prototype._getJsonData = function() {
        var data = {
            pushpins: [],
            polygons: [],
            holes: this._holes,
            holesData: this._holesData,
            clippingData: this._clippingData
        };

        var entities = this._viewer.entities.values;

        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];

            if (entity.billboard != null) {
                if(entity.description == null)
                    continue;

                var pushpinData = {
                    name: entity.name,
                    description: entity.description.getValue(),
                    position: entity.position.getValue(),
                    imageLink: entity.imageLink ? entity.imageLink : '',
                    pdfFileLink: entity.pdfFileLink ? entity.pdfFileLink : ''
                };

                data.pushpins.push(pushpinData);
            } else if (entity.polyline != null) {
                var polygon = {};

                polygon.positions = entity.polyline.positions.getValue();
                polygon.color = entity.polyline.material.getValue().color.toCssColorString();

                data.polygons.push(polygon);
            }
        }

        return JSON.stringify(data);
    };

    App.prototype._doCreateLink = function() {
        var customLinkName = this._jQCustomLinkName.val();
        var json = this._getJsonData();

        var newWindow = window.open("", "_blank");

        $.ajax({
            url: JSON_UPLOAD_API_URL,
            type: 'POST',
            data: {
                linkName: customLinkName,
                json: json
            },
            success: function (response) {
                var data = response;

                if(data.error !== '') {
                    alert(data.error);
                    return;
                }

                var json_file = data.json_file;

                var url = SERVER_HTML_TEMPLATE_URL + customLinkName;

                newWindow.location = url;
            },
            error: function (response) {
                newWindow.close();

                if (response.status === 404) {
                    alert('can not find API!');
                } else if (response.status === 0) {
                    alert('no response from backend!');
                } else {
                    alert('failed to connect backend!');
                }
            }
        });
    };

    App.prototype._getPolygonCoordinates = function (coordinatesString) {
        var tokens = coordinatesString.split(',');

        if (tokens.length < 2)
            return null;

        if (tokens.length % 2 !== 0)
            return null;

        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];

            var value = parseFloat(token);

            if (isNaN(value))
                return null;

            if (value > 180 || value < -180)
                return null;
        }

        var positions = [];

        for (i = 0; i < tokens.length; i++) {
            positions.push(parseFloat(tokens[i]));
        }

        return positions;
    };

    App.prototype._getPolygonMaterial = function (colorOption) {
        if(colorOption === 'black')
            return  Cesium.Color.BLACK;

        if(colorOption === 'red')
            return  Cesium.Color.RED;

        if(colorOption === 'white')
            return  Cesium.Color.WHITE;

        if(colorOption === 'blue')
            return  Cesium.Color.BLUE;

        if(colorOption === 'yellow')
            return  Cesium.Color.YELLOW;
    };

    App.prototype._onMakePolygon = function () {
        var coordinates = this._polygonCocordinateTextArea.val();

        coordinates = coordinates.trim();

        if (coordinates === "") {
            alert("please input polygon coordinates");
            return false;
        }

        var positions = this._getPolygonCoordinates(coordinates);

        if (positions === null) {
            alert("invalid coordinate string!");
            return false;
        }

        var polygonEntity = this._viewer.entities.add({
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(positions),
                material: this._getPolygonMaterial(this._polygonColorOption),
                clampToGround: true,
                width: 3
            }
        });

        this._viewer.flyTo(polygonEntity);
    };

    App.prototype._showImage = function (imageUrl) {
        $('#image').attr('src', imageUrl);

        var width = $(document).width() / 2;

        $('#image').attr('width', width);

        this._imageDiv.show();
    };

    App.prototype._showPdf = function(pdfUrl) {
        var url = pdfViewerURL;

        url = url + '?pdf=' + pdfUrl;

        window.open(url, "_blank");
    };

    App.prototype._hideImage = function () {
        this._imageDiv.hide();
    };

    App.prototype._onDrawHolesButtonClicked = function () {
        if (this._holesFileInput.val() === "") {
            alert('please select holes json file!');
            return;
        }

        if (this._holesDataFileInput.val() === "") {
            alert('please select holes data json file!');
            return;
        }

        var holesFile = this._holesFileInput.prop('files')[0];

        var fr = new FileReader();

        fr.readAsText(holesFile);

        var self = this;

        var holesReady = false;
        var holesDataReady = false;

        fr.onload = function(e) {
            self._holes = JSON.parse(e.target.result);

            holesReady = true;
            console.log(self._holes);

            if(holesDataReady) {
                self._createDrillHolesEntities();
            }
        };

        var holesDataFile = this._holesDataFileInput.prop('files')[0];

        var fr1 = new FileReader();

        fr1.readAsText(holesDataFile);

        fr1.onload = function(e) {
            self._holesData = JSON.parse(e.target.result);

            console.log(self._holesData);

            holesDataReady = true;

            if(holesReady) {
                self._createDrillHolesEntities();
            }
        };
    };

    App.prototype._createDrillHolesEntities = function () {
        var drillHoleRadius = 0.5;

        var holes = this._holes;

        for(var i = 0; i < holes.length; i++) {
            var hole = holes[i];

            var ID = hole['HoleID'];

            var latitude = hole['Lat'];
            var longitude = hole['Long'];
            var height = hole['Elevation'];

            this._viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                name: ID + ` (Long: ${longitude.toFixed(2)}, Lat: ${latitude.toFixed(2)}, Height: ${height.toFixed(2)} )`,
                billboard: {
                    image: drillPushpinUrl,
                    scale: 1
                }
            });
        }

        var holesMinFrom = {};

        var holesData = this._holesData;

        this._holes = holes;

        var viewer = this._viewer;

        var maxToDistance = 0;

        for (var i = 0 ; i < holesData.length; i++) {
            var holeData = holesData[i];

            var holeID = holeData['Hole ID'];

            if(holeData == null)
                continue;

            var hole = this._getHole(holeID);

            if(hole == null)
                continue;

            var latitude = hole['Lat'];
            var longitude = hole['Long'];
            var height = hole['Elevation'];

            var dip = hole['DH_Dip'];
            var azimuth = hole['DH_Azimuth'];

            if(azimuth === undefined) {
                alert('Hole : ' + holeID + ' does not contains DH_Azimuth! We can not continue to parse data!');
                return;
            }

            var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

            var heading = Cesium.Math.toRadians(azimuth);
            var pitch = Cesium.Math.toRadians(dip + 90);

            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, 0);

            var matrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);

            var toDistance = parseFloat(holeData['To']);
            var fromDistance = parseFloat(holeData['From']);

            if(maxToDistance < toDistance)
                maxToDistance = toDistance;

            if(holesMinFrom[holeID] == null)
                holesMinFrom[holeID] = fromDistance;

            if(holesMinFrom[holeID] > fromDistance)
                holesMinFrom[holeID] = fromDistance;

            var length = toDistance- fromDistance;

            var middleDistance = fromDistance + length / 2;

            var localNewPosition = new Cesium.Cartesian3(0, 0, -middleDistance);

            var newPosition = Cesium.Matrix4.multiplyByPoint(matrix, localNewPosition, new Cesium.Cartesian3());
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(newPosition, hpr);

            var entity = viewer.entities.add({
                name : holeID + ' ' + fromDistance + ' - ' + toDistance + ' (Dip : ' + dip + ' Azimuth : ' + azimuth + ')',
                position: newPosition,
                orientation: orientation,
                cylinder : {
                    length : length,
                    topRadius : drillHoleRadius,
                    bottomRadius : drillHoleRadius,
                    material :  Cesium.Color.fromRandom().withAlpha(1.0)
                }
            });

            entity.description = 'data1 : ' + holeData['data1'] + ' data2 : ' + holeData['data2'] + ' data3 : ' + holeData['data3'];
        }

        console.info('maxToDistance : ' + maxToDistance);

        this._maxToDistance = maxToDistance;

        for (var holeID in holesMinFrom) {
            if (!holesMinFrom.hasOwnProperty(holeID))
                continue;

            var hole = this._getHole(holeID);

            if(hole == null)
                continue;

            var latitude = hole['Lat'];
            var longitude = hole['Long'];
            var height = hole['Elevation'];

            var dip = hole['DH_Dip'];
            var azimuth = hole['DH_Azimuth'];

            var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

            var heading = Cesium.Math.toRadians(azimuth);
            var pitch = Cesium.Math.toRadians(dip + 90);

            var hpr = new Cesium.HeadingPitchRoll(heading, pitch, 0);

            var matrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);

            var minFrom = holesMinFrom[holeID];

            var localNewPosition = new Cesium.Cartesian3(0, 0, - minFrom / 2);

            var newPosition = Cesium.Matrix4.multiplyByPoint(matrix, localNewPosition, new Cesium.Cartesian3());
            var orientation = Cesium.Transforms.headingPitchRollQuaternion(newPosition, hpr);

            viewer.entities.add({
                name : holeID,
                position: newPosition,
                orientation: orientation,
                cylinder : {
                    length : minFrom,
                    topRadius : drillHoleRadius * 5,
                    bottomRadius : drillHoleRadius * 5,
                    material :  Cesium.Color.BLACK.withAlpha(0.2),
                    //outline : true,
                    //outlineColor : Color.BLACK.withAlpha(0.3),
                }
            });
        }

        viewer.zoomTo(viewer.entities);
    };

    App.prototype._enableUnderground = function() {
        const viewer = this._viewer;

        // this is default
        //viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;

        const screenSpaceCameraController = viewer.scene.screenSpaceCameraController;
        const minimumCollisionTerrainHeight = screenSpaceCameraController.minimumCollisionTerrainHeight;
        const globe = viewer.scene.globe;

        viewer.scene._postRender.addEventListener(function(scene, time) {
            const cameraPositionCartographic = viewer.camera.positionCartographic;

            let isUnderground = false;

            if(cameraPositionCartographic.height < minimumCollisionTerrainHeight) {
                const terrainHeight = globe.getHeight(cameraPositionCartographic);

                if(Cesium.defined(terrainHeight)) {
                    if(cameraPositionCartographic.height < terrainHeight) {
                        isUnderground = true;
                    }
                }
            }

            if(cameraPositionCartographic.height < 2500) {
                viewer.scene.screenSpaceCameraController._zoomFactor = 0.1;
                viewer.terrainProvider.skirtRatio = 0;
            }else {
                viewer.scene.screenSpaceCameraController._zoomFactor = 5;
                viewer.terrainProvider.skirtRatio = 5;
            }

            console.info('isUnderground: ' + isUnderground + ' current camera height: ' + viewer.camera.positionCartographic.height);

            if(isUnderground) {
                viewer.scene.globe._surface.tileProvider._debug.wireframe = true;
                viewer.scene.backgroundColor = Cesium.Color.WHITE.clone();

                viewer.scene.skyBox.show = false;
            }
            else {
                viewer.scene.globe._surface.tileProvider._debug.wireframe = false;
                viewer.scene.backgroundColor = Cesium.Color.clone(Cesium.Color.BLACK);
                //viewer.terrainProvider.skirtRatio = 5;
                viewer.scene.skyBox.show = true;
            }
        });

        this._viewer.scene.screenSpaceCameraController.minimumZoomDistance = -195.65;
    };

    App.prototype._getHole = function (holeId) {
        for (let i = 0; i < this._holes.length; i++) {
            if(this._holes[i]['HoleID'] === holeId)
                return this._holes[i];
        }

        return null;
    };

    App.prototype._onAddPdfPushpin = function () {
        var coordinateString = this._jQPdfPushpinCoordinateInput.val();

        var coordinates = this._getCoordinateFromString(coordinateString);

        if (coordinates === null) {
            alert('invalid coordinate!');
            return;
        }

        if (this._jQPdfFileInput.val() === "") {
            alert("please select pdf!");
            return;
        }

        var fileData = this._jQPdfFileInput.prop('files')[0];
        var formData = new FormData();

        formData.append('uploadedPdfFile', fileData);

        var self = this;

        $.ajax({
            url: PDF_UPLOAD_API_URL,
            type: 'post',
            data: formData,
            dataType: 'text', // what to expect back from the server
            cache: false,
            contentType: false,
            processData: false,
            enctype: 'multipart/form-data',
            success: function (response) {
                var data = JSON.parse(response);

                if (data.error && data.error !== '') {
                    alert("Can not add because pdf file uploading failed! Server sent error: " + '"' + data.error + '"');
                    return;
                }

                var name = $('pdf-pushpin-name').val();

                var pdfPushpin = self._viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]),
                    name: name,
                    description: 'pdfPushPin',
                    billboard: {
                        image: pdfPushpinUrl,
                        scale: pdfPushpinScale,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        // if distance from the camera is less than 6000000, disable depth testing
                        disableDepthTestDistance: 6000000,
                        // if distance from the camera is less than 6000000.0, show it
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6000000.0)
                    }
                });

                pdfPushpin.pdfFileLink = SERVER_PDF_DIR_URL + data.pdf;

                self._viewer.flyTo(pdfPushpin);
            },
            error: function (xhr, status, error) {
                if(xhr.status === 404) {
                    alert("Not found!");
                    return;
                }

                if (xhr.responseText) {
                    var err = JSON.parse(xhr.responseText);
                    alert(err.message);
                } else {
                    alert('no response');
                }
            }
        });


    };

    App.prototype._onUpdatePdfPushpin = function () {

    };

    App.prototype._clipping = function (longitude, latitude, width, height) {
        var globe = this._viewer.scene.globe;

        if(globe.clippingPlanes) {
            globe.clippingPlanes.destroy();
        }

        var clippingCenterPosition = Cesium.Cartographic.toCartesian(new Cesium.Cartographic.fromDegrees(longitude, latitude, 100));

        globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            modelMatrix : Cesium.Transforms.eastNorthUpToFixedFrame(clippingCenterPosition),
            planes : [
                new Cesium.ClippingPlane(new Cesium.Cartesian3( 1.0,  0.0, 0.0), width),
                new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0,  0.0, 0.0), width),
                new Cesium.ClippingPlane(new Cesium.Cartesian3( 0.0,  1.0, 0.0), height),
                new Cesium.ClippingPlane(new Cesium.Cartesian3( 0.0, -1.0, 0.0), height)
            ],
            unionClippingRegions : true
        });

        this._viewer.camera.flyTo({
            destination : clippingCenterPosition
        });
    };

    App.prototype._onClippingButtonClicked = function () {
        var coordinateString = $('#clipping-center-coordinate').val();

        var coordinates = this._getCoordinateFromString(coordinateString);

        if (coordinates === null) {
            alert('invalid coordinate!');
            return;
        }

        var clippingWidth = $('#clipping-width').val();
        var clippingHeight = $('#clipping-height').val();

        this._clipping(coordinates[0], coordinates[1], clippingWidth, clippingHeight);

        this._clippingData = {
            longitude: coordinates[0],
            latitude: coordinates[1],
            width: clippingWidth,
            height: clippingHeight
        };
    };

    App.prototype._onCancelClippingButtonClicked = function () {
        var globe = this._viewer.scene.globe;

        if(globe.clippingPlanes) {
            globe.clippingPlanes.enabled = false;
        }
    };

    App.prototype._getEmbedCode = function() {
        if(!this._canCreatLink())
            return;

        var customLinkName = this._jQCustomLinkName.val();
        var json = this._getJsonData();

        $.ajax({
            url: JSON_UPLOAD_API_URL,
            type: 'POST',
            data: {
                linkName: customLinkName,
                json: json
            },
            success: function (response) {
                var data = response;

                if(data.error !== '') {
                    alert(data.error);
                    return;
                }

                var json_file = data.json_file;

                var url = SERVER_HTML_TEMPLATE_URL + customLinkName;

                var embedCode = '<iframe src="' + url + '" width="680" height="480"></iframe>';

                $('#embed-code').show();

                $('#embed-code').val(embedCode);
            },
            error: function (response) {
                if (response.status === 404) {
                    alert('can not find API!');
                } else if (response.status === 0) {
                    alert('no response from backend!');
                } else {
                    alert('failed to connect backend!');
                }
            }
        });
    };

    return App;
})();

$('.jqte-test').jqte();

new App();
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMThhZGRmNy1lYzZiLTRhN2EtOGQ5Ni1hZGUxZGNlMjlhZGEiLCJpZCI6OTc4NiwiaWF0IjoxNjExOTcyMDcxfQ.t_QrZbJwYfKzST33feAN2lvaWn8cZaulqZy3Twl_4ho";

let url = 'https://api.cesium.com/v1/assets';

url += "?access_token=" + accessToken;

Cesium.Resource.fetchJson(url)
    .then(function (result) {
        // result is all available asset IDs and their names

        console.log(result);
    })
    .otherwise(function (error) {
        console.log(error);
    });

$.ajax({
    url: url,
    success: function (response) {
        console.log(response)
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
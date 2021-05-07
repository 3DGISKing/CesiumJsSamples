const sqlite3 = require('sqlite3').verbose();

let db = null;

let path = "E:\\0Task\\CesiumCoordConvert\\srs.db";

db = new sqlite3.Database(path, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
        return;
    }

    console.log('Connected to the  database.');

    generateEPSGListJson();
});

function generateEPSGListJson () {
    let sql = "SELECT * FROM tbl_srs";

    db.all(sql, function(error, rows){
        for (let i = 0 ; i < rows.length; i++) {
            let row = rows[i];
        }

        let output = JSON.stringify(rows);

        const fs = require('fs');

        fs.writeFile("EPSGs", output, function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    });
}

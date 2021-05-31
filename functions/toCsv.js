const Papa = require("papaparse"),
    fs = require("fs");

exports.jsonToCsv = (json_data)=>{
    try {
        let csv_data = Papa.unparse(json_data);
        fs.writeFile("./export.csv", csv_data, {flag: 'w'}, function () {
            //console.log(csv_data);
        });
    } catch (e) {
        console.error(e);
    }
}

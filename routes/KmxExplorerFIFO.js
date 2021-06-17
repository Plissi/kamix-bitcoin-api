const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({storage: multer.memoryStorage()});
const CSV = require('csv-parser');
let fs = require('fs');
let Temp = require('tmp');
const excel = require('excel4node');
const workbook = new excel.Workbook();
const excelStyle = workbook.createStyle({font: {color: '#000000', size: 12}});

const formatCSVLine = function (line) {
    line["date"] = parseInt(line["date"], 10);
    line["debit"] = parseFloat(line["debit"]);
    line["credit"] = parseFloat(line["credit"]);
    line["cotation"] = parseFloat(line["cotation"]);
    line["debit_euro"] = parseFloat(line["debit_euro"]);
    line["credit_euro"] = parseFloat(line["credit_euro"]);
    line["fee"] = parseFloat(line["fee"]);
    line["received"] = parseFloat(line["received"]);
    line["dr"] = 0;
    line["vdr"] = 0;
    line["w"] = 0;
    line["vw"] = 0;
    line["vm"] = 0;
    line["p"] = 0;
    line["D"] = 0;
    line["E"] = "";
    return line;
}

const parseCSV = function (csvPath) {
    return new Promise((resolve, reject) => {
        let rawData = [];
        try {
            fs.createReadStream(csvPath)
                .pipe(CSV())
                .on('data', (data) => rawData.push(formatCSVLine(data)))
                .on('end', ()=> {
                    rawData.sort((a, b) => {
                        if (a["date"] < b["date"]) return -1;
                        else if (a["date"] > b["date"]) return 1;
                        else return 0;
                    })
                    resolve(rawData);
                })
                .on('error', (e)=>{
                    reject(e);
                })
        } catch (e) {
            reject(e);
        }
    });
}

const printDate = function (timestamp) {
    let d = new Date();
    d.setTime(timestamp);
    let date = d.getDate().toString(10), month = d.getMonth().toString(10),
        year = d.getFullYear().toString(10), hour = d.getHours().toString(10),
        min = d.getMinutes().toString(10);
    if (date.length<2) date = "0"+date;
    if (month.length<2) month = "0"+month;
    if (hour.length<2) hour = "0"+hour;
    if (min.length<2) min = "0"+min;
    return date+"/"+month+"/"+year+", "+hour+":"+min;
}

const generate_Excel_sheet = function (rawData, stopIndex, sheetName = null) {
    let name = sheetName != null ? sheetName : `#${stopIndex + 1}`;
    let sheet = workbook.addWorksheet(name);
    sheet.cell(1,1).string('Date');
    sheet.cell(1,2).string('Num Tx')
    sheet.cell(1,3).string('ID Tx');
    sheet.cell(1,4).string('Sens');
    sheet.cell(1,5).string('Crypto');
    sheet.cell(1,6).string('Debit');
    sheet.cell(1,7).string('Credit');
    sheet.cell(1,8).string('Cotation');
    sheet.cell(1,9).string('Debit Euro');
    sheet.cell(1,10).string('Credit Euro');
    sheet.cell(1,11).string('Frais');
    sheet.cell(1,12).string('Recus');
    sheet.cell(1,13).string('DR');
    sheet.cell(1,14).string('VDR');
    sheet.cell(1,15).string('W');
    sheet.cell(1,16).string('VW');
    sheet.cell(1,17).string('VM');
    sheet.cell(1,18).string('P');
    sheet.cell(1,19).string('D');
    sheet.cell(1,20).string('E');

    let j=2;
    for (let i=0; i<=Math.min(stopIndex, rawData.length-1); i++){
        const tx = rawData[i];
        sheet.cell(j+i,1).string(printDate(tx["date"]));
        sheet.cell(j+i,2).string(""+(i+1));
        sheet.cell(j+i,3).string(tx["txid"]);
        sheet.cell(j+i,4).string(tx["sens"]);
        sheet.cell(j+i,5).string(tx["crypto"].toString().toUpperCase());
        sheet.cell(j+i,6).number(tx["debit"]);
        sheet.cell(j+i,7).number(tx["credit"]);
        sheet.cell(j+i,8).number(tx["cotation"]);
        sheet.cell(j+i,9).number(tx["debit_euro"]);
        sheet.cell(j+i,10).number(tx["credit_euro"]);
        sheet.cell(j+i,11).number(tx["fee"]);
        sheet.cell(j+i,12).number(tx["received"]);
        sheet.cell(j+i,13).number(tx["dr"]);
        sheet.cell(j+i,14).number(tx["vdr"]);
        sheet.cell(j+i,15).number(tx["w"]);
        sheet.cell(j+i,16).number(tx["vw"]);
        sheet.cell(j+i,17).number(tx["vm"]);
        sheet.cell(j+i,18).number(tx["p"]);
        sheet.cell(j+i,19).number(tx["D"]);
        sheet.cell(j+i,20).string(tx["E"]);
    }

    return sheet;
}

const fifo_Proceed_Deposit = function (rawData, index) {
    const tx = rawData[index];
    tx["dr"] = tx["credit"];
    tx["vdr"] = tx["credit_euro"] || (tx["credit"]*tx["cotation"]);
    if (index + 1 === rawData.length || (rawData[index+1]["sens"] === "withdrawal")){
        return generate_Excel_sheet(rawData, index);
    }
    else {
        return null;
    }
}

const fifo_Proceed_Withdrawal = function (rawData, index) {
    const tx = rawData[index];
    let start = -1, end = -1;
    let i = 0;
    while (start < 0 && i < index) {
        if (rawData[i]["sens"] === "deposit" && rawData[i]["dr"] > 0) {
            start = i;
        } else {
            i++;
        }
    }
    if (start >= 0) {
        i = start;
        let D = 0;
        while (D < tx["debit"] && i < index) {
            if (rawData[i]["sens"] === "deposit") {
                D = D + rawData[i]["dr"]
            }
            i++;
        }
        if (D >= tx["debit"]) {
            end = i - 1;
            let w = 0, vw = 0;
            if (start === end) {
                let idx = start;
                w = tx["debit"];
                vw = tx["debit"] * rawData[idx]["cotation"];
                rawData[idx]["w"] = w;
                rawData[idx]["vw"] = vw;
                rawData[idx]["dr"] = rawData[idx]["dr"] - tx["debit"];
                rawData[idx]["vdr"] = rawData[idx]["dr"] * rawData[idx]["cotation"];
            }
            else {
                for (let j=start; j<end; j++){
                    if (rawData[j]["sens"] === "deposit"){
                        w = w + rawData[j]["dr"];
                        vw = vw + (rawData[j]["dr"] * rawData[j]["cotation"]);
                        rawData[j]["w"] = rawData[j]["dr"];
                        rawData[j]["vw"] = rawData[j]["dr"] * rawData[j]["cotation"];
                        rawData[j]["dr"] = 0;
                        rawData[j]["vdr"] = 0;
                    }
                }
                w = w + rawData[end]["dr"] - (D - tx["debit"]);
                vw = vw + (rawData[end]["dr"] - (D - tx["debit"])) * rawData[end]["cotation"];
                rawData[end]["w"] = rawData[end]["dr"] - (D - tx["debit"]);
                rawData[end]["vw"] = (rawData[end]["dr"] - (D - tx["debit"])) * rawData[end]["cotation"];
                rawData[end]["dr"] = D - tx["debit"];
                rawData[end]["vdr"] = rawData[end]["dr"] * rawData[end]["cotation"];
            }
            tx["w"] = w;
            tx["vw"] = vw;
            tx["vm"] = tx["debit_euro"] || (tx["debit"] * tx["cotation"]);
            tx["p"] = tx["vm"] - tx["vw"];
            tx["D"] = D;
            tx["E"] = "";
            if (start === end) {
                tx["E"] = ""+(start+1);
            }
            else {
                for (let j=start; j<end; j++){
                    if (rawData[j]["sens"] === "deposit"){
                        tx["E"] = tx["E"]+""+(j+1)+",";
                    }
                }
                tx["E"] = tx["E"]+""+(end+1);
            }
            return generate_Excel_sheet(rawData, index);
        }
        else {
            throw new Error("Probleme de coherence dans le fichier. Le montant du retrait " + tx["txid"] + " est superieur a la somme des stocks des depots precedents");
        }
    }
    else {
        throw new Error("Probleme de coherence dans le fichier. Le montant du retrait " + tx["txid"] + " est superieur a la somme des stocks des depots precedents (tous a 0)");
    }
}

const fifo = function (rawData) {
    let index = 0;
    for (index = 0; index < rawData.length; index++) {
        if (rawData[index]["sens"] === "deposit") {
            fifo_Proceed_Deposit(rawData, index);
        }
        else if (rawData[index]["sens"] === "withdrawal") {
            fifo_Proceed_Withdrawal(rawData, index);
        }
    }
}

const main = async function (path, done) {
    let raw = await parseCSV(path);
    generate_Excel_sheet(raw, raw.length-1, 'DEBUT');
    fifo(raw);

    // enregistre le résultat dans un fichier temporaire
    Temp.file({postfix: '.xlsx'}, function (err, path, fd, cleanup) {
        if (err) {
            throw err;
        }
        workbook.write(path, function (err, stats) {
            done(err, path);
        });
    });
}

router.post('/', upload.single('file'), function (req, res) {
    let file = req.file;

    // enregistre le fichier dans un fichier temporaire
    let tempFile = Temp.fileSync({
        postfix: file.originalname.substring(file.originalname.lastIndexOf('.'))
    }).name;
    fs.writeFileSync(tempFile, file.buffer);

    // lance le fifo
    main(tempFile, function (err, finalPath) {
        if (err) {
            console.log(err);
            return res.status(500);
        }
        res.download(finalPath, 'fifo-' + Date.now() + '.xlsx');
    }).catch(function (err) {
        console.log(err);
        return res.status(500);
    });
});

module.exports = router;
require("dotenv").config();
const http = require("http")

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const host = process.env.RPC_HOST;
const port = 8332
exports.url = url = new URL(`http:${USER}:${PASS}@${host}:${port}/`)

exports.headers = headers ={
    "content-type": "text/plain;"
};

exports.options = options = {
    method: "POST",
    headers: headers,
};

exports.getResult = function (dataString){
    return new Promise(result=>{
        var httpRequest = http.request(url,options,(response)=>{
            let tab =[];
            response.on('data', data=>{
                tab.push(data)
            }).on('end', ()=>{
                let data = Buffer.concat(tab)
                let schema = JSON.parse(data)
                result(schema.result)
            })
        }) 
    
        httpRequest.on('error', function(e) {
            console.log('problem with request: ' + e.message);
          });
    
        httpRequest.write(dataString)
        httpRequest.end()
    })
}
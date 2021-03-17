require("dotenv").config();
const http = require("http")

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const host = process.env.RPC_HOST;
const port = 8332
let url, headers, options ;

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
            if(response.headers['content-type']!='application/json'){
                //console.log("dataString", dataString);
                //console.log(response.headers['content-type']);
                response.on('data', data=>{
                    //console.log('non json data', data);
                    tab.push(data)
                }).on('end', ()=>{
                    //console.log('non json data tab', tab)
                    let data = Buffer.concat(tab)
                    //console.log('non json data concat', data)
                    let stringData = data.toString().trim()
                    console.log("non json data string", stringData)
                    let schema = JSON.parse(stringData)
                    result(schema.result)
                })
            }else{
                response.on('data', data=>{
                    tab.push(data)
                }).on('end', ()=>{
                    let data = Buffer.concat(tab)
                    let stringData = data.toString().trim()
                    let schema = JSON.parse(stringData)
                    //console.log("String data", stringData)
                    result(schema.result)
                })
            }
        }) 
    
        httpRequest.on('error', function(e) {
            console.log('problem with request: ' + e.message);
          });
    
        httpRequest.write(dataString)
        httpRequest.end()
    })
}
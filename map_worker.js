const http = require("http")
const {parentPort} = require('worker_threads')
const check = require('./check_worker')
const decrypt = require('./decrypt')
const mongoose = require('mongoose');
require("dotenv").config();

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const host = process.env.RPC_HOST;
const port = 8332
var url = new URL(`http:${USER}:${PASS}@${host}:${port}/`)// Database Name
const dbName = process.env.DB_NAME;
// Connection URL
const uri = 'mongodb://localhost:27017/'+dbName;

const headers = {
    "content-type": "application/json"
};

var options = {
    method: "POST",
    headers: headers,
};

function getResult(dataString){
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

let height
parentPort.on('message', (message)=>{  
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}) .then(()=>{
        height = message
        console.log(height)
        check(height).then((present)=>{
            if (!present){
                var dataString = `{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockhash\",\"params\":[${height}]}`;
            
                getResult(dataString).then(result=>{
                    getBlock(result)
                })
            }
        })
    }) 
})

async function getBlock(hash){
    let txids = []
    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblock",params:[`${hash}`]});
    const result = await getResult(dataString)
    txids = result.tx
    
    let mapTx = []

    for (let i = 0; i < txids.length; i++) {
        let tx = await getTx(txids[i])
        let voutTx = await getOuts(tx)
        let vinTx = await getIns(tx)
        mapTx.push({
            ins: voutTx,
            outs: vinTx
        })
    }        
    parentPort.postMessage(mapTx)
}
async function getTx(txid){
    let dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getrawtransaction",params:[`${txid}`, true]});
    let tx = await getResult(dataString)
    return tx
}
async function getOuts(rawtx){
    let outs = []
    let tab = rawtx.vout
    tab.forEach(vout => {
        if(vout.scriptPubKey.addresses != undefined){
            vout.scriptPubKey.addresses.forEach(addr => {
                let txin = {
                    txid: rawtx.txid,
                    address: addr,
                    n: vout.n,
                    value: vout.value,
                    blockhash: rawtx.blockhash
                }
                outs.push(txin)
            });
        }else{
            let txin = {
                txid: rawtx.txid,
                address: decrypt(vout),
                n: vout.n,
                value: vout.value,
                blockhash: rawtx.blockhash
            }
            console.log('decrypted', rawtx.txid)
            outs.push(txin)
        }
    });
    return outs
}
async function getIns(rawtx){
    let ins = []
    let tab = rawtx.vin
    for (let k = 0; k < tab.length; k++) {
        let vin = tab[k];                       
        if(vin.coinbase == undefined){
            let txSource = await getTx(vin.txid)
            let outs = await getOuts(txSource)
            outs.forEach(out => {
                if(out.n == vin.vout){
                    let txout = {
                        txid: rawtx.txid,
                        address: out.address,
                        n: vin.vout,
                        value: out.value,
                        blockhash: rawtx.blockhash
                    }
                    ins.push(txout)
                }                    
            })
        } else{
            getOuts(rawtx).then(outs=>{
                let value = 0
                outs.forEach(out => {
                    value += out.value                 
                })
    
                let txout = {
                    txid: rawtx.txid,
                    script: vin.coinbase,
                    n: vin.vout,
                    value: value,
                    blockhash: rawtx.blockhash,
                    coinbase: true
                }
                console.log('coinbase', rawtx.txid)
                ins.push(txout)
            })
        }
    }
    return ins
}
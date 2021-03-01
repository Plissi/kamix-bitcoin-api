const http = require("http")
const {parentPort} = require('worker_threads')
const dotenv = require("dotenv");
dotenv.config();

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const host = process.env.RPC_HOST;
const port = 8332
var url = new URL(`http:${USER}:${PASS}@${host}:${port}/`)

const headers = {
    "content-type": "text/plain;"
};

var options = {
    method: "POST",
    headers: headers,
};

function getResult(dataString){
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

let height
parentPort.on('message', (message)=>{    
    height = message
    
    var dataString = `{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockhash\",\"params\":[${height}]}`;
    
    getResult(dataString).then(result=>{
        getBlock(result)
    })
})




async function getBlock(hash){
    let txids = []

    /*var start = new Date()
    console.log("started at "+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds())*/

    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblock",params:[`${hash}`]});
    const result = await getResult(dataString)
    txids = result.tx
    
    let mapTx = []

    for (let i = 0; i < txids.length; i++) {
        let tx = await getTx(txids[i])
        let voutTx = await getOuts(tx)
        let vinTx = await getIns(tx)
        let fees = await getFees(vinTx, voutTx)
        mapTx.push({
            ins: vinTx,
            outs: voutTx,
            fees : fees
        })        
    }

    /*var end = new Date()
    console.log("ended at "+end.getHours()+":"+end.getMinutes()+":"+end.getSeconds())

    var duration  =  Math.abs(end-start)
    console.log("duration: "+duration+"ms")*/

    //console.log(JSON.stringify(mapTx,null,4))
    parentPort.postMessage(mapTx)
}
async function getTx(txid){
    dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getrawtransaction",params:[`${txid}`, true]});
    let tx = await getResult(dataString)
    return tx
}
async function getOuts(rawtx){
    let outs = []
    let tab = rawtx.vout
    tab.forEach(vout => {
        if(vout.scriptPubKey.addresses !=undefined){
            vout.scriptPubKey.addresses.forEach(addr => {
                let txin = {
                    txidIn: rawtx.txid,
                    addr: addr,
                    out: vout.n,
                    value: vout.value,
                    blockhash: rawtx.blockhash
                }
                outs.push(txin)
            });
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
                if(out.out == vin.vout){
                    let txout = {
                        txidOut: txSource.txid,
                        addr: out.addr,
                        in: vin.vout,
                        value: out.value,
                        blockhash: txSource.blockhash
                    }
                    ins.push(txout)
                }                    
            })
        } else{
            //console.log(vin)
        }
    }
    return ins
}
async function getFees(ins, outs){
    valueIn = 0
    valueOut = 0
    ins.forEach(input => {
        valueIn += input.value
    });
    outs.forEach(output =>{
        valueOut += output.value
    });
    fees = valueIn - valueOut
    if (fees <= 0){
        return 0
    } else {
        return fees
    }  
}

const express = require("express");
const router = express.Router();
const http = require("http")
const {spawn} = require('child_process')

const dotenv = require("dotenv");
const { json } = require("body-parser");
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

function getResult(dataString, res){
    return new Promise(result=>{
        var httpRequest = http.request(url,options,(response)=>{
            let tab =[];
            response.on('data', data=>{
                tab.push(data)
            }).on('end', ()=>{
                let data = Buffer.concat(tab)
                let schema = JSON.parse(data)
                res.schema = schema
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

router.get("/", (req, res)=>{
    res.send("<h1>It works!</h1>")
})

//get the block's hash from its height
router.get("/getblockhash/:height", (req, res)=>{
    var dataString = `{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockhash\",\"params\":[${req.params.height}]}`;
    var httpRequest = http.request(url,options,(response)=>{
        response.on('data', data=>{
            var receivedResult = JSON.parse(data)
            res.send(receivedResult)
        })
    }) 

    httpRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

    httpRequest.write(dataString)
    httpRequest.end()
})

//get the block from its hash
router.get("/getblock/:hash", (req, res)=>{
    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblock",params:[`${req.params.hash}`]});
    var httpRequest = http.request(url,options,(response)=>{
        let tab =[];
        response.on('data', data=>{
            console.log("start")
            tab.push(data)
        }).on('end', ()=>{
            let data = Buffer.concat(tab)
            let schema = JSON.parse(data)
            res.send(schema)
            res.schema = schema
            console.log("end")
        })
    }) 

    httpRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

    httpRequest.write(dataString)
    httpRequest.end()
})

//count the number of blocks present in the blockchain 
router.get("/getblockcount", (req, res)=>{
    var dataString = "{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockcount\",\"params\":[]}";

    var httpRequest = http.request(url,options,(response)=>{
        response.on('data', data=>{
            var receivedResult = JSON.parse(data)
            res.send(receivedResult)
        })
    }) 

    httpRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

    httpRequest.write(dataString)
    httpRequest.end()
})

//return information of the blockchain
router.get("/getblockchaininfo", (req, res)=>{
    var dataString = "{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockchaininfo\",\"params\":[]}";
    
    var httpRequest = http.request(url,options,(response)=>{
        response.on('data', data=>{
            var receivedResult = JSON.parse(data)
            res.send(receivedResult)
        })
    }) 

    httpRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
    httpRequest.write(dataString)
    httpRequest.end()
})

//list the latest transactions
router.get("/listtransactions", (req, res)=>{
    var dataString = "{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"listtransactions\",\"params\":[]}";
    var httpRequest = http.request(url,options,(response)=>{
        response.on('data', data=>{
            var receivedResult = JSON.parse(data)
            res.send(receivedResult)
        })
    }) 

    httpRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

    httpRequest.write(dataString)
    httpRequest.end()
})

//get information about a rawtransaction from the transaction id
router.get("/getrawtransaction/:txid", (req, res)=>{
    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getrawtransaction",params:[`${req.params.txid}`, true]});
    var httpRequest = http.request(url,options,(response)=>{
        let tab =[];
        response.on('data', data=>{
            console.log("start")
            tab.push(data)
        }).on('end', ()=>{
            let data = Buffer.concat(tab)
            let schema = JSON.parse(data)
            res.send(schema)
            console.log("end")
        })
    }) 

    httpRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

    httpRequest.write(dataString)
    httpRequest.end()
})

//mapping function
router.get("/map/:hash", (req, res)=>{
    let txids = []
    var start = new Date()
    console.log("started at "+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds())
    async function getBlock(){
        var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblock",params:[`${req.params.hash}`]});
        const result = await getResult(dataString, res)
        result.tx.forEach(tx =>{
            txids.push(tx)
        })
        
        let mapTx = []
        let outs = []
        let ins = []

        for (let i = 0; i < txids.length; i++) {
	    //console.log(i)
            let tx = await getTx(txids[i])
            let voutTx = await getOuts(tx.vout, txids[i], result.hash)
            let vinTx = await getIns(tx.vin)
            outs.push(voutTx) 
            ins.push(vinTx)          
        }

        mapTx.push({
            ins: ins,
            outs: outs
        })
    	var end = new Date()
    	console.log("ended at "+end.getHours()+":"+end.getMinutes()+":"+end.getSeconds())
	var duration  =  Math.abs(end-start)
	console.log("duration: "+duration+"ms")
        res.send(mapTx)
    }
    async function getTx(txid){
        dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getrawtransaction",params:[`${txid}`, true]});
        let tx = await getResult(dataString, res)
        return tx
    }
    async function getOuts(tab, txid, blockhash){
        let outs = []
        tab.forEach(vout => {
            if(vout.scriptPubKey.addresses !=undefined){
                vout.scriptPubKey.addresses.forEach(addr => {
                    let txin = {
                        txidIn: txid,
                        addr: addr,
                        out: vout.n,
                        value: vout.value,
                        blockhash: blockhash
                    }
                    outs.push(txin)
                });
            }
        });
        return outs
    }
    async function getIns(tab){
        let ins = []
        for (let k = 0; k < tab.length; k++) {
            const vin = tab[k];                
            
            if(vin.coinbase == undefined){
                let txid = vin.txid
                let tx = await getTx(txid)
                let outs = await getOuts(tx.vout, txid, tx.blockhash)
                outs.forEach(out => {
                    if(out.out==vin.vout){
                        let txout = {
                            txidOut: txid,
                            addr: out.addr,
                            in: vin.vout,
                            value: out.value,
                            blockhash: tx.blockhash
                        }
                        ins.push(txout)
                    }                    
                })
            } else{
                console.log(vin)
            }
        }
        return ins
    }
    getBlock()
})

router.get("/python-map/:hash", (req, res)=>{
    var dataSent
    const python = spawn('python', ['./map.py'])
    python.stdout.on('data', (data)=>{
        console.log('Getting data...')
        dataSent = data.toString()
    })
    python.on('close', (code)=>{
        console.log(`child process close all stdio with code ${code}`)
        res.send(dataSent)
    })
})
module.exports = router;


const express = require("express");
const router = express.Router();
const http = require("http")
const {spawn} = require('child_process')
const mongoose = require('mongoose')
const _ = require('lodash')
const TransactionIn = require('../model/TransactionsIn')
const TransactionOut = require('../model/TransactionsOut')

const dotenv = require("dotenv");
const { json } = require("body-parser");
dotenv.config();

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const host = process.env.RPC_HOST;
const port = 8332
var url = new URL(`http:${USER}:${PASS}@${host}:${port}/`)
// Database Name
const dbName = process.env.DB_NAME;

// Connection URL
const uri = `mongodb://localhost:27017/`+dbName;

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
    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblock",params:[`${req.params.hash}`, 2]});
    var httpRequest = http.request(url,options,(response)=>{
        let tab =[];
        response.on('data', data=>{
            //console.log("start")
            tab.push(data)
        }).on('end', ()=>{
            let data = Buffer.concat(tab)
            let schema = JSON.parse(data)
            res.send(schema)
            res.schema = schema
            //console.log("end")
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
router.get("/map/:height", (req, res)=>{
    let txids = []
    
    var start = new Date()
    console.log("started at "+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds())
    
    var dataString = `{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockhash\",\"params\":[${req.params.height}]}`;
    getResult(dataString, res).then(result=>{
        getBlock(result)
    })
    
    async function getBlock(hash){
        var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblock",params:[`${hash}`]});
        const result = await getResult(dataString, res)
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

    	var end = new Date()
    	console.log("ended at "+end.getHours()+":"+end.getMinutes()+":"+end.getSeconds())
        var duration  =  Math.abs(end-start)
        console.log("duration: "+duration+"ms")
        res.send(mapTx)
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
})

router.get("/python-map/:height", (req, res)=>{
    var height = req.params.height;
    var dataSent;
    const python = spawn('python3', ['./map.py', height]);
    python.stdout.on('data', (data)=>{
        console.log('Getting data...');
        dataSent = data.toString();
    });
    python.on('close', (code)=>{
        console.log(`child process close all stdio with code ${code}`);
        console.log(dataSent)
        res.send("<h1>Done!</h1>");
    });
})

async function call(){
    txout = await TransactionOut.distinct('txid');
    txin = await TransactionIn.distinct('txid');
    txids = await _.union(txin, txout);
    return txids
}
function looping(txids, page, perPage, res){
    transactions = []
    limitedTxids = []
    count= 1
    skip = perPage * page - perPage
    limit = perPage * page
    for (i = skip; i<limit; i++){
        limitedTxids.push(txids[i])
    }
    limitedTxids.forEach(txid=>{
        txout = TransactionOut.find({'txid': txid})    
        txin = TransactionIn.find({'txid': txid})
        
        Promise.all([txout, txin]).then(values=>{
            console.log('values', values)
            valueIns = 0;
            valueOuts = 0;
            pages = txids.length / perPage

            values[0].forEach(element => {
                valueOuts += element.value
            });

            values[1].forEach(element => {
                valueIns += element.value
            });

            fee = getFees(values[0], values[1])
            
            let data={}
            if (fee>0){
                data = {
                    'txid': txid,
                    'value': valueIns,
                    'fee': fee
                }
            }else{
                data = {
                    'txid': txid,
                    'value': valueIns,
                    'fee': 0
                }
            }

            transactions.push(data)
            if (count++ == perPage){
                res.send(transactions);
            }
        })
    })
};
function getFees(ins, outs){
    valueIn = 0
    valueOut = 0
    ins.forEach(input => {
        valueIn += input.value
    });
    outs.forEach(output =>{
        valueOut += output.value
    });
    fees = valueIn - valueOut
    console.log('i',valueIn,'o',valueOut,'f',fees)
    if (fees <= 0){
        return 0
    } else {
        return fees
    }  
}
router.get('/transactions', (req, res) =>{
    page = Math.max(1, req.query.page)
    perPage = Math.max(1, req.query.limit)
    //Connect to Database
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    call().then((txids)=>{
        looping(txids, page, perPage, res)        
    })
  
})

router.get('/transaction', (req, res) =>{
    transaction = []
    //Connect to Database
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    TransactionOut.find({txid: req.query.search}).then((tx)=>{
        transaction.push({outs: tx})
        TransactionIn.find({txid: req.query.search}).then((tx)=>{
            transaction.push({ins: tx})
            res.send(transaction)
        })
    })
    
})

router.get('/address', (req, res) =>{
    address = []
    //Connect to Database
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    TransactionOut.find({address: req.query.search}).then((addr)=>{
        address.push({outs: addr})
        TransactionIn.find({address: req.query.search}).then((addr)=>{
            address.push({ins: addr})
            res.send(address)
        })
    })
    
})
module.exports = router;

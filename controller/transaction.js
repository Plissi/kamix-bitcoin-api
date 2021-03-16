const TransactionIn = require('../model/TransactionsIn')
const TransactionOut = require('../model/TransactionsOut')
const {getResult} = require('../rpc_config')
const _ = require('lodash')

async function call(){
    let txout = await TransactionOut.distinct('txid');
    let txin = await TransactionIn.distinct('txid');
    let txids = await _.union(txin, txout);
    return txids
}

function looping(txids, page, perPage, res){
    let transactions = []
    let limitedTxids = []
    let count= 1
    let skip = perPage * page - perPage
    let limit = perPage * page
    for (var i = skip; i<limit; i++){
        limitedTxids.push(txids[i])
    }
    limitedTxids.forEach(txid=>{
        let txout = TransactionOut.find({'txid': txid})    
        let txin = TransactionIn.find({'txid': txid})
        
        Promise.all([txout, txin]).then(values=>{
            //let pages = txids.length / perPage
            let fee = getFees(values[0], values[1])[0];
            let valueIn = getFees(values[0], values[1])[2];
            //let valueOuts = getFees(values[0], values[1])[2];
            let data={}
            data = {
                'txid': txid,
                'value': valueIn,
                'fee': fee
            }
            //console.log('fee', fee, 'i', valueIns, 'o', valueOuts)
            transactions.push(data)
            if (count++ == perPage){
                res.send(transactions);
            }
        })
    })
}

function getFees(inputs, outputs){
    let valueIn = 0
    let valueOut = 0
    inputs.forEach(input => {
        valueIn += input.value
    });
    outputs.forEach(output =>{
        valueOut += output.value
    });
    let fees = valueIn - valueOut
    if (fees <= 0){
        return [0, valueIn, valueOut]
    } else {
        return [fees, valueIn, valueOut]
    }  
}

//get information about a rawtransaction from the transaction id
exports.getrawtransaction = (req, res)=>{
    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getrawtransaction",params:[`${req.params.txid}`, true]});
    getResult(dataString).then(result=>{
        res.send(result)
    })
}

//list the latest transactions
exports.listtransactions = (req, res)=>{
    var dataString = "{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"listtransactions\",\"params\":[]}";
    getResult(dataString).then(result=>{
        res.send(result)
    })
}

exports.gettransactions = (req, res) =>{
    let page = Math.max(1, req.query.page)
    let perPage = Math.max(1, req.query.limit)

    call().then((txids)=>{
        looping(txids, page, perPage, res)        
    })
  
}

exports.gettransaction = (req, res) =>{
    let transaction = []
    TransactionOut.find({txid: req.query.search}).then((tx)=>{
        transaction.push({outs: tx})
        TransactionIn.find({txid: req.query.search}).then((tx)=>{
            transaction.push({ins: tx})
            res.send(transaction)
        })
    })   
}

exports.getaddress = (req, res) =>{
    let address = []
    TransactionOut.find({address: req.query.search}).then((addr)=>{
        address.push({outs: addr})
        TransactionIn.find({address: req.query.search}).then((addr)=>{
            address.push({ins: addr})
            res.send(address)
        })
    })
}


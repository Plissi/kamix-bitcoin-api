const TransactionIn = require('../model/TransactionsIn')
const TransactionOut = require('../model/TransactionsOut')
const Transaction = require('../model/Transactions')
const {getResult} = require('../rpc_config')
const {pastBtcPrice} = require('../functions/past_bitcoin_price')

async function call(page, perPage){
    let txs = await Transaction.find().select('_id')
    .limit(perPage)
    .skip(perPage * page)
    .sort({time: -1})
    let txids = [];
    txs.forEach(tx=>{
        txids.push(tx._id)
    })
    return txids
}

function looping(txids, res){
    let transactions = []
    txids.forEach(txid=>{
        let txout = TransactionOut.find({'txid': txid})    
        let txin = TransactionIn.find({'txid': txid})
        
        Promise.all([txout, txin]).then(values=>{
            let fee = getFees(values[0], values[1])[0];
            let valueIn = getFees(values[0], values[1])[2];
            let data={}
            data = {
                'txid': txid,
                'value': valueIn,
                'fee': fee
            }
            transactions.push(data)
            if (txid.length == transactions.length){
                res.json(transactions);
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
        result.time *= 1000
        result.blocktime *= 1000
        res.json(result)
    })
}

//list the latest transactions
exports.listtransactions = (req, res)=>{
    var dataString = "{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"listtransactions\",\"params\":[]}";
    getResult(dataString).then(result=>{
        res.json(result)
    })
}

exports.gettransactions = (req, res) =>{
    let page = Math.max(1, req.query.page)
    let perPage = Math.max(1, req.query.limit)

    call(page, perPage).then((txids)=>{
        looping(txids, res)        
    })
  
}

exports.gettransaction = (req, res) =>{
    let txout = TransactionOut.find({'txid': req.query.search})    
    let txin = TransactionIn.find({'txid': req.query.search})
    Promise.all([txout, txin]).then(values=>{
        let fee = getFees(values[0], values[1])[0];
        let valueIn = getFees(values[0], values[1])[2];
        let transaction = {
            'outs': values[0],
            'ins': values[1],
            'fee': fee,
            'received': valueIn
        }
        res.json(transaction)
    })
}

exports.getaddress = (req, res) =>{
    TransactionIn.aggregate([
        { $unionWith: { coll: "txout"} },
        { $match : { address: req.query.search } },
        { $group : { _id : "$txid"} }
    ]).option({
        allowDiskUse: true
    }).exec((err, result)=>{
        let transactions = [];
        result.forEach(tx=>{
            let txid = tx._id
            let txout = TransactionOut.find({'txid': txid})    
            let txin = TransactionIn.find({'txid': txid})
            Promise.all([txout, txin]).then(values=>{
                let fee = getFees(values[0], values[1])[0];
                let valueIn = getFees(values[0], values[1])[2];
                let data={
                    'txid': txid,
                    'outs': values[0],
                    'ins': values[1],
                    'fee': fee,
                    'received': valueIn
                }
                transactions.push(data)
                if(result.length == transactions.length){
                    console.log(transactions)
                    res.json(transactions)
                }
            })
        })
    })
}

exports.getaddressinfos = async (req, res) =>{
    let search = req.query.search;
    let io = [];
    let start = Date.now()
    let result = await Promise.all([
        TransactionOut.find({'address': search}, {'txid': 1, 'value': 1, 'blocktime': 1}), 
        TransactionIn.find({'address': search}, {'txid': 1, 'value': 1, 'blocktime': 1})
    ])
    io.push(result[0].map(output => {
        return {
            '_id': output.txid,
            'time': output.blocktime,
            'sens': 'withdrawal',
            'value': output.value
        }
    }));
    io.push(result[1].map(input => {
        return {
            '_id': input.txid,
            'time': input.blocktime,
            'sens': 'deposit',
            'value': input.value
        }
    }));
    let txids = io[0].concat(io[1]);
    let transactions = txids.map(async tx=>{
        let txid = tx._id;
        let date = 1000 * tx.time;
        let sens = tx.sens;
        let debit = 0, credit = 0;
        if (sens == 'withdrawal'){
            credit = tx.value;
        } else{
            debit = tx.value;
        }

        let txout = TransactionOut.find({'txid': txid}, {'txid': 1, 'value': 1}).hint("txid_1_address_1"); 
        let txin = TransactionIn.find({'txid': txid}, {'txid': 1, 'value': 1}).hint("txid_1_address_1");

        let values = await Promise.all([txout, txin, pastBtcPrice(date)]);
        let price = values[2];
        let fee = getFees(values[0], values[1])[0];
        let valueIn = getFees(values[0], values[1])[2];
        return {
            'date': date,
            'txid': txid,
            'sens': sens,
            'crypto': 'btc',
            'debit': debit,
            'credit': credit,
            'cotation': price,
            'debit_euro': debit * price,
            'credit_euro': credit * price,
            'fee': fee,
            'received': valueIn
        }
    })
    
    await Promise.all(transactions).then(completed => {
        console.log('matched', Date.now()-start + 'ms');
        res.json(completed);
    })
}
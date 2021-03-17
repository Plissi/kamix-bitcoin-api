const decrypt = require('./decrypt')
const {getResult} = require('../rpc_config')

async function getBlock(hash){
    return new Promise(result=>{
        let mapTx = []
        var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblock",params:[`${hash}`]});
        getResult(dataString).then((block)=>{
            let txids = block.tx
            txids.forEach(async (txid) =>{
                let tx = await getTx(txid)
                let voutTx = await getOuts(tx)
                let vinTx = await getIns(tx)
                mapTx.push({
                    ins: voutTx,
                    outs: vinTx
                })
                if(mapTx.length === txids.length){
                    result(mapTx);
                }
            })
        })
    })      
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
                    blockhash: rawtx.blockhash,
                    blocktime: rawtx.time
                }
                outs.push(txin)
            });
        }else{
            let txin = {
                txid: rawtx.txid,
                address: decrypt(vout),
                n: vout.n,
                value: vout.value,
                blockhash: rawtx.blockhash,
                blocktime: rawtx.time
            }
            //console.log('decrypted', rawtx.txid)
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
                        blockhash: rawtx.blockhash,
                        blocktime: rawtx.time
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
                    blocktime: rawtx.time,
                    coinbase: true
                }
                //console.log('coinbase', rawtx.txid)
                ins.push(txout)
            })
        }
    }
    return ins
}

exports.getBlock = getBlock;
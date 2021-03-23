const decrypt = require('./decrypt')
const {getResult} = require('../rpc_config')

async function getBlock(hash){
    console.log('getBlock');
    return new Promise(result=>{
        let mapTx = []
        var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblock",params:[`${hash}`]});
        getResult(dataString).then((block)=>{
            let txids = block.tx
            console.log('txids length', txids.length)
            txids.forEach(txid =>{
                getTx(txid).then(tx=>{
                    let voutTx = getOuts(tx)
                    let vinTx = getIns(tx)
    
                    Promise.all([voutTx, vinTx]).then(values=>{
                        mapTx.push({
                            ins: values[0],
                            outs: values[1]
                        })
                        if(mapTx.length === txids.length){
                            result(mapTx);
                            console.log('mapTx ok')
                        }
                    }).catch(e => {
                        console.log('get block error', e)
                    } )
                })
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
const decrypt = require('./decrypt')
const {getResult} = require('../rpc_config')

async function getBlock(hash){
    let mapTx = []
    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblock",params:[`${hash}`]});
    const block = await getResult(dataString)
    let txids = block.tx
    let fini = 0;
    for (let i = 0; i < txids.length; i++) {
        let txid = txids[i]
        let tx = await getTx(txid)
        let voutTx = getOuts(tx)
        let vinTx = getIns(tx)

        await Promise.all([voutTx, vinTx]).then(values=>{
            mapTx.push({
                ins: values[0],
                outs: values[1]
            })
            if(++fini === txids.length){
                console.log('mapTx ok')
            }
        }).catch(e => {
            console.log('get block error', e)
        } )
    } 
    return new Promise(result=>{
        result(mapTx)
    })
}

function getTx(txid){
    return new Promise(result => {
        let dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getrawtransaction",params:[`${txid}`, true]});
        getResult(dataString).then(tx => {
            result(tx)
        })
    })
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
        }else if(vout.scriptPubKey.type == "pubkey"){
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
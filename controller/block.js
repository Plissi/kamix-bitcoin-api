const {getResult} = require('../rpc_config');
const Check = require('../model/CheckBlock')

//get the block's hash from its height
exports.getblockhash = (req, res)=>{
    var dataString = `{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockhash\",\"params\":[${req.params.height}]}`;
    getResult(dataString).then(result=>{
        res.send({hash: result})
    }).catch(e=>{
        if (e) console.log(e);
    })
}

//get the block from its hash
exports.getblock = (req, res)=>{
    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblock",params:[`${req.params.hash}`]});
    getResult(dataString).then(result=>{
        res.send(result)
    }).catch(e=>{
        if (e) console.log(e);
    })
}

//count the number of blocks present in the blockchain 
exports.getblockcount = (req, res)=>{
    var dataString = "{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockcount\",\"params\":[]}";
    getResult(dataString).then(result=>{
        res.send({blockcount: result})
    }).catch(e=>{
        if (e) console.log(e);
    })
}

exports.getbitcoininfos = (req, res) => {
    var dataString = "{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockcount\",\"params\":[]}";
    const processedCount = Check.countDocuments();
    const totalCount = getResult(dataString);

    Promise.all([processedCount, totalCount]).then(values => {
        let percentage = Math.round((values[0]/values[1])*100);
        
        let data = {
            'processed': values[0],
            'total': values[1],
            'percentage': percentage
        }

        res.send(data);
    })
}

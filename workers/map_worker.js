const {parentPort} = require('worker_threads')
const check = require('./check_worker')
const {getResult} = require('../rpc_config')
const {getBlock} = require('../functions/map')

const mongoose = require('mongoose');
const uri = process.env.DB_URI;

let height
parentPort.on('message', (message)=>{  
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
        height = message
        check(height).then((present)=>{
            if (!present){
                var dataString = `{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockhash\",\"params\":[${height}]}`;
            
                getResult(dataString).then(result=>{
                    getBlock(result).then((map)=>{
                        parentPort.postMessage(map)
                    })
                })
            }else{
                parentPort.postMessage(null)
            }
        })
    })
})


const WorkerPool = require('./worker_pool')
const http = require("http")
const dotenv = require("dotenv");
const fs = require('fs')
const { exit } = require('process');
const mongoose = require('mongoose');
const TransactionIn = require('./model/TransactionsIn')
const TransactionOut = require('./model/TransactionsOut')

dotenv.config();

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const host = process.env.RPC_HOST;
const port = 8332
var url = new URL(`http:${USER}:${PASS}@${host}:${port}/`)
// Database Name
const dbName = process.env.DB_NAME;

// Connection URL
const uri = 'mongodb://localhost:27017/'+dbName;

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

/*
function useWorker(path, height){
    return new Promise((resolve, reject)=>{
        const worker = new Worker(path, {workerData : height})
        worker.on('online', ()=>{
            console.log("Block "+height+" started")
        })
        worker.on('message', messageReceived=>{
            console.log(messageReceived)
            return resolve
        })
        worker.on('error', reject)
        worker.on('exit', code=>{
            if(code!=0){
                reject(new Error(`Worker stopped with exit code ${code}`))
            }else{
                console.log("Block "+height+" ended")
            }
        })
    })
}
*/

async function insertion(result, outsCollection, insCollection){
    ins = []
    outs = []
    for (i = 0; i<result.length; i++){
        result[i].ins.forEach(async inElement => {
            find = await insCollection.find(inElement).countDocuments()
            
            if (inElement.length != 0 && find == 0){
                try {
                    await insCollection.create(inElement)
                } catch (error) {
                    console.log(error)
                }
            }
        });
        
        result[i].outs.forEach(async outElement => {
            find = await outsCollection.find(outElement).countDocuments()
            if(outElement.length != 0 && find == 0){
                try {
                    await outsCollection.create(outElement)
                } catch (error) {
                    console.log(error)
                } 
               outs.push(outElement)
            }
       });
    }
}

async function main(){
    //await useWorker('./map_worker.js')
    //Connect to Database
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})

    //Create worker pools
    const pool = new WorkerPool(100);

    var start = new Date()
    console.log("started at "+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds())

    //Retrieve Blockcount
    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblockcount",params:[]});
    const blockcount = await getResult(dataString);
    //const blockcount =100200

    let finished = 0;
    for (let i = blockcount; i > blockcount-200; i--) {

        pool.runTask(i, (err, result) => {            
            if (err){
                pool.runTask(i, (err, result)=>{
                    if (err){
                        console.log(i, err);
                        fs.appendFile('error.log', i.toString()+'\n', 'utf8', (err) => {
                            if (err) throw err;
                        });
                    }else{
                        insertion(result, TransactionIn, TransactionOut).then((err)=>{
                            if (err) throw err
                        })
                    }
                })
            }else{
                insertion(result, TransactionIn, TransactionOut).then((err)=>{
                   
                    if (err) throw err
                    else  console.log('ok', i)
                })
            }

            if (++finished === 200){
                var end = new Date()
                console.log("ended at "+end.getHours()+":"+end.getMinutes()+":"+end.getSeconds())

                var duration  =  Math.abs(end-start)
                console.log("duration: "+duration+"ms")
                pool.close();
                exit()
            }
            
        });
    }
}

main()
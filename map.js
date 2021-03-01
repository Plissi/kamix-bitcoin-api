const WorkerPool = require('./worker_pool')
const http = require("http")
const dotenv = require("dotenv");
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

async function main(){
    //await useWorker('./map_worker.js')
    const pool = new WorkerPool(100);
    var start = new Date()
    console.log("started at "+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds())

    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblockcount",params:[]});
    const blockcount = await getResult(dataString);;

    let finished = 0;
    for (let i = blockcount; i > blockcount-200; i--) {

        pool.runTask(i, (err, result) => {
            //console.log(i, err, result);
            console.log("i",i);
            console.log("finished", finished);
            if (++finished === 200){
                var end = new Date()
                console.log("ended at "+end.getHours()+":"+end.getMinutes()+":"+end.getSeconds())

                var duration  =  Math.abs(end-start)
                console.log("duration: "+duration+"ms")
                pool.close();
            }
            
        });
    }
}

main()
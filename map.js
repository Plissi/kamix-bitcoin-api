const WorkerPool = require('./workers/worker_pool')
const fs = require('fs')
const { exit } = require('process');
const mongoose = require('mongoose');
const TransactionIn = require('./model/TransactionsIn')
const TransactionOut = require('./model/TransactionsOut')
const check = require('./workers/check_worker')
const {getResult} = require('./rpc_config')

const uri = process.env.DB_URI;

async function insertion(result){
    for (let i = 0; i<result.length; i++){
        result[i].ins.forEach(async inElement => {
            find = await TransactionIn.find(inElement).countDocuments()
            
            if (inElement.length != 0 && find == 0){
                try {
                    await TransactionIn.create(inElement)
                } catch (error) {
                    try {
                        await TransactionIn.create(inElement)
                    } catch (e) {
                        fs.appendFile('logs/insertion.log', e+'\n', 'utf8', (err) => {
                            if (err) throw err;
                        });
                    }
                }
            }
        });
        
        result[i].outs.forEach(async outElement => {
            find = await TransactionOut.find(outElement).countDocuments()
            if(outElement.length != 0 && find == 0){
                try {
                    await TransactionOut.create(outElement)
                } catch (error) {
                    try {
                        await TransactionOut.create(outElement)
                    } catch (e) {
                        fs.appendFile('logs/insertion.log', e+'\n', 'utf8', (err) => {
                            if (err) throw err;
                        });
                    } 
                } 
            }
       });
    }
}

async function main(){
    //Connect to Database
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

    //Create worker pools
    const pool = new WorkerPool(100);

    var start = new Date()
    const startStr = "started at "+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds()
    fs.appendFile('logs/exec.log', startStr+'\n', 'utf8', (error) => {
        if (error) throw error;
    });

    //Retrieve Blockcount
    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblockcount",params:[]});
    console.log(dataString);
    //const blockcount = await getResult(dataString);
    //console.log(blockcount);
    const blockcount = 105000;
    //const nblocks = 5;

    let finished = 0;

    for (let i = blockcount; i > 0; i--) {
        pool.runTask(i, (err, result) => {            
            if (err){
                pool.runTask(i, (e, r)=>{
                    if (e){
                        check(i, e).then(()=>{
                            fs.appendFile('logs/error.log', i.toString()+'\n', 'utf8', (error) => {
                                if (error) throw error;
                            });
                        })
                    }else{
                        check(i).then(()=>{
                            insertion(result).then((e)=>{
                                if (e) throw e
                            })
                        })
                    }
                })
            }else{
                check(i).then(()=>{
                    insertion(result).then((e)=>{
                        if (e) throw e
                        else  console.log('ok', i)
                    })
                })
            }

            var current = new Date()
            const finishedStr = i+" "+current.getHours()+":"+current.getMinutes()+":"+current.getSeconds()

            fs.appendFile('logs/exec.log', finishedStr+'\n', 'utf8', (error) => {
                if (error) throw error;
            });

            if (++finished === blockcount){
                console.log('finished')
                var end = new Date()
                const endStr = "ended at "+end.getHours()+":"+end.getMinutes()+":"+end.getSeconds()
                fs.appendFile('logs/exec.log', endStr+'\n', 'utf8', (error) => {
                    if (error) throw error;
                    var duration  =  Math.abs(end-start)
                    const durationStr = "duration: "+duration+"ms"
                    fs.appendFile('logs/exec.log', durationStr+'\n', 'utf8', (e) => {
                        if (e) throw e;
                        pool.close();
                        exit()
                    });
                });
            }
        });
    }
}

main()

const WorkerPool = require('./workers/worker_pool');
const fs = require('fs');
const { exit } = require('process');
const mongoose = require('mongoose');
const TransactionIn = require('./model/TransactionsIn');
const TransactionOut = require('./model/TransactionsOut');
const check = require('./workers/check_worker');
const {getResult} = require('./rpc_config');
const os = require("os");
const ora = require("ora");

const cpuCount = os.cpus().length;

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
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connexion à MongoDB réussie !'))
        .catch((err) => console.log('Connexion à MongoDB échouée !', err));

    //Create worker pools
    //const pool = new WorkerPool(100);
    console.log('nbre cpu:', cpuCount);
    const pool = new WorkerPool(cpuCount);

    var start = new Date()
    const startStr = "started on "+start+"\n";
    fs.appendFile('logs/exec.log', startStr, 'utf8', (error) => {
        if (error) throw error;
    });



    //Retrieve Blockcount
    var dataString = JSON.stringify({jsonrpc:"2.0",id:"curltext",method:"getblockcount",params:[]});
    const blockcount = await getResult(dataString);
    //const blockcount = 101000;
    const nblocks = 2;
    let finished = 0;

    for (let i = blockcount; i > blockcount-nblocks; i--) {

        const spinner = ora("Loading Blockchain \n").start();
        spinner.color = "yellow";
        spinner.text = "Traitement en cours ...";

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
            const finishedStr = finished+" "+i+" "+current.getHours()+":"+current.getMinutes()+":"+current.getSeconds()

            fs.appendFile('logs/exec.log', finishedStr+'\n', 'utf8', (error) => {
                if (error) throw error;
            });

            if (++finished === blockcount){
                console.log('finished')
                var end = new Date();
                const endStr = "ended on "+end+"\n";
                fs.appendFile('logs/exec.log', endStr, 'utf8', (error) => {
                    if (error) throw error;
                    var duration  =  Math.abs(end-start)
                    const durationStr = "duration: "+duration+"ms"
                    fs.appendFile('logs/exec.log', durationStr+'\n', 'utf8', (e) => {
                        if (e) throw e;
                        pool.close();
                        spinner.stop();
                        console.log("\n Fin du traitement");
                        exit();
                    });
                });
            }
        });

    }
}

main();

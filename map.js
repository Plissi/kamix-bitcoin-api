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

function insertion(block, result){
    console.log('result.length', result.length);
    let count = 0;
    for (var i = 0; i<result.length; i++){
        let tx = result[i]
        ++count;
        tx.ins.forEach(async inElement => {
            find = await TransactionIn.find(inElement).countDocuments()
            if (inElement.length != 0 && find == 0){
                try {
                    await TransactionIn.create(inElement)
                } catch (error) {
                    try {
                        await TransactionIn.create(inElement)
                    } catch (e) {
                        check(block, e, true)
                        fs.appendFileSync('logs/insertion.log', e+'\n', 'utf8', (err) => {
                            if (err) throw err;
                        });
                    }
                }
            }
        });
        
        tx.outs.forEach(async outElement => {
            find = await TransactionOut.find(outElement).countDocuments()
            if(outElement.length != 0 && find == 0){
                try {
                    await TransactionOut.create(outElement)
                } catch (error) {
                    try {
                        await TransactionOut.create(outElement)
                    } catch (e) {
                        check(block, e, true)
                        fs.appendFileSync('logs/insertion.log', e+'\n', 'utf8', (err) => {
                            if (err) throw err;
                        });
                    } 
                } 
            }
       });
    }
    return new Promise(resolve => { 
        if (count == result.length){
            check(block, false, true)
        }else {
            check(block, 'incomplete insertion', true)
        }
        resolve('ok');
    })
}

async function main(){
    //Connect to Database
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connexion à MongoDB réussie !'))
        .catch((err) => console.log('Connexion à MongoDB échouée !', err));

    //Create worker pool
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
    const nblocks = 10;
    let finished = 0;

    for (let i = blockcount; i > blockcount-nblocks; i--) {
    
        const spinner = ora("Loading Blockchain \n").start();
        spinner.color = "yellow";
        spinner.text = "Traitement en cours ...";

        pool.runTask(i, async (err, result) => {            
            if (err){
                /*check(i, err).then(()=>{
                    fs.appendFile('logs/error.log', i+" "+err.toString()+'\n', 'utf8', (error) => {
                        if (error) throw error;
                    });
                })*/
            }else{
                const finishedStr = finished+" "+i+" "+ new Date()
                fs.appendFileSync('logs/exec.log', finishedStr+'\n', 'utf8', (error) => {
                    if (error) throw error;
                });
                let insertionResult = await insertion(i, result);
                if (insertionResult == 'ok'){
                    console.log('ok', i);
                    if (++finished === nblocks){
                        //console.log('finished')
                        var end = new Date();
                        const endStr = "ended on "+end+"\n";
                        fs.appendFileSync('logs/exec.log', endStr, 'utf8', (error) => {
                            if (error) throw error;
                        });
                        var duration  =  Math.abs(end-start)
                        const durationStr = "duration: "+duration+"ms"
                        fs.appendFileSync('logs/exec.log', durationStr+'\n', 'utf8', (e) => {
                            if (e) throw e;
                        });
                        pool.close();
                        spinner.stop();
                        console.log("\nFin du traitement");
                        exit(1);
                    }
                }
            }
        });

    }
}

main();
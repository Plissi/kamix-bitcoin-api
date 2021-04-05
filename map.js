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

async function insertion(block, result){
    console.log(result.length, ' transactions');
    let options = { ordered: true };
    let ajout = await new Promise(resolve =>{
        let tab = [];
        let inAAjouter = [];
        let outAAjouter = [];
        for(let tx of result) {
            for(let inElement of tx.ins){
                //await TransactionIn.findOne(inElement).countDocuments().then(async (find) => {
                    //if (find == 0){
                        inAAjouter.push(inElement)
                   // }   
                //})  
            }
            for(let outElement of tx.outs){
                //await TransactionOut.findOne(outElement).countDocuments().then(async (find) => {
                    //if(find == 0){
                        outAAjouter.push(outElement)
                   // }  
               // })
           }
           if(result.indexOf(tx)+1 == result.length){
                tab[0] = inAAjouter;
                tab[1] = outAAjouter;
           }
        }
        resolve(tab);
    })
    await Promise.all([TransactionIn.insertMany(ajout[0], options), TransactionOut.insertMany(ajout[1], options)]).then((res)=>{
        console.log(res[0].length + res[1].length, ' documents inserted');
        check(block, false, true)
        fs.appendFileSync('logs/insertion.log', 'insertion completed for block '+block+'\n', 'utf8', (err) => {
            if (err) throw err;
        });
    },e=>{
        check(block, e, true)
        fs.appendFileSync('logs/insertion.log', e+'\n', 'utf8', (err) => {
            if (err) throw err;
        });
    })
    return new Promise(resolve => {
        console.log(ajout[0].length + ajout[1].length, ' waited')
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
    const nblocks = blockcount;
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
                if (result != null){
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
                            //exit(1);
                        }
                    }
                }else{
                    //const finishedStr = "already "+i+" "+ new Date()
                    //fs.appendFileSync('logs/exec.log', finishedStr+'\n', 'utf8', (error) => {
                    //    if (error) throw error;
                    //});
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
                        //exit(1);
                    }
                }
            }
        });

    }
}

main();

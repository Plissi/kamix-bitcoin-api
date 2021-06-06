const Check = require('../model/CheckBlock');
const TransactionsIn = require('../model/TransactionsIn');
const {getResult} = require("../rpc_config");

module.exports = (block, error, terminated)=>{
    return new Promise(result => {
        Check.findOne({'height': block}).countDocuments().then(async (find)=>{
            if (find == 0){
                let begin = new Date() ;
                let data = {
                    height: block,
                    et: 0,
                    comment: "Processing",
                    start: begin,
                    end: "",
                    ee: 0
                }
                try {
                    await Check.create(data);
                    result(false);
                } catch (e) {
                    console.log(e);
                }
            }else if (find == 1){
                let finish = new Date()
                try {
                    let checkline = await Check.findOne({'height': block});
                    if (error){
                        checkline.ee = 1;
                        checkline.comment = error;
                        checkline.end = finish;
                    }else if (terminated){
                        checkline.et = 1;
                        checkline.end = finish;
                    } else if (checkline.et == 0){
                        var dataString = `{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockhash\",\"params\":[${block}]}`;

                        let blockhash = await getResult(dataString)
                        let checkin = await TransactionsIn.findOne({'blockhash': blockhash}).countDocuments()
                        if (checkin == 0){
                            result(false)
                        }else {
                            checkline.et = 1;
                            checkline.end = finish;
                        }
                    }
                    await checkline.save();
                    result(true);
                } catch (e) {
                    console.log(e);
                }
            }
        }).catch((err) => {
            if (err) console.log(block, 'error', err);
        })
    })
}


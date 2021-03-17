const express = require("express");
const router = express.Router();
const {getBlock} = require('../functions/map');
const {getResult} = require('../rpc_config');

router.get("/", (req, res)=>{
    res.send("<h1>It works!</h1>")
})

//mapping function
router.get("/map/:height", (req, res)=>{    
    var start = new Date()
    console.log("started at "+start.getHours()+":"+start.getMinutes()+":"+start.getSeconds())
    
    var dataString = `{\"jsonrpc\":\"2.0\",\"id\":\"curltext\",\"method\":\"getblockhash\",\"params\":[${req.params.height}]}`;
    getResult(dataString).then(result=>{
        getBlock(result).then((map)=>{
            var end = new Date()
            console.log("ended at "+end.getHours()+":"+end.getMinutes()+":"+end.getSeconds())
    
            var duration  =  Math.abs(end-start)
            console.log("duration: "+duration+"ms")
            res.send(map)
        })
    })
})

module.exports = router;

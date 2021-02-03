
const express = require("express");
const router = express.Router();
var request = require("request");

const dotenv = require("dotenv");
const { json } = require("body-parser");
dotenv.config();

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;

const headers = {
    "content-type": "text/plain"
};

//get the block's hash from its height
router.get("/getblockhash/:height", (req, res)=>{
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockhash","params":["${
        req.params.height
    }"]}`;
    var options = {
        url: `http:${USER}:${PASS}@178.128.164.154:8332`,
        method: "POST",
        headers: headers,
        body: dataString
    };

    callback = (error, response, body) =>{
        if (!error && response.statusCode==200){
            const data = JSON.parse(body);
            res.send(data);
        }
    };

    request(options,callback);
})

//get the block from its hash
router.get("/getblock/:hash", (req, res)=>{
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblock","params":["${
        req.params.hash
    }"]}`;
    var options = {
        url: `http:${USER}:${PASS}@178.128.164.154:8332`,
        method: "POST",
        headers: headers,
        body: dataString
    };

    callback = (error, response, body) =>{
        if (!error && response.statusCode==200){
            const data = JSON.parse(body);
            res.send(data);
        }
    };

    request(options,callback);
})

//count the number of blocks present in the blockchain 
router.get("/getblockcount", (req, res)=>{
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockcount","params":[]}`;
    var options = {
        url: `http:${USER}:${PASS}@178.128.164.154:8332`,
        method: "POST",
        headers: headers,
        body: dataString
    };

    callback = (error, response, body) =>{
        if (!error && response.statusCode==200){
            const data = JSON.parse(body);
            res.send(data);
        }
    };

    request(options,callback);
})

//return information of the blockchain
router.get("/getblockchaininfo", (req, res)=>{
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockchaininfo","params":[]}`;
    var options = {
        url: `http:${USER}:${PASS}@178.128.164.154:8332`,
        method: "POST",
        headers: headers,
        body: dataString
    };

    callback = (error, response, body) =>{
        if (!error && response.statusCode==200){
            const data = JSON.parse(body);
            res.send(data);
        }
    };

    request(options,callback);
})

//list the latest transactions
router.get("/listtransactions", (req, res)=>{
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"listtransactions","params":[]}`;
    var options = {
        url: `http:${USER}:${PASS}@178.128.164.154:8332`,
        method: "POST",
        headers: headers,
        body: dataString
    };

    callback = (error, response, body) =>{
        if (!error && response.statusCode==200){
            const data = JSON.parse(body);
            res.send(data);
        }
    };

    request(options,callback);
})

//get information about a rawtransaction from the transaction id
router.get("/getrawtransaction/:txid", (req, res)=>{
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getrawtransaction","params":["${
        req.params.txid
    }"]}`;
    var options = {
        url: `http:${USER}:${PASS}@178.128.164.154:8332`,
        method: "POST",
        headers: headers,
        body: dataString
    };

    callback = (error, response, body) =>{
        if (!error && response.statusCode==200){
            const data = JSON.parse(body);
            res.send(data);
        }
    };

    request(options,callback);
})

module.exports = router;
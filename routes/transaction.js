const express = require("express");
const router = express.Router();

const transactionController = require('../controller/transaction');

router.get("/getrawtransaction/:txid", transactionController.getrawtransaction);
router.get("/listtransactions", transactionController.listtransactions);
router.get('/transactions', transactionController.gettransactions);
router.get('/transaction', transactionController.gettransaction);
router.get('/address', transactionController.getaddress);

module.exports = router;
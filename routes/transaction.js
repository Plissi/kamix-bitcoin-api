const express = require("express");
const router = express.Router();

const transactionController = require('../controller/transaction');

/**
 * @api {get} /getrawtransaction/:txid Récupère une transaction dans la blockchain
 * @apiParam {String} txid id de la transaction
 * @apiHeader {String} content-type json
 * @apiSuccess {json} transaction La transaction
 * @apiGroup Transaction
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *      {
 * 
 *      }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     "error": 
 * }
 *
 */
router.get("/getrawtransaction/:txid", transactionController.getrawtransaction);

router.get("/listtransactions", transactionController.listtransactions);

/**
 * @api {get} /transactions Récupère les transactions de la BD
 * @apiHeader {String} content-type json
 * @apiSuccess {json} transactions Les transactions
 * @apiGroup Transaction
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *      {
 * 
 *      }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     "error": 
 * }
 *
 */
router.get('/transactions', transactionController.gettransactions);

/**
 * @api {get} /transaction/?search=txid Récupère une transaction dans la BD
 * @apiParam {String} txid id de la transaction
 * @apiHeader {String} content-type json
 * @apiSuccess {json} transaction La transaction
 * @apiGroup Transaction
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *      {
 * 
 *      }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     "error": 
 * }
 *
 */
router.get('/transaction', transactionController.gettransaction);
/**
 * @api {get} /address Récupère l'adresse
 * @apiHeader {String} content-type json
 * @apiSuccess {json} address Informations sur l'adresse
 * @apiGroup Transaction
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *      {
 *        "outs": [
 *            {
 *            "coinbase": false,
 *            "_id": "606ae58920fec9303f15549a",
 *            "txid": "7e9ff077d9dae093ad8d262c8f018b38f7e5552cebda51b8821c281ad4aa2ca4",
 *            "address": "3EWJ288qvRQp4P4frPKrbDken8xsx4yojs",
 *            "n": 62,
 *            "value": 0.00135,
 *            "blockhash": "00000000000000000007c3f0ab05678aebaff054aee12ad06b66dc66ddc1de99",
 *            "blocktime": 1615596919,
 *            "__v": 0
 *            },
 *            {
 *            "coinbase": false,
 *            "_id": "606ae58920fec9303f155499",
 *            "txid": "7e9ff077d9dae093ad8d262c8f018b38f7e5552cebda51b8821c281ad4aa2ca4",
 *            "address": "3GZCpk8aXMPKAotRudZKJ8c3E46KZZX6vP",
 *            "n": 1,
 *            "value": 0.00126023,
 *            "blockhash": "00000000000000000007c3f0ab05678aebaff054aee12ad06b66dc66ddc1de99",
 *            "blocktime": 1615596919,
 *            "__v": 0
 *            }
 *        ],
 *        "ins": [
 *            {
 *            "_id": "606ae58920fec9303f1550b1",
 *            "txid": "7e9ff077d9dae093ad8d262c8f018b38f7e5552cebda51b8821c281ad4aa2ca4",
 *            "address": "181ZxHhaZe4xAqCCJPZsrhj8FDfgifSWau",
 *            "n": 0,
 *            "value": 0.00193703,
 *            "blockhash": "00000000000000000007c3f0ab05678aebaff054aee12ad06b66dc66ddc1de99",
 *            "blocktime": 1615596919,
 *            "__v": 0
 *            }
 *        ],
 *        "fee": 0.0006731999999999999,
 *        "received": 0.00193703
 *      }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     "error": 
 * }
 *
 */
router.get('/address', transactionController.getaddress);
/**
 * @api {get} /addressinfos Récupère des informations sur une adresse
 * @apiHeader {String} content-type json
 * @apiSuccess {json} addressinfos Informations sur l'adresse
 * @apiGroup Transaction
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *      [
 *        {
 *        "date": 1617137974000,
 *        "txid": "90ed2022f70c65ebe370ac94324b198d3945232b2da2d3396c797db1e5ebc52b",
 *        "sens": "withdrawal",
 *        "crypto": "btc",
 *        "debit": 0,
 *        "credit": 0.00193703,
 *        "cotation": 48973.897419841785,
 *        "debit_euro": 0,
 *        "credit_euro": 94.86390851915613,
 *        "fee": 0.045760379999999046,
 *        "received": 1.0001515
 *        },
 *        {
 *        "date": 1615596919000,
 *        "txid": "7e9ff077d9dae093ad8d262c8f018b38f7e5552cebda51b8821c281ad4aa2ca4",
 *        "sens": "deposit",
 *        "crypto": "btc",
 *        "debit": 0.00193703,
 *        "credit": 0,
 *        "cotation": 47981.15078408417,
 *        "debit_euro": 92.94092850329456,
 *        "credit_euro": 0,
 *        "fee": 0.0006731999999999999,
 *        "received": 0.00193703
 *        }
 *      ]
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     "error": 
 * }
 *
 */
router.get('/addressinfos', transactionController.getaddressinfos);

module.exports = router;
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
 * 
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
router.get('/addressinfos', transactionController.getaddressinfos);

module.exports = router;
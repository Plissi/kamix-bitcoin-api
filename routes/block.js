const express = require("express");
const router = express.Router();

const blockController = require('../controller/block')

/**
 * @api {get} /getblockhash/:height Récupère le hash d'un bloc
 * @apiParam {String} height Hauteur du bloc
 * @apiHeader {String} content-type json
 * @apiSuccess {json} hash Hash du bloc
 * @apiGroup Block
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "hash": "000000000000000000061b3a2e992fc13f689c2f32347ab47fcf4261ca9c3467"
 *    }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *     "message": "Le bloc n'existe pas"
 * }
 *
 */
router.get("/getblockhash/:height", blockController.getblockhash);

/**
 * @api {get} /getblock/:hash Récupère un bloc
 * @apiParam {String} hash Hash du bloc
 * @apiHeader {String} content-type json
 * @apiSuccess {json} block Bloc récupéré 
 * @apiGroup Block
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *       {
 *           "hash": "00000000000000000007c3f0ab05678aebaff054aee12ad06b66dc66ddc1de99",
 *           "confirmations": 3992,
 *           "strippedsize": 679948,
 *           "size": 1952945,
 *           "weight": 3992789,
 *           "height": 674360,
 *           "version": 541065216,
 *           "versionHex": "20400000",
 *           "merkleroot": "9a829b13b66bc4fa16c6ca680416b18c52bf637d1a0dff8cc46d8ac1f10ac7dc",
 *           "tx": [],
 *           "time": 1615596919,
 *           "mediantime": 1615594764,
 *           "nonce": 2011716836,
 *           "bits": "170d1f8c",
 *           "difficulty": 21448277761059.71,
 *           "chainwork": "00000000000000000000000000000000000000001a8e61971df50fb6d4be831d",
 *           "nTx": 904,
 *           "previousblockhash": "0000000000000000000cc5c640094603341f971ec482264161ac5631cee2f55b",
 *           "nextblockhash": "00000000000000000003f00726b70afa52cd585c9a857f83c0a382f1f04d3274"
 *       }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *     "message": "Le bloc n'existe pas"
 * }
 *
 */
router.get("/getblock/:hash", blockController.getblock);

/**
 * @api {get} /getblockcount Récupéré la hauteur du block le plus récent
 * @apiHeader {String} content-type json
 * @apiSuccess {json} blockcount Transactions entrantes et sortantes
 * @apiGroup Block Hauteur du dernier block
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {
 *      "blockcount": 678351
 *    }
 *
 */
router.get("/getblockcount", blockController.getblockcount);

/**
 * @api {get} /getbitcoininfos Récupère des informations sur la progression du recensement
 * @apiHeader {String} content-type json
 * @apiSuccess {json} bitcoininfos Informations sur la progression du recensement
 * @apiGroup Map
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *      {
 *          "processed": 5935,
 *          "total": 678351,
 *          "percentage": 1
 *      }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     "error": 
 * }
 *
 */
router.get("/getbitcoininfos", blockController.getbitcoininfos);

module.exports = router;
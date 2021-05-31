const express = require("express");
const router = express.Router();
const { body } = require('express-validator');

const addressController = require('../controller/address')

/**
 * @api {post} /addr/add Ajoute une adresse pour un utilisateur
 * @apiParam {String} address adresse
 * @apiParam {String} name nom de l'adresse
 * @apiParam {String} description description de l'adresse
 * @apiParam {String} type type de l'adresse
 * @apiHeader {String} x-access-token Le token de l'utilisateur
 * @apiGroup Adresse
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *{
 *  "_id": "60b3d103d6632319c56d3538",
 *  "addr": "XXX",
 *  "name": "myaddress",
 *  "description": "description",
 *  "type": "Client",
 *  "user": "60ade0462f9350a490dd5a0e",
 *  "__v": 0
 *}
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     null
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 *{
 *  "auth": false,
 *  "message": "Failed to authenticate token."
 *}
 *
 */
router.post('/add',
    [
        body('address').exists(),
        body('name').exists(),
        body('description').exists(),
        body('type').exists()
    ],
    addressController.addAddr);

/**
 * @api {get} /addr/get/:id Récupère une adresse d'un utilisateur
 * @apiParam {String} id adresse ou nom d'adresse à chercher
 * @apiHeader {String} x-access-token Le token de l'utilisateur
 * @apiSuccess {json} L'adresse
 * @apiGroup Adresse
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *{
 *  "_id": "60b3d103d6632319c56d3538",
 *  "addr": "XXX",
 *  "name": "myaddress",
 *  "description": "description",
 *  "type": "Client",
 *  "user": "60ade0462f9350a490dd5a0e",
 *  "__v": 0
 *}
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     null
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 *{
 *  "auth": false,
 *  "message": "Failed to authenticate token."
 *}
 *
 */
router.get('/get/:id',
    addressController.getAddr);

/**
 * @api {get} /addr/get Récupère toutes les adresses d'un utilisateur
 * @apiHeader {String} x-access-token Le token de l'utilisateur
 * @apiGroup Adresse
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *[
 *{
 *        "_id": "60b3d103d6632319c56d3538",
 *        "addr": "XXX",
 *        "name": "myaddress",
 *        "description": "description",
 *        "type": "Client",
 *        "user": "60ade0462f9350a490dd5a0e",
 *        "__v": 0
 *    },
 *{
 *        "_id": "60b3d14f3a28682b35118d5d",
 *        "addr": "XXI",
 *        "name": "myothaddress",
 *        "description": "description",
 *        "type": "Client",
 *        "user": "60ade0462f9350a490dd5a0e",
 *        "__v": 0
 *    }
 *]
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     null
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 *{
 *  "auth": false,
 *  "message": "Failed to authenticate token."
 *}
 *
 */
router.get('/get',
    addressController.getAllAddr);

/**
 * @api {post} /addr/update/:id Modifie une adresse d'un utilisateur
 * @apiParam {String} address adresse
 * @apiParam {String} name nom de l'adresse
 * @apiParam {String} description description de l'adresse
 * @apiParam {String} type type de l'adresse
 * @apiHeader {String} x-access-token Le token de l'utilisateur
 * @apiGroup Adresse
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *{
 *  "_id": "60b3d103d6632319c56d3538",
 *  "addr": "XXX",
 *  "name": "myaddress",
 *  "description": "description",
 *  "type": "Client",
 *  "user": "60ade0462f9350a490dd5a0e",
 *  "__v": 0
 *}
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     null
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 *{
 *  "auth": false,
 *  "message": "Failed to authenticate token."
 *}
 *
 */
router.post('/update/:id',addressController.updateAddr);

/**
 * @api {delete} /addr/delete/:id Supprime une adresse d'un utilisateur
 * @apiParam {String} id adresse ou nom d'adresse à chercher
 * @apiHeader {String} x-access-token Le token de l'utilisateur
 * @apiGroup Adresse
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *{
 *  "_id": "60b3d103d6632319c56d3538",
 *  "addr": "XXX",
 *  "name": "myaddress",
 *  "description": "description",
 *  "type": "Client",
 *  "user": "60ade0462f9350a490dd5a0e",
 *  "__v": 0
 *}
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     null
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 *{
 *  "auth": false,
 *  "message": "Failed to authenticate token."
 *}
 *
 */
router.delete('/delete/:id',addressController.deleteAddr);

module.exports = router;

const express = require("express");
const router = express.Router();

const userController = require('../controller/user')

router.post('/register', userController.register);
router.post('/login', userController.login);
/**
 * @api {post} /password Modifie le mot de passe d'un utilisateur
 * @apiParam {String} old_password Ancien mot de passe
 * @apiParam {String} new_password Nouveau mot de passe
 * @apiHeader {String} x-access-token Le token de l'utilisateur
 * @apiGroup User
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *{
 *  message: "success",
 *  user: user
 *}
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Not Found
 * {
 *     {err: err}
 * }
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 Not Found
 *{
 *  "auth": false,
 *  "message": "Failed to authenticate token."
 *}
 *
 */
router.post('/password', userController.changePass)
router.post('/change', userController.update)

module.exports = router;

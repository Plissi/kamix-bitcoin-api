const express = require("express");
const router = express.Router();

const blockController = require('../controller/block')

router.get("/getblockhash/:height", blockController.getblockhash);
router.get("/getblock/:hash", blockController.getblock);
router.get("/getblockcount", blockController.getblockcount);

module.exports = router;
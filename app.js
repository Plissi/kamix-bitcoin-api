
const express = require("express");
const bodyParser = require("body-parser");
const rpcMethods = require("./routes/api");
var helmet = require("helmet")

const app = express();

app.use(helmet())

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use("/api", rpcMethods);

module.exports = app
/*const express = require("express");
const bodyParser = require("body-parser");
const rpcMethods = require("./routes/api");
var helmet = require("helmet")

const app = express();

app.use(helmet())

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use("/api", rpcMethods);

module.exports = app*/

 /*
  * NEW
  */
const express = require('express');
const mongoose = require('mongoose');
var helmet = require("helmet");
const rpcMethods = require("./routes/api");
const tx = require('./routes/transaction');
const block = require('./routes/block')
const app = express();
require("dotenv").config();

// Connection URL
const uri = process.env.DB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((err) => console.log('Connexion à MongoDB échouée !', err));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(helmet())

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use("/api", [rpcMethods, tx, block]);

module.exports = app;

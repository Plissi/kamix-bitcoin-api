const mongoose = require('mongoose');

const Schema = mongoose.Schema

TransactionSchema = new Schema({
    id: false,
    txid: {type: String},        //transactions id
    address :{type: String},    //origin address
    n: {type: Number},          //input number
    value: {type: Number} ,      //incoming value
    blockhash :{type: String}      //blockhash  
}, {
    collection: 'outs'
})

module.exports = mongoose.model("TransactionOut", TransactionSchema)
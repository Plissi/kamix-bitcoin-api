const mongoose = require('mongoose');

const Schema = mongoose.Schema

let TransactionSchema = new Schema({
    _id: {type: String},       //transactions id
    time :{type: Number},  //blocktime  
}, {
    collection: 'txs'
})

module.exports = mongoose.model("Transaction", TransactionSchema)
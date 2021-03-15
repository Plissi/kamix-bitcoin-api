const mongoose = require('mongoose');

const Schema = mongoose.Schema

let TransactionSchema = new Schema({
    id: false,
    txid: {type: String},       //transactions id
    address :{type: String},    //origin address
    script :{type: String},     //coinbase script
    n: {type: Number},          //input number
    value: {type: Number} ,     //incoming value
    blockhash :{type: String},  //blockhash  
    coinbase:{
        type: Boolean,
        default: false
    }
}, {
    collection: 'txout'
})

module.exports = mongoose.model("TransactionOut", TransactionSchema)
const mongoose = require('mongoose');

const Schema = mongoose.Schema

let TransactionSchema = new Schema({
    id: false,
    txid: {type: String},        //transactions id
    address :{type: String},    //destination address
    n: {type: Number},          //output number
    value: {type: Number} ,      //outgoing value,        
    blockhash :{type: String}      //blockhash
}, {
    collection: 'txin'
})

module.exports = mongoose.model("TransactionIn", TransactionSchema)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AddressSchema = new Schema({
    addr: {type: String},
    name: {type: String},
    description: {type: String},
    type: {type: String, enum: ['Supplier', 'Client', 'Internal']}
}, {
    collection: 'addresses'
})

module.exports = mongoose.model('AddressSchema', AddressSchema)

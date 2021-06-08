const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let AddressSchema = new Schema({
    addr: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['supplier', 'customer', 'internal'],
        required: true
    },
    user: {type: mongoose.Types.ObjectId}
}, {
    collection: 'addresses'
})

module.exports = mongoose.model('AddressSchema', AddressSchema)

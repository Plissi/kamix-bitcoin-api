const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    firstname: {type: String},
    name: {type: String},
    username: {type: String},
    email: {type: String},
    password: {type: String},
    token: {type: String}
}, {
    collection: 'users'
})

module.exports = mongoose.model('User', UserSchema);

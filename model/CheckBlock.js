const mongoose = require('mongoose');

const Schema = mongoose.Schema
//0 = Block height, 1 = Etat Traitement, 2 = Commentaires, 3 = Debut, 4 = Fin, 5 = Etat Erreur
let CheckSchema = new Schema({
    id: false,
    height: {type: String},         //Block height
    et :{type: Number},             //Etat Traitement
    comment: {type: String},        //Commentaire
    start: {type: String} ,         //Debut,
    end: {type: String} ,           //Fin,          
    ee :{type: Number}              //Etat Erreur
}, {
    collection: 'check'
})

module.exports = mongoose.model("CheckSchema", CheckSchema)
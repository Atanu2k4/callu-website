const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 
const s = new Schema({ roomType: {type: String}, visibility: {type: String} }); 
const M = mongoose.model('M2', s); 
console.log(M.find({ $nor: [{ roomType: 'private', visibility: 'hidden' }] }).getQuery());

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
    email: String,
    imageName: String
});

module.exports = mongoose.model('image', imageSchema);

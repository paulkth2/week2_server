var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    image: String,
    name: String,
    job: String,
    birthDate: String,
    country: String,
    phoneNumber: String,
    email: String,
    gender: String,
    bloodGroup: String,
    education: String,
    loginEmail: String
});

module.exports = mongoose.model('user', userSchema);

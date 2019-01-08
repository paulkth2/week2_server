var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var loginSchema = new Schema({
  email : String,
  password: String,
  salt : String,
  name : String

});

module.exports = mongoose.model('login', loginSchema);

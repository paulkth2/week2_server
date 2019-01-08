var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tripSchema = new Schema({
  country : String,
  city : String,
  title : String,
  contents : String,
  comments : String,
  loginEmail : String
});

module.exports = mongoose.model('trip', tripSchema);

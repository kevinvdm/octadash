var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LightSchema   = new Schema({
    lightamount: String
});

module.exports = mongoose.model('Light', LightSchema);

var mongoose = require('mongoose');
 
module.exports = mongoose.model('User',{
    firstName: String,
    email: String,
    username: String,
    password: String,
    deviceid: String
});
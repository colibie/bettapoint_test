let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
  email: String,
  phoneNo: Number,
  balance: Number,
  PIN: String,
})

module.exports = mongoose.model('User', userSchema);
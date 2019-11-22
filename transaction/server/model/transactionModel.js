let mongoose = require('mongoose');

let transactionSchema = mongoose.Schema({
  otpID: String,
  status: String,
  statusDescription: String,
  amount: Number,
  expiry: Date,
  date: Date,
  senderEmail: {type: mongoose.Schema.Types.String, ref: 'User'},
  receiverEmail: {type: mongoose.Schema.Types.String, ref: 'User'},
})

module.exports = mongoose.model('Transaction', transactionSchema);
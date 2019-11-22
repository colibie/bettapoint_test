const userModel = require('../model/userModel');

const user = {
  addUser(req, res){
      let data = {
        email: req.body.email,
        phoneNo: req.body.phoneNo,
        PIN: req.body.PIN,
        balance: req.body.balance,
      }
      userModel.create(data, function(err, result){
        if (err) return res.status(409).json({err, message: 'Some error occured'})
      })
    return res.status(200).json({message: 'user successful'})
  },
  listUsers(req, res){
    userModel.find({}, (err, result) => {
      if(err) return res.status(500).json({err, message: 'error occured'});
      return res.json(result)
    })
  },
  getByEmail(req, res){
    userModel.find({email: req.params.email}, (err, result) => {
      if(err) return res.status(500).json({err, message: 'data could not be fetched'});
      return res.json(result)
    })
  },
  update(req, res){
    userModel.findOneAndUpdate({email: req.params.email}, req.body, (err, result) => {
      if(err) return res.status(500).json({err, message: 'data could not be updated'});
      return {result:res.json(result), message: 'User updated successfully'}
    })
  }
}

module.exports = user;
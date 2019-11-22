const transactionModel = require('../model/transactionModel'),
 axios = require('axios'),
 { messageBirdKEY } = require('../config'),
 messageBird = require('messagebird')(messageBirdKEY);


const transaction = {
  async startTransaction(req, res){
    let data = {
      senderEmail: req.body.senderEmail,
      receiverEmail: req.body.receiverEmail,
      amount: req.body.amount,
      PIN: req.body.PIN,
    }
    //fetch sender and check amount and PIN
    const senderURL = `http://localhost:3000/user/${req.body.senderEmail}`
    const receiverURL = `http://localhost:3000/user/${req.body.receiverEmail}`
    let senderDetails = await axios.default.get(senderURL);
    let receiverDetails = await axios.default.get(receiverURL)
    if (senderDetails.data[0].PIN === data.PIN){    
      if (senderDetails.data[0].balance >= data.amount){
        // send OTP
        messageBird.verify.create(senderDetails.data[0].phoneNo, {
          template: "Your verification code is %token. This code expires in 5 minutes",
          timeout: 5*60
        }, function(err, response){
          if (err) res.status(500).json({err})
          else {
            // create transaction log - pending
            let log = {
              otpID: response.id,
              senderEmail: senderDetails.data[0].email,
              receiverEmail: receiverDetails.data[0].email,
              amount: data.amount,
              date: response.createdDatetime,
              expiry: response.validUntilDatetime,
              status: 'pending',
              statusDescription: 'Waiting for OTP'
            }
            transactionModel.create(log, function(err, result){
              if (err) return res.status(409).json({err, message: 'Some error occured'});
              return res.status(200).json({result, message: 'Transaction pending'})
            })
          }
        })  
      }else {
        let log = {
          senderEmail: senderDetails.data[0].email,
          receiverEmail: receiverDetails.data[0].email,
          amount: data.amount,
          date: new Date(),
          status: 'NOT successful',
          statusDescription: 'Insufficient funds'
        }
        transactionModel.create(log, function(err, result){
          if (err) return res.status(409).json({err, message: 'Some error occured'});
          return res.status(500).json({result, message: 'Insufficeint funds'})
        })
      }
    }else {
      let log = {
        senderEmail: senderDetails.data[0].email,
        receiverEmail: receiverDetails.data[0].email,
        amount: data.amount,
        date: new Date(),
        status: 'NOT successful',
        statusDescription: 'Unauthorised'
      }
      transactionModel.create(log, function(err, result){
        if (err) return res.status(409).json({err, message: 'Some error occured'});
        return res.status(401).json({result, message: 'PIN incorrect'})
      })
    }
  },
  listTransaction(req, res){
    transactionModel.find({}, (err, result) => {
      if(err) return res.status(500).json({err, message: 'error occured'});
      return res.json(result)
    })
  },
  endTransaction(req, res) {
    let data = {
      id: req.body.otpID,
      token: req.body.token,
      senderEmail: req.body.senderEmail,
      receiverEmail: req.body.receiverEmail,
      amount: req.body.amount
    }
    //verify token
    messageBird.verify.verify(data.id, data.token, async (error, response) => {
      if (error) {
        let log = {
          status: 'NOT successful',
          statusDescription: error
        }
        // update transaction log
        transactionModel.findOneAndUpdate({otpID: data.id},log, function(err, result){
          if (err) return res.status(409).json({err, message: 'Some error occured'});
          return res.status(500).json({message: 'Transaction not successful', error})
        })
      }else {
        //fetch user details and deduct and add money respectively
        let senderURL = `http://localhost:3000/user/${req.body.senderEmail}`;
        let receiverURL = `http://localhost:3000/user/${req.body.receiverEmail}`;
        let senderDetails = await axios.default.get(senderURL);
        let receiverDetails = await axios.default.get(receiverURL)

        //remove the money from sender's account
        
        const senderUpdatedBalance   = {
          balance: senderDetails.data[0].balance - data.amount
        }
        const senderUpdateURL = `http://localhost:3000/user/update/${senderDetails.data[0].email}`
        const updateSender = await axios.default.put(senderUpdateURL, senderUpdatedBalance);
        if (updateSender){
          // add the money to receivers account
          const receiverUpdatedBalance   = {
            balance: receiverDetails.data[0].balance + data.amount
          }

          const receiverUpdateURL = `http://localhost:3000/user/update/${receiverDetails.data[0].email}`
          const updateReceiver = await axios.default.put(receiverUpdateURL, receiverUpdatedBalance);
          if (updateReceiver){
            // update transaction log
            let log = {
              status: 'successful',
              statusDescription: 'OTP confirmed'
            }
            transactionModel.findOneAndUpdate({otpID: data.id},{status: 'successful'}, function(err, result){
              if (err) return res.status(409).json({err, message: 'Some error occured'});
              return res.status(200).json({result, message: 'Transaction successful'})
            })
          }else {
            //roll back money to sender's account
            const senderRollbackBalance   = {
              balance: senderDetails.data[0].balance
            }
            const rollbackSender = await axios.default.put(senderUpdateURL, senderRollbackBalance);
            if (rollbackSender){
              let log = {
                status: 'NOT successful',
                statusDescription: 'Money not sent to receiver, rolled back'
              }
              // update transaction log
              transactionModel.findOneAndUpdate({otpID: data.id},log, function(err, result){
                if (err) return res.status(409).json({err, message: 'Some error occured'});
                return res.status(200).json({result, message: 'Transaction not successful'})
              })
            }else {
              let log = {
                status: 'NOT successful',
                statusDescription: 'Money not sent to receiver, NOT rolled back'
              }
              // update transaction log
              transactionModel.findOneAndUpdate({otpID: data.id},log, function(err, result){
                if (err) return res.status(409).json({err, message: 'Some error occured'});
                return res.status(200).json({result, message: 'Transaction successful'})
              })
            }
            
          }
        }else {
          let log = {
            status: "NOT successful",
            statusDescription: "Money not sent"
          }
          // update transaction log
          transactionModel.findOneAndUpdate({otpID: data.id},log, function(err, result){
            if (err) return res.status(409).json({err, message: 'Some error occured'});
            return res.status(500).json({result, message: 'Transaction not successful'})
          })
        }
      }
    })
  }
}

module.exports = transaction;
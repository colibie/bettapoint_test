const express = require('express'),
router = express.Router(),
transactionController = require('../controller/transactionController')

 router.get('/', transactionController.listTransaction);
 router.post('/start', transactionController.startTransaction);
 router.post('/end', transactionController.endTransaction);
// router.get('/:id', employeeController.getById);

module.exports = router;
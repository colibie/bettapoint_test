const express = require('express'),
router = express.Router(),
userController = require('../controller/userController')

 router.get('/', userController.listUsers);
 router.post('/add', userController.addUser);
router.get('/:email', userController.getByEmail);
router.put('/update/:email', userController.update);

module.exports = router;
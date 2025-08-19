const express = require('express');
const router = express.Router();
const modelController = require('../../controller/modelControl/modelController');

router.post('/', modelController.uploadImg);

module.exports = router;
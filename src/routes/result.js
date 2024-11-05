const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result');
const authController = require('../controllers/authController');

router.use(authController.protect);
router.post('/', resultController.createResult);

module.exports = router;

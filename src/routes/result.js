const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result');

router.post('/', resultController.createResult);
router.get('/:id', resultController.getResultById);

module.exports = router;

const express = require('express');
const historyController = require('../controllers/history');
const router = express.Router();

router.post('/', historyController.createHistory);
router.get('/', historyController.getAllHistory);
router.get('/:id', historyController.getHistoryById);
router.put('/:id', historyController.updateHistory);
router.delete('/:id', historyController.deleteHistory);

module.exports = router;

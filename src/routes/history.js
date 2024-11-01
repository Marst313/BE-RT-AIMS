const express = require('express');
const historyController = require('../controllers/history');
const router = express.Router();

router
  .route('/') //
  .post(historyController.createHistory)
  .get(historyController.getAllHistory);

router
  .route('/:id') //
  .get(historyController.getHistoryById)
  .put(historyController.updateHistory)
  .delete(historyController.deleteHistory);

module.exports = router;

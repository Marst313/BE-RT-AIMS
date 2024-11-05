const express = require('express');
const historyController = require('../controllers/history');
const authController = require('../controllers/authController');
const router = express.Router();

router.use(authController.protect);

router
  .route('/') //
  .post(historyController.createHistory)
  .get(authController.restrictTo('admin'), historyController.getAllHistory);

router.get('/my-history', historyController.getMyHistory);

router
  .route('/:id') //
  .get(historyController.getHistoryById)
  .put(historyController.updateHistory)
  .delete(historyController.deleteHistory);

module.exports = router;

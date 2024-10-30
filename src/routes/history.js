const express = require("express");
const historyController = require("../controllers/history");
const router = express.Router();

router.post("/addhistory", historyController.createHistory);
router.get("/history", historyController.getAllHistory);
router.get("/history/:id", historyController.getHistoryById);
router.put("/history/:id", historyController.updateHistory);
router.delete("/history/:id", historyController.deleteHistory);

module.exports = router;

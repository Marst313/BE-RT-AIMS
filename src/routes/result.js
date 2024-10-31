const express = require("express");
const router = express.Router();
const resultController = require("../controllers/result");

router.post("/result", resultController.createResult);
router.get("/result/:id", resultController.getResultById);

module.exports = router;

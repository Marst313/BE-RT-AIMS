const router = require("express").Router();
const userRoutes = require("./users");
const audioRoutes = require("./audio");
const historyRoutes = require("./history");
const resultRoutes = require("./result");

router.use("/api/v1/users", userRoutes);
router.use("/api/v1/audio", audioRoutes);
router.use("/api/v1/history", historyRoutes);
router.use("/api/v1/results", resultRoutes);

module.exports = router;

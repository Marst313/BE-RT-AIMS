const router = require("express").Router();
const userRoutes = require("./users");
const historyRoutes = require("./history");
const resultRoutes = require("./result");

router.use("/api/v1/user", userRoutes);
router.use("/api/v1/history", historyRoutes);
router.use("/api/v1/result", resultRoutes);

module.exports = router;

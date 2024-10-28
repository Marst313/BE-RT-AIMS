const router = require("express").Router();
const userRoutes = require("./users");
const audioRoutes = require("./audio");

router.use("/api/v1/users", userRoutes);
router.use("/api/v1/audio", audioRoutes);

module.exports = router;

const router = require("express").Router();
const { SignUp, SignIn, logout } = require("../controllers/users");

router.post("/sign-up", SignUp);
router.post("/sign-in", SignIn);
router.post("/logout", logout); // Tambahkan ini

module.exports = router;

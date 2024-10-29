const router = require("express").Router();
const { SignUp, SignIn, logout } = require("../controllers/users");
const {
  validateMiddleware,
  loginSchema,
} = require("../middleware/authMiddleware");

router.post("/sign-up", SignUp);
router.post("/sign-in", validateMiddleware(loginSchema), SignIn);
router.post("/logout", logout); // Tambahkan ini

module.exports = router;

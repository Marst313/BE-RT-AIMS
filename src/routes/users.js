const router = require("express").Router();

const authController = require("../controllers/authController");
const userController = require("../controllers/users");

// Google Auth routes
router.get("/google", authController.googleSignIn); // Start Google login
router.get("/google/callback", authController.googleCallback); // Google callback

router.post("/sign-up", authController.SignUp);
router.post("/sign-in", authController.SignIn);

router.post("/refresh-token", authController.RefreshToken);

router.use(authController.protect);

router.get("/", authController.restrictTo("admin"), userController.getAllUser);
router.patch("/update-profile", userController.updateMyProfile);
router.patch("/update-user", userController.updateUserProfile);
router.delete("/sign-out", authController.SignOut);
router.delete(
  "/:id",
  authController.restrictTo("admin"),
  userController.deleteUsers
);

module.exports = router;

const router = require('express').Router();
const { SignUp, SignIn, SignOut, RefreshToken } = require('../controllers/authController');
const authController = require('../controllers/authController');

router.post('/sign-up', SignUp);
router.post('/sign-in', SignIn);

router.post('/refresh-token', RefreshToken);

router.use(authController.protect);
router.delete('/sign-out', SignOut);

module.exports = router;

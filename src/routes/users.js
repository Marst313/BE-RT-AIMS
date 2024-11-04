const router = require('express').Router();
const { SignUp, SignIn, SignOut, RefreshToken } = require('../controllers/authController');

router.post('/sign-up', SignUp);
router.post('/sign-in', SignIn);

router.delete('/sign-out', SignOut);
router.post('/refresh-token', RefreshToken);

module.exports = router;

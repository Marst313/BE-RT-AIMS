const router = require('express').Router();
const { SignUp, SignIn, SignOut, RefreshToken } = require('../controllers/users');
const { validateMiddleware, loginSchema } = require('../middleware/authMiddleware');

router.post('/sign-up', SignUp);
router.post('/sign-in', validateMiddleware(loginSchema), SignIn);
router.post('/refresh-token', RefreshToken);
router.delete('/sign-out', SignOut);

module.exports = router;

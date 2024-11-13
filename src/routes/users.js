const router = require('express').Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/users');

router.post('/sign-up', authController.SignUp);
router.post('/sign-in', authController.SignIn);

router.post('/refresh-token', authController.RefreshToken);

router.use(authController.protect);

router.get('/', authController.restrictTo('admin'), userController.getAllUser);
router.patch('/update-profile', userController.updateMyProfile);
router.patch('/update-user', userController.updateUserProfile);
router.delete('/sign-out', authController.SignOut);

module.exports = router;

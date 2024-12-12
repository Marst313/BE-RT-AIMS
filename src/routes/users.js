const router = require('express').Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/users');
const middleware = require('../middleware/middleware');

router.post('/forgetPassword', authController.ForgetPassword);
router.patch('/resetPassword/:token', authController.ResetPassword);

router.post('/sign-up', authController.SignUp);
router.post('/sign-in', authController.SignIn);
router.get('/google/userinfo', authController.SignInGoogle);
router.post('/refresh-token', authController.RefreshToken);

router.use(authController.protect);

router.get('/', authController.restrictTo('admin'), userController.getAllUser);

router.patch('/updateMyPassword', authController.updateMyPassword);
router.patch('/update-profile', middleware.uploadUserPhoto, middleware.UploadImage, userController.updateMyProfile);
router.patch('/update-user', authController.restrictTo('admin'), userController.updateUserProfile);

router.delete('/sign-out', authController.SignOut);
router.delete('/:id', authController.restrictTo('admin'), userController.deleteUsers);

module.exports = router;

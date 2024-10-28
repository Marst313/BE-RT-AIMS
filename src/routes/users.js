const router = require('express').Router();
const { SignUp } = require('../controllers/users');

router.post('/sign-up', SignUp);

module.exports = router;

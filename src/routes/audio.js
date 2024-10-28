const router = require('express').Router();
const { UploadFile } = require('../controllers/audio');

router.post('/upload-audio', UploadFile);

module.exports = router;
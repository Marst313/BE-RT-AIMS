const multer = require('multer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { supabase } = require('../utils/supabase');
const { decode } = require('base64-arraybuffer');

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images!', false));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerFilter,
});

const uploadUserPhoto = upload.single('photo');

const UploadImage = catchAsync(async function (req, res, next) {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.png`;

  const file = req.file;

  const fileBase64 = decode(file.buffer.toString('base64'));

  // ! UPLOAD IMAGE TO SUPABASE
  const { data, error } = await supabase.storage.from('images').upload(req.file.filename, fileBase64, { contentype: 'image/png' });

  if (error) next(new AppError(error, 403));

  //! GET PUBLIC URL FROM SUPABASE
  const { data: image } = supabase.storage.from('images').getPublicUrl(data.path);

  // ! SEND PUBLIC URL
  req.file.publicUrl = image.publicUrl;

  next();
});

module.exports = {
  uploadUserPhoto,
  UploadImage,
};

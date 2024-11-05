const Result = require('../models/result');
const User = require('../models/users');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const createResult = catchAsync(async function (req, res, next) {
  const { transcript, summary, title, fileName } = req.body;

  if (!transcript || !summary || !title || !fileName) {
    return next(new AppError('All fields cannot be empty', 403));
  }

  //! GET EMAIL FROM TOKEN
  const user = await User.getUserByEmail(req.user?.email);

  if (!user) {
    return next(new AppError('Email not found!', 401));
  }

  const data = await Result.createResult({
    id: req.user.id,
    transcript,
    summary,
    title,
    fileName,
  });

  res.status(201).json({
    message: 'Result created successfully',
    status: 'success',
    data,
  });
});

module.exports = {
  createResult,
};

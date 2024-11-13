const Users = require('../models/users');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const getAllUser = catchAsync(async function (req, res, next) {
  const data = await Users.getAllUser();

  console.log(data);

  res.status(200).json({
    message: 'Get all users',
    status: 'success',
    data,
  });
});

const updateMyProfile = catchAsync(async function (req, res, next) {
  const { email, username } = req.user;

  const newData = req.body;

  const updateResult = await Users.updateUserProfile(email, { username: newData.username || username, email: newData?.email || email });

  if (!updateResult.affectedRows) {
    return next(new AppError('Failed to update profile', 400));
  }

  res.status(200).json({
    message: 'Profile updated successfully',
    status: 'success',
    data: {
      email: newData.email,
      username: newData.username,
    },
  });
});

const updateUserProfile = catchAsync(async function (req, res, next) {
  const { email, role } = req.user;
  const newData = req.body;

  if (!newData.targetEmail) {
    return next(new AppError('Target email cant be empty.', 400));
  }

  const targetEmail = role.toLowerCase() === 'admin' ? newData.targetEmail : email;

  const targetUser = await Users.getUserByEmail(targetEmail);
  if (!targetUser) {
    return next(new AppError('User not found', 404));
  }

  const username = newData.username || targetUser.username;
  const newEmail = newData.newEmail || targetUser.email;

  const updateResult = await Users.updateUserProfile(targetEmail, { username, email: newEmail });

  if (!updateResult.affectedRows) {
    return next(new AppError('Failed update profile', 400));
  }

  res.status(200).json({
    message: 'Profile successfully updated',
    status: 'success',
    data: {
      lastEmail: email,
      email: newEmail,
      username,
    },
  });
});

module.exports = {
  updateMyProfile,
  updateUserProfile,
  getAllUser,
};

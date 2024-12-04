const Users = require("../models/users");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const getAllUser = catchAsync(async function (req, res, next) {
  const data = await Users.getAllUser();

  res.status(200).json({
    message: "Get all users",
    status: "success",
    data,
  });
});

const updateMyProfile = catchAsync(async function (req, res, next) {
  const { email, username } = req.user;

  const newData = req.body;

  const updateResult = await Users.updateUserProfile(email, {
    username: newData.username || username,
    email: newData?.email || email,
  });

  if (!updateResult.affectedRows) {
    return next(new AppError("Failed to update profile", 400));
  }

  res.status(200).json({
    message: "Profile updated successfully",
    status: "success",
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
    return next(new AppError("Target email cant be empty.", 400));
  }

  const targetEmail =
    role.toLowerCase() === "admin" ? newData.targetEmail : email;

  const targetUser = await Users.getUserByEmail(targetEmail);
  if (!targetUser) {
    return next(new AppError("User not found", 404));
  }

  const username = newData.username || targetUser.username;
  const newEmail = newData.newEmail || targetUser.email;

  const updateResult = await Users.updateUserProfile(targetEmail, {
    username,
    email: newEmail,
  });

  if (!updateResult.affectedRows) {
    return next(new AppError("Failed update profile", 400));
  }

  res.status(200).json({
    message: "Profile successfully updated",
    status: "success",
    data: {
      lastEmail: email,
      email: newEmail,
      username,
    },
  });
});

const deleteUsers = catchAsync(async function (req, res, next) {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("Please provide a history ID", 400));
  }

  const user = await Users.getUserByEmail(req.user.email);
  if (!user) {
    return next(new AppError("Invalid access token", 403));
  }

  const deleteResult = await Users.deleteUsers(id);
  if (deleteResult === 0) {
    return next(new AppError("Users not found", 404));
  }

  res.status(204).json({
    message: "success",
    data: null,
  });
});

module.exports = {
  updateMyProfile,
  updateUserProfile,
  getAllUser,
  deleteUsers,
};

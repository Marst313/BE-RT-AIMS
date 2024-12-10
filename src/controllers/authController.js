const Users = require('../models/users');
const { default: axios } = require('axios');

const catchAsync = require('../utils/catchAsync');
const { hashPassword, verifyPassword, createPasswordResetToken, createHashedToken } = require('../utils/bcrypt');
const AppError = require('../utils/appError');
const { verifyJWT, generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '396d6d46538570',
    pass: '8d61afa9b61ca6',
  },
});

const SignUp = catchAsync(async function (req, res, next) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('All fields are required', 400));
  }

  const hashedPassword = await hashPassword(password);

  await Users.createUser({ ...req.body, password: hashedPassword });

  return res.status(201).json({
    status: 'success',
    message: 'User created successfully',
  });
});

const SignIn = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  // ! INPUT VALIDATION
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }
  // ! FIND USERS
  const user = await Users.getUserByEmail(email);
  if (!user) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // ! VALIDATE PASSWORD
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // ! REMOVE PASSWORD
  user.password = undefined;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await Users.storeRefreshToken(user.id, refreshToken);

  const cookieOptions = {
    expires: new Date(Date.now() + 60 * 1000 * 60 * 24 * 7),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(200).json({
    message: 'Login successful',
    status: 'success',
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      accessToken,
      refreshToken,
    },
  });
});

const SignInGoogle = catchAsync(async function (req, res, next) {
  const { accessToken } = req.query;

  // ! VALIDATE INPUT
  if (!accessToken) {
    return next(new AppError('Access token is required', 400));
  }

  // ! REQUEST GOOGLE USER INFO
  const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const googleUser = response.data;

  // ! VALIDATE GOOGLE USER INFO
  if (!googleUser.email) {
    return next(new AppError('Google account email is required', 400));
  }

  // ! CHECK IF USER EXISTS
  const user = await Users.getUserByEmail(googleUser.email);

  if (!user) {
    // ! CREATE NEW USER IF NOT EXISTS
    user = await Users.createUser({
      email: googleUser.email,
      username: googleUser.name || googleUser.email.split('@')[0],
      role: 'user',
      password: null,
    });
  }

  // ! REMOVE PASSWORD
  user.password = undefined;

  // ! GENERATE TOKENS
  const newAccessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // ! STORE REFRESH TOKEN
  await Users.storeRefreshToken(user.id, refreshToken);

  // ! SET REFRESH TOKEN COOKIE
  const cookieOptions = {
    expires: new Date(Date.now() + 60 * 1000 * 60 * 24 * 7),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  // ! RESPONSE
  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      accessToken: newAccessToken,
      refreshToken,
    },
  });
});

const SignOut = catchAsync(async function (req, res, next) {
  const { id } = req.user;

  // Pastikan pengguna sudah login
  if (!id) {
    return next(new AppError('User ID is required to log out', 400));
  }

  await Users.removeRefreshToken(id);

  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 60 * 1000 * 15),
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  });

  res.clearCookie('refreshToken');

  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

const RefreshToken = catchAsync(async function (req, res, next) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }

  const decoded = verifyJWT(refreshToken);

  const user = await Users.getUserByEmail(decoded.email);

  if (!user || user.refresh_token !== refreshToken) {
    return next(new AppError('Invalid refresh token', 403));
  }

  const newAccessToken = generateAccessToken(user);

  const cookieOptions = {
    expires: new Date(Date.now() + 60 * 1000 * 60 * 24 * 7),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Access token refreshed successfully',
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      accessToken: newAccessToken,
      refreshToken,
    },
  });
});

const ForgetPassword = catchAsync(async function (req, res, next) {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  const user = await Users.getUserByEmail(email);

  if (!user) {
    return next(new AppError('Cannot send to that email', 404));
  }

  async function sendEmailResetToken(to, resetToken) {
    const resetURL = `${process.env.ORIGIN}/forgot-password/${resetToken}`;
    const info = await transporter.sendMail({
      from: '"Support Team" <karmadharmanalendra@gmail.com>',
      to,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetURL}`,
      html: `<p>You requested a password reset. Click <a href="${resetURL}">here</a> to reset your password.</p>`,
    });
  }

  // ! Generate reset token
  const resetToken = await createPasswordResetToken(user.id);

  // ! Send email
  await sendEmailResetToken(user.email, resetToken);

  res.status(200).json({
    status: 'success',
    message: 'Reset token sent to email!',
  });
});

const ResetPassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  // ! Validate inputs
  if (!password || !confirmPassword) {
    return next(new AppError('Please provide both password and confirm password', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  // ! Hash the token for validation
  const hashedToken = await createHashedToken(req.params.token);

  // ! Validate token and expiration
  const user = await Users.getUserByToken(hashedToken);

  if (!user) {
    return next(new AppError('Invalid or expired token', 400));
  }

  // ! Hash the new password
  const hashedPassword = await hashPassword(password);

  // ! Update the user's password and clear reset fields
  await Users.updatePassword(hashedPassword, user.id);

  res.status(200).json({
    status: 'success',
    message: 'Password successfully updated',
  });
});

const protect = catchAsync(async function (req, res, next) {
  let token;

  // ! 1. GET TOKEN AND CHECK IF THERE IS TOKEN
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.refreshToken) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Please log in to get access!', 401));
  }

  const decoded = verifyJWT(token);
  const currentUser = await Users.getUserByEmail(decoded.email);

  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist', 401));
  }

  // ! GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;

  // ! REMOVE PASSWORD
  req.user.password = undefined;

  next();
});

const restrictTo = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role.toLowerCase())) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

module.exports = {
  SignUp,
  SignIn,
  SignInGoogle,
  SignOut,
  RefreshToken,
  ForgetPassword,
  ResetPassword,
  protect,
  restrictTo,
};

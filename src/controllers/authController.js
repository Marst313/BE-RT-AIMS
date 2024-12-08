const Users = require("../models/users");
const passport = require("passport");

const catchAsync = require("../utils/catchAsync");
const { hashPassword, verifyPassword } = require("../utils/bcrypt");
const AppError = require("../utils/appError");
const {
  verifyJWT,
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt");

const SignUp = catchAsync(async function (req, res, next) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const hashedPassword = await hashPassword(password);

  await Users.createUser({ ...req.body, password: hashedPassword });

  return res.status(201).json({
    status: "success",
    message: "User created successfully",
  });
});

const SignIn = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  // ! INPUT VALIDATION
  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }
  // ! FIND USERS
  const user = await Users.getUserByEmail(email);
  if (!user) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  // ! VALIDATE PASSWORD
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  // ! REMOVE PASSWORD
  user.password = undefined;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await Users.storeRefreshToken(user.id, refreshToken);

  const cookieOptions = {
    expires: new Date(Date.now() + 60 * 1000 * 60 * 24 * 7),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false, // false for local development
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.status(200).json({
    message: "Login successful",
    status: "success",
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

const SignOut = catchAsync(async function (req, res, next) {
  const { id } = req.user;

  // Pastikan pengguna sudah login
  if (!id) {
    return next(new AppError("User ID is required to log out", 400));
  }

  // Hapus refresh token di database
  await Users.removeRefreshToken(id);

  // Bersihkan cookie refresh token
  res.cookie("refreshToken", "loggedout", {
    expires: new Date(Date.now() + 60 * 1000 * 15),
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  res.clearCookie("refreshToken");

  return res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

const RefreshToken = catchAsync(async function (req, res, next) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError("No refresh token provided", 401));
  }

  const decoded = verifyJWT(refreshToken);

  const user = await Users.getUserByEmail(decoded.email);

  if (!user || user.refresh_token !== refreshToken) {
    return next(new AppError("Invalid refresh token", 403));
  }

  const newAccessToken = generateAccessToken(user);

  const cookieOptions = {
    expires: new Date(Date.now() + 60 * 1000 * 60 * 24 * 7),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.status(200).json({
    status: "success",
    message: "Access token refreshed successfully",
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

const protect = catchAsync(async function (req, res, next) {
  let token;

  // ! 1. GET TOKEN AND CHECK IF THERE IS TOKEN
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.refreshToken) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("Please log in to get access!", 401));
  }

  const decoded = verifyJWT(token);
  const currentUser = await Users.getUserByEmail(decoded.email);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does no longer exist", 401)
    );
  }

  // 4. Check if user changed password after the token was issued
  /*  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again!', 401),
    );
  } */

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
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

const googleSignIn = catchAsync(async (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

const googleCallback = catchAsync(async (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  })(req, res, async () => {
    // Pastikan 'authenticate' dipanggil dengan '(req, res, next)'
    const user = req.user;

    if (!user) {
      return next(
        new AppError("User not found after Google authentication", 404)
      );
    }

    // Buat token akses dan refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Simpan refresh token ke database
    await Users.storeRefreshToken(user.id, refreshToken);

    // Atur opsi cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 60 * 1000 * 60 * 24 * 7), // 7 hari
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };

    // Kirim refresh token melalui cookie
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // Kirim respons ke klien
    res.status(200).json({
      message: "Google login successful",
      status: "success",
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        accessToken,
      },
    });
  });
});

module.exports = {
  SignUp,
  SignIn,
  SignOut,
  RefreshToken,
  protect,
  restrictTo,
  googleSignIn,
  googleCallback,
};

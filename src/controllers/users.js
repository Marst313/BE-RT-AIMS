const {
  generateAccessToken,
  generateRefreshToken,
  verifyJWT,
} = require("../utils/jwt");
const { hashPassword, verifyPassword } = require("../utils/bcrypt");
const { err } = require("../utils/customError");

const User = require("../models/users");

async function SignUp(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  try {
    //! Hash password sebelum menyimpannya
    const hashedPassword = await hashPassword(password);

    //! CREATE USER IN USER MODEL
    await User.createUser({ ...req.body, password: hashedPassword });

    //! REMOVE PASSWORD
    req.password = undefined;

    res.status(201).json({
      status: "success",
      message: "User created successfully",
    });
  } catch (error) {
    res.status(err.errorCreate.statusCode).json({
      status: err.errorCreate.statusCode,
      message: error.message,
    });
  }
}

async function SignIn(req, res) {
  try {
    // ! VERIFY USER IN DATABASE
    const user = await verifyUser(req.body.email, req.body.password);

    // ! CHECK IF NO USER RETURN ERROR
    if (user === undefined) throw new Error("Incorrect username or password!");

    // ! REMOVE PASSWORD FROM RESULT
    user.password = undefined;
    const { email, id, username } = user;

    // ! GENERATE ACCESS TOKEN & REFRESH TOKEN
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await User.storeRefreshToken(user.id, refreshToken);

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      })
      .status(200)
      .json({
        message: "Login successful",
        data: {
          id: id,
          email,
          username,
          accessToken,
        },
      });
  } catch (error) {
    return res.status(err.errorLogin.statusCode).json({
      message: err.errorLogin.message,
      error: error.message,
    });
  }
}

async function SignOut(req, res) {
  try {
    const { id } = req.body;

    await User.removeRefreshToken(id);

    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
}

async function RefreshToken(req, res) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const decoded = verifyJWT(refreshToken);

    const user = await User.getUserByEmail(decoded.email);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    //! Generate a new access token & refresh token
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await User.storeRefreshToken(user.id, newRefreshToken);

    return res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      })
      .status(200)
      .json({ accessToken: newAccessToken });
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
}

async function verifyUser(email, password) {
  try {
    const user = await User.getUserByEmail(email);
    if (user === undefined) {
      return undefined;
    }
    const isValid = await verifyPassword(password, user.password);
    return isValid ? user : undefined;
  } catch (error) {
    throw error;
  }
}

module.exports = { SignUp, SignIn, SignOut, verifyUser, RefreshToken };

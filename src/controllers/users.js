const bcrypt = require("bcrypt");
const Users = require("../models/users");
const { generateUuid } = require("../utils/uuid");

const { hashPassword, verifyPassword } = require("../utils/bcrypt");
const User = require("../models/users");
const { err } = require("../utils/customError");

async function SignUp(req, res) {
  const { uuid, username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
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
    console.error("Error during user creation:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function SignIn(req, res) {
  const { email, password } = req.body;
  try {
    const user = await verifyUser(email, password);
    if (user === undefined) {
      throw new Error("Incorrect username or password!");
    }
    //const permissions = await Permissions.getPermissions(user);
    //if (permissions === undefined) {
    //  throw new Error("No permissions found for user");
    //}
    //const token = await generateJWT(user, permissions);
    //const verifyToken = await verifyJWT(token);

    return res.status(200).json({
      message: "Login successful",
      data: {
        //token,
        user: {
          username: user.username,
        },
      },
    });
  } catch (error) {
    return res.status(err.errorLogin.statusCode).json({
      message: err.errorLogin.message,
      error: error.message,
    });
  }
}

async function verifyUser(email, password) {
  try {
    const user = await Users.getUserByEmail(email);
    if (user === undefined) {
      return undefined;
    }
    const isValid = await verifyPassword(password, user.password);
    return isValid ? user : undefined;
  } catch (error) {
    throw error;
  }
}

async function logout(req, res) {
  // Hapus token dari cookie atau sesi
  res.clearCookie("token"); // Pastikan Anda sudah menyetel cookie token saat login

  res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
}

module.exports = { SignUp, SignIn, logout, verifyUser };

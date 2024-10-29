const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT } = require("../utils/jwt");
const { hashPassword, verifyPassword } = require("../utils/bcrypt");
const User = require("../models/users");
const { err } = require("../utils/customError");
const Users = require("../models/users");
const { validatePermission } = require("../middleware/authMiddleware");

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
    console.log(error);

    res.status(err.errorCreate.statusCode).json({
      status: err.errorCreate.statusCode,
      message: error.message,
    });
  }
}

async function SignIn(req, res) {
  try {
    const user = await verifyUser(req.body.email, req.body.password);
    if (user === undefined) {
      throw new Error("Incorrect username or password!");
    }
    user.password = undefined;

    const { email, uuid, username, role } = user;

    // const permissions = await Permissions.getPermissions(user);
    // if (permissions === undefined) {
    //   throw new Error("No permissions found for user");
    // }
    const token = await generateJWT(user);
    // const verifyToken = await verifyJWT(token);
    // const validateAccess = await validatePermission(verifyToken);

    return res.status(200).json({
      message: "Login successful",
      data: {
        id: uuid,
        email,
        username,
        token,
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

// ini yang perlu database
// async function logout(req, res) {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (token === undefined) {
//     return res.status(400).json({ message: "No token provided" });
//   }
//   try {
//     const result = await Users.logoutUser(token);
//     if (result) {
//       return res.status(200).json({
//         message: "Logout successfully",
//       });
//     }
//     return res.status(400).json({ message: "Logout failed" });
//   } catch (error) {
//     return res.status(err.errorLogout.statusCode).json({
//       message: err.errorLogout.message,
//       error: error.message,
//     });
//   }
// }

//ini yang ngga perlu database
async function logout(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    const decoded = verifyJWT(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
}

module.exports = { SignUp, SignIn, logout, verifyUser };

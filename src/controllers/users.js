const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { hashPassword, verifyPassword } = require('../utils/bcrypt');
const User = require('../models/users');
const { err } = require('../utils/customError');

async function SignUp(req, res) {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({
      status: 'error',
      message: 'All fields are required',
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
      status: 'success',
      message: 'User created successfully',
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
    // ! VERIFY USER IN DATABASE
    const user = await verifyUser(req.body.email, req.body.password);

    // ! CHECK IF NO USER RETURN ERROR
    if (user === undefined) {
      throw new Error('Incorrect username or password!');
    }
    // ! REMOVE PASSWORD FROM RESULT
    user.password = undefined;

    const { email, uuid, username } = user;

    // ! GENERATE ACCESS TOKEN
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await User.storeRefreshToken(user.uuid, refreshToken);

    return res.status(200).json({
      message: 'Login successful',
      data: {
        id: uuid,
        email,
        username,
        token: accessToken,
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

async function logout(req, res) {
  try {
    const { uuid } = req.body;

    await User.removeRefreshToken(uuid);

    return res.status(200).json({ message: 'Logout successfully' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
}

module.exports = { SignUp, SignIn, logout, verifyUser };

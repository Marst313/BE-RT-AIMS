const bcrypt = require('bcrypt');
const { generateUuid } = require('../utils/uuid');
const { hashPassword } = require('../utils/bcrypt');
const User = require('../models/users');

async function SignUp(req, res) {
  const { uuid, username, email, password, role } = req.body;

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
    console.error('Error during user creation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}

async function SignIn(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required',
    });
  }

  try {
    // Mencari pengguna berdasarkan email
    // const [user] = await db.promise().query(`SELECT * FROM users WHERE email = ?`, [email]);

    if (user.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Memverifikasi password
    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Set token di cookie jika menggunakan JWT
    // const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // res.cookie("token", token, { httpOnly: true });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}

async function logout(req, res) {
  // Hapus token dari cookie atau sesi
  res.clearCookie('token'); // Pastikan Anda sudah menyetel cookie token saat login

  res.status(200).json({
    status: 'success',
    message: 'Logout successful',
  });
}

module.exports = { SignUp, SignIn, logout };

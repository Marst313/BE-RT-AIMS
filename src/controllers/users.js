const db = require("../db/db");
const bcrypt = require("bcrypt");

async function SignUp(req, res) {
  const { uuid, username, email, password, role, id_history } = req.body;

  if (!uuid || !username || !email || !password || !role || !id_history) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  try {
    // Hash password sebelum menyimpannya
    const hashedPassword = await bcrypt.hash(password, 10);

    // Menyisipkan data ke tabel users
    const result = await db.promise().query(
      `INSERT INTO users (uuid, username, email, password, role, id_history) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuid, username, email, hashedPassword, role, id_history]
    );

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      userId: result[0].insertId, // ID pengguna yang baru dibuat
    });
  } catch (error) {
    console.error("Error during user creation:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

async function SignIn(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }

  try {
    // Mencari pengguna berdasarkan email
    const [user] = await db
      .promise()
      .query(`SELECT * FROM users WHERE email = ?`, [email]);

    if (user.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Memverifikasi password
    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Set token di cookie jika menggunakan JWT
    // const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // res.cookie("token", token, { httpOnly: true });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email,
        role: user[0].role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
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

module.exports = { SignUp, SignIn, logout };

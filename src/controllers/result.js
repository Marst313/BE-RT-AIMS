const Result = require('../models/result');
const User = require('../models/users');
const { verifyJWT } = require('../utils/jwt');

const createResult = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) {
    return res.status(400).json({ message: 'Access token required' });
  }

  try {
    // Verifikasi access token
    const decoded = verifyJWT(accessToken);

    // Ambil data pengguna berdasarkan email di token
    const user = await User.getUserByEmail(decoded.email);

    if (!user) {
      return res.status(403).json({ message: 'Invalid access token' });
    }

    const { transcript, summary, title, fileName } = req.body;

    const data = await Result.createResult({ transcript, summary, title, fileName });

    res.status(201).json({
      message: 'Result created successfully',
      status: 'success',
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating result',
      error: error.message,
    });
  }
};

const getResultById = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) {
    return res.status(400).json({ message: 'Access token required' });
  }

  try {
    // Verifikasi access token
    const decoded = verifyJWT(accessToken);

    // Ambil data pengguna berdasarkan email di token
    const user = await User.getUserByEmail(decoded.email);

    if (!user) {
      return res.status(403).json({ message: 'Invalid access token' });
    }

    const { id } = req.params;

    const result = await Result.getResultById(id);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving result',
      error: error.message,
    });
  }
};

module.exports = {
  createResult,
  getResultById,
};

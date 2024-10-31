const Result = require("../models/result");
const User = require("../models/users"); // Sesuaikan nama model ini jika berbeda
const { verifyJWT } = require("../utils/jwt"); // Pastikan fungsi verifyJWT diimpor dengan benar

const createResult = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ message: "Access token required" });
  }

  try {
    // Verifikasi access token
    const decoded = verifyJWT(accessToken);

    // Ambil data pengguna berdasarkan email di token
    const user = await User.getUserByEmail(decoded.email);

    if (!user) {
      return res.status(403).json({ message: "Invalid access token" });
    }

    const { transcript, summary } = req.body;

    try {
      const resultId = await Result.createResult({ transcript, summary });
      res.status(201).json({
        message: "Result created successfully",
        id: resultId,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating result",
        error: error.message,
      });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};

const getResultById = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ message: "Access token required" });
  }

  try {
    // Verifikasi access token
    const decoded = verifyJWT(accessToken);

    // Ambil data pengguna berdasarkan email di token
    const user = await User.getUserByEmail(decoded.email);

    if (!user) {
      return res.status(403).json({ message: "Invalid access token" });
    }

    const { id } = req.params;

    try {
      const result = await Result.getResultById(id);
      if (result.length === 0) {
        return res.status(404).json({ message: "Result not found" });
      }
      res.status(200).json(result[0]);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving result",
        error: error.message,
      });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};

module.exports = {
  createResult,
  getResultById,
};

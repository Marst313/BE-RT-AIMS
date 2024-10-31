const History = require("../models/history");
const User = require("../models/users"); // Sesuaikan nama model ini jika berbeda
const { verifyJWT } = require("../utils/jwt"); // Pastikan fungsi verifyJWT diimpor dengan benar

const createHistory = async function (req, res) {
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

    const { title, date, file, id_result } = req.body;
    try {
      const newHistoryId = await History.createHistory({
        title,
        date,
        file,
        id_result,
      });
      res
        .status(201)
        .json({ message: "History created successfully", id: newHistoryId });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating history", error: error.message });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};

const getAllHistory = async function (req, res) {
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

    // Ambil semua data history
    const historyData = await History.GetHistory();
    return res.status(200).json(historyData);
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};

const getHistoryById = async function (req, res) {
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
      const history = await History.getHistoryById(id);
      if (!history) {
        return res.status(404).json({ message: "History not found" });
      }
      res.status(200).json(history);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error retrieving history", error: error.message });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};

const updateHistory = async function (req, res) {
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
    const { title, date, file } = req.body;
    try {
      const result = await History.updateHistory(id, { title, date, file });
      if (!result.affectedRows) {
        return res.status(404).json({ message: "History not found" });
      }
      res.status(200).json({ message: "History updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating history", error: error.message });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};

const deleteHistory = async function (req, res) {
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
    const { id_result } = req.body;
    try {
      const result = await History.deleteHistory(id, id_result);
      if (!result.affectedRows) {
        return res.status(404).json({ message: "History not found" });
      }
      res.status(200).json({ message: "History deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting history", error: error.message });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};

module.exports = {
  createHistory,
  getAllHistory,
  getHistoryById,
  updateHistory,
  deleteHistory,
};

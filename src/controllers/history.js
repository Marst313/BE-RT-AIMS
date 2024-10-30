const { verifyJWT } = require("../utils/jwt");
const History = require("../models/history");
const User = require("../models/users");

const createHistory = async (req, res) => {
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

    const { title, date, file, id_result } = req.body;
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
};

const getAllHistory = async (req, res) => {
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

    const historyData = await History.GetHistory();
    console.log(History.GetHistory);
    return res.status(200).json(historyData);
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid token", error: error.message });
  }
};

const getHistoryById = async (req, res) => {
  const { id } = req.params;
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
};

const updateHistory = async (req, res) => {
  const { id } = req.params;
  const { title, date, file } = req.body;
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

    const result = await History.updateCourse(id, { title, date, file });
    if (!result.affectedRows) {
      return res.status(404).json({ message: "History not found" });
    }

    res.status(200).json({ message: "History updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating history", error: error.message });
  }
};

const deleteHistory = async (req, res) => {
  const { id } = req.params;
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

    const result = await History.deleteHistory(id);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "History not found" });
    }

    res.status(200).json({ message: "History deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting history", error: error.message });
  }
};

module.exports = {
  createHistory,
  getAllHistory,
  getHistoryById,
  updateHistory,
  deleteHistory,
};

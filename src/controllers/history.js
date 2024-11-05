const History = require('../models/history');
const User = require('../models/users');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { verifyJWT } = require('../utils/jwt');

const createHistory = catchAsync(async function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) {
    return next(new AppError('No access token provided', 401));
  }

  const decoded = verifyJWT(accessToken);
  const user = await User.getUserByEmail(decoded.email);

  if (!user) {
    return next(new AppError('Invalid access token', 403));
  }

  const { title, date, file, id_result } = req.body;

  if (!title || !date || !file || !id_result) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const newHistoryId = await History.createHistory({
    title,
    date,
    file,
    id_result,
  });

  res.status(201).json({
    status: 'success',
    message: 'History created successfully',
    data: { id: newHistoryId },
  });
});

const getAllHistory = catchAsync(async function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) {
    return next(new AppError('No access token provided', 401));
  }

  const decoded = verifyJWT(accessToken);
  const user = await User.getUserByEmail(decoded.email);

  if (!user) {
    return next(new AppError('Invalid access token', 403));
  }

  const historyData = await History.getAllHistory();

  if (!historyData || historyData.length === 0) {
    return next(new AppError('No history records found', 404));
  }

  return res.status(200).json({
    status: 'success',
    results: historyData.length,
    data: historyData,
  });
});

const getHistoryById = catchAsync(async function (req, res, next) {
  const { id } = req.params;

  if (!id) {
    return next(new AppError('Please provide a history ID', 400));
  }

  const history = await History.getHistoryById(id, req.user.id);

  if (!history) {
    return next(new AppError('History not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Success get history',
    data: history,
  });
});

const getMyHistory = async function (req, res, next) {
  const user = req.user;

  const history = await History.getMyHistory(user.id);

  if (history.length === 0) return next(new AppError('History not found', 401));

  res.status(200).json({
    status: 'success',
    message: 'Success get all history',
    data: history,
  });
};

const updateHistory = catchAsync(async function (req, res, next) {
  const { id } = req.params;
  const { title, date, file } = req.body;

  if (!title && !date && !file) {
    return next(new AppError('Please provide at least one field to update', 400));
  }

  const user = await User.getUserByEmail(req.user.email);
  if (!user) {
    return next(new AppError('Invalid access token', 403));
  }

  const result = await History.updateHistory(id, { title, date, file });
  if (!result.affectedRows) {
    return next(new AppError('History not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'History updated successfully',
  });
});

const deleteHistory = catchAsync(async function (req, res, next) {
  const { id } = req.params;
  if (!id) {
    return next(new AppError('Please provide a history ID', 400));
  }

  const user = await User.getUserByEmail(decoded.email);
  if (!user) {
    return next(new AppError('Invalid access token', 403));
  }

  const deleteResult = await History.deleteHistory(id);
  if (deleteResult === 0) {
    return next(new AppError('History not found', 404));
  }

  res.status(204).json({
    message: 'success',
    data: null,
  });
});

module.exports = {
  createHistory,
  getAllHistory,
  getHistoryById,
  getMyHistory,
  updateHistory,
  deleteHistory,
};

async function GetAllHistory(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'hello',
  });
}

module.exports = { GetAllHistory };

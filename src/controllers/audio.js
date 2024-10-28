async function UploadFile(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'hello',
  });
}

module.exports = { UploadFile };

async function SignUp(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'hello',
  });
}

module.exports = { SignUp };

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fs = require("fs");
const privateKeypath = path.join(__dirname, "/keys/private.key");
const publicKeypath = path.join(__dirname, "/keys/public.key");

const config = require("../db/db");
const privateKey = fs.readFileSync(privateKeypath, "utf8");
const publicKey = fs.readFileSync(publicKeypath, "utf8");

dotenv.config();

function generateJWT(user, permission) {
  const payload = {
    username: user.username,
    email: user.email,
    roleId: user.role,
  };

  var signOptions = {
    issuer: config.issuer,
    subject: user.email,
    audience: config.audience,
    expiresIn: "1day",
    algorithm: "RS256",
  };

  const token = jwt.sign(payload, privateKey, signOptions);
  return token;
}

function verifyJWT(token) {
  var verifyOptions = {
    issuer: config.issuer,
    audience: config.audience,
    expiresIn: "1d",
    algorithm: ["RS256"],
  };
  try {
    return jwt.verify(token, publicKey, verifyOptions);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

function generateResetToken(user) {
  const payload = {
    user: user.email,
  };

  const signOptions = {
    issuer: config.issuer,
    subject: user.email,
    audience: config.audience,
    expiresIn: "1h",
    algorithm: "RS256",
  };

  return jwt.sign(payload, privateKey, signOptions);
}

module.exports = {
  generateJWT,
  verifyJWT,
  generateResetToken,
};

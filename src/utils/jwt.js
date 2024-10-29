const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { config } = require("../db/db");
const fs = require("fs");
const path = require("path"); // Pindahkan impor path ke bagian paling atas

dotenv.config();

const privateKeypath = path.join(process.cwd(), "/keys/private.key"); // Menggunakan process.cwd() alih-alih __dirname
const publicKeypath = path.join(process.cwd(), "/keys/public.key");

const privateKey = fs.readFileSync(privateKeypath, "utf8");
const publicKey = fs.readFileSync(publicKeypath, "utf8");

function generateJWT(user, permission) {
  const payload = {
    username: user.username,
    email: user.email,
    fullname: user.fullname,
    roleId: user.role_id,
    permission: permission,
  };

  var signOptions = {
    issuer: config.issuer,
    subject: user.email,
    audience: config.audience,
    expiresIn: "1d",
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

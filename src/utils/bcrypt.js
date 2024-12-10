const { hash, compare } = require('bcrypt');
const { randomBytes, createHash } = require('crypto');
const { query } = require('../db/db');

async function hashPassword(password) {
  const hashedPassword = await hash(password, 10);
  return hashedPassword;
}
async function verifyPassword(password, hashedPassword) {
  return await compare(password, hashedPassword);
}

async function createPasswordResetToken(userId) {
  const resetToken = randomBytes(32).toString('hex');

  const hashedToken = createHash('sha256').update(resetToken).digest('hex');

  const expires = new Date(Date.now() + 5 * 60 * 1000); // 3 minutes from now
  const formattedExpires = expires.toISOString().slice(0, 19).replace('T', ' ');

  await query('UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?', [hashedToken, formattedExpires, userId]);

  return resetToken;
}

async function createHashedToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

module.exports = { hashPassword, verifyPassword, createPasswordResetToken, createHashedToken };

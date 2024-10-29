const { hash, compare } = require('bcrypt');

const SALT_ROUNDS = {
  ADMIN: 14,
  USER: 10,
};

// const saltRounds = role === 'ADMIN' ? SALT_ROUNDS.ADMIN : SALT_ROUNDS.USER;

async function hashPassword(password) {
  const hashedPassword = await hash(password, 10);
  return hashedPassword;
}
async function verifyPassword(password, hashedPassword) {
  return await compare(password, hashedPassword);
}

module.exports = { hashPassword, verifyPassword };

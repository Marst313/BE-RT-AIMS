const { query } = require('../db/db');
const { generateUuid } = require('../utils/uuid');

const Users = {
  createUser: async function (userData) {
    try {
      const id = generateUuid();
      const { username, email, password, role } = userData;

      const result = await query(
        `INSERT INTO users(
          id,  
          username, 
          email,
          password, 
          role
        )
          VALUES(?, ?, ? ,?, ?)
        `,
        [id, username, email, password, role]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  },

  getUserByEmail: async function (email) {
    try {
      const [result] = await query(`SELECT id, username, email, password, role, refresh_token FROM users WHERE email = ?`, [email]);

      return result;
    } catch (error) {
      throw error;
    }
  },

  storeRefreshToken: async function (id, refreshToken) {
    try {
      const result = await query(`UPDATE users SET refresh_token = ? WHERE id = ?`, [refreshToken, id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  removeRefreshToken: async function (id) {
    try {
      const result = await query(`UPDATE users SET refresh_token = null where id = ?`, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Users;

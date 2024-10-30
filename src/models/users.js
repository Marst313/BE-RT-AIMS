const { query } = require('../db/db');
const { generateUuid } = require('../utils/uuid');

const Users = {
  createUser: async function (userData) {
    try {
      const id = generateUuid();
      const { username, email, password, role } = userData;

      const result = await query(
        `INSERT INTO users(
          uuid,  
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
      const [result] = await query(`SELECT uuid, username, email, password, role FROM users WHERE email = ?`, [email]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  storeRefreshToken: async function (uuid, refreshToken) {
    try {
      const result = await query(`UPDATE users SET refresh_token = ? WHERE uuid = ?`, [refreshToken, uuid]);

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  removeRefreshToken: async function (uuid) {
    try {
      const result = await query(`UPDATE users SET refresh_token = null where uuid = ?`, [uuid]);

      return result.affectedRows > 0;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

module.exports = Users;

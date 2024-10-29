const { query } = require("../db/db");
const { generateUuid } = require("../utils/uuid");

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
  getUserByEmail: async (email) => {
    try {
      console.log("req result:", email);
      const [result] = await query(
        `SELECT id, uuid, username, email, password, role FROM users WHERE email = ?`,
        [email]
      );
      return result;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Users;

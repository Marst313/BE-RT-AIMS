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
        `SELECT uuid, username, email, password, role FROM users WHERE email = ?`,
        [email]
      );
      return result;
    } catch (error) {
      throw error;
    }
  },
  //ini kalo perlu database
  // logoutUser: async (token) => {
  //   try {
  //     const result = await query(
  //       `UPDATE users SET refresh_token = NULL WHERE refresh_token = ?`,
  //       token
  //     );
  //     return result;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
};

module.exports = Users;

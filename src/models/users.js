const { query } = require("../db/db");
const { generateUuid } = require("../utils/uuid");

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
      const [result] = await query(
        `SELECT id, username, email, password, role, refresh_token FROM users WHERE email = ?`,
        [email]
      );

      return result;
    } catch (error) {
      throw error;
    }
  },

  getAllUser: async function () {
    try {
      const result = await query(
        `SELECT 
          users.id AS user_id,
          users.username,
          users.email,
          history.id AS history_id,
          history.title,
          history.date
        FROM users
        LEFT JOIN history ON users.id = history.id_users
        WHERE users.role = ?
      `,
        ["user"]
      );

      const usersMap = new Map();

      result.forEach((row) => {
        const { user_id, username, email, history_id, title, date } = row;

        if (!usersMap.has(user_id)) {
          usersMap.set(user_id, {
            user_id,
            username,
            email,
            history: [],
          });
        }

        if (history_id) {
          usersMap.get(user_id).history.push({ history_id, title, date });
        }
      });

      return Array.from(usersMap.values());
    } catch (error) {
      throw error;
    }
  },

  storeRefreshToken: async function (id, refreshToken) {
    try {
      const result = await query(
        `UPDATE users SET refresh_token = ? WHERE id = ?`,
        [refreshToken, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  removeRefreshToken: async function (id) {
    try {
      const result = await query(
        `UPDATE users SET refresh_token = null where id = ?`,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  updateUserProfile: async function (currentEmail, updateData) {
    try {
      const result = await query(
        `UPDATE users SET username = ?, email = ? WHERE email = ?`,
        [updateData.username, updateData.email, currentEmail]
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  findOrCreateGoogleUser: async function (profile) {
    const { id, displayName, emails } = profile;
    const email = emails[0].value;

    try {
      const user = await query(
        `SELECT id, username, email, role, refresh_token FROM users WHERE email = ?`,
        [email]
      );

      if (user.length > 0) {
        return user[0]; // Existing user
      }

      const newUser = {
        id: generateUuid(),
        username: displayName,
        email,
        role: "user",
      };

      const result = await query(
        `INSERT INTO users(id, username, email, role) VALUES(?, ?, ?, ?)`,
        [newUser.id, newUser.username, newUser.email, newUser.role]
      );

      return newUser;
    } catch (error) {
      throw error;
    }
  },

  deleteUsers: async (id) => {
    try {
      const [user] = await query("SELECT role FROM users WHERE id = ?", [id]);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role === "admin") {
        return { success: false, message: "Admin users cannot be deleted" };
      }

      const results = await query(
        `SELECT result.id 
         FROM history
         INNER JOIN result ON history.id_result = result.id
         WHERE history.id_users = ?`,
        [id]
      );

      if (results.length > 0) {
        const ids = results.map((res) => `'${res.id}'`);
        await query(`DELETE FROM result WHERE id IN (${ids.join(",")})`);
      }

      await query("DELETE FROM history WHERE id_users = ?", [id]);

      await query("DELETE FROM users WHERE id = ?", [id]);

      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Users;

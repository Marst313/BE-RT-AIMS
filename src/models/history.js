const { query } = require("../db/db");
const { generateUuid } = require("../utils/uuid");

const History = {
  createHistory: async (historydata) => {
    try {
      const id = generateUuid();
      const result = await query(
        `INSERT INTO history (
              id, 
              title, 
              date, 
              file, 
              id_result
            ) VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          historydata.title,
          historydata.date,
          historydata.file,
          historydata.id_result,
        ]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  updateHistory: async (historyid, historydata) => {
    try {
      const result = await query(
        `UPDATE history SET
        title = ?, 
        date = ?, 
        file = ? 
        WHERE id = ?`,
        [historydata.title, historydata.date, historydata.file, historyid]
      );
      return result;
    } catch (error) {}
  },
  deleteHistory: async (id) => {
    try {
      const result = await query(`DELETE FROM history WHERE id=?`, id);
      return result;
    } catch (error) {
      throw error;
    }
  },
  GetHistory: async function () {
    try {
      const result = await query(`SELECT history.id,
          history.title,
          history.date,
          history.file
          FROM history 
          INNER JOIN result ON history.id_result = result.id;`);
      return result;
    } catch (error) {
      throw error;
    }
  },
  getHistoryById: async (id) => {
    try {
      const result = await query(`SELECT * FROM history WHERE id = ?`, [id]);
      return result;
    } catch (error) {
      throw error;
    }
  },
};
module.exports = History;

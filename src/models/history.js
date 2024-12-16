const { query } = require('../db/db');
const { generateUuid } = require('../utils/uuid');

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
        [id, historydata.title, historydata.date, historydata.file, historydata.id_result]
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
    } catch (error) {
      throw error;
    }
  },

  deleteHistory: async (id) => {
    try {
      //! Delete the history record and get the id_result of the deleted record
      const [result] = await query(
        `SELECT *
         FROM history
         INNER JOIN result ON history.id_result = result.id
         WHERE history.id = ?`,
        [id]
      );

      if (!result || !result.id_result) return 0;

      await query('DELETE FROM result WHERE id = ?', [result.id_result]);
      await query('DELETE FROM history WHERE id = ?', [id]);

      return 1;
    } catch (error) {
      throw error;
    }
  },

  getAllHistory: async (id_users) => {
    try {
      const result = await query(
        `SELECT history.id AS id_history,
                history.title AS title,
                history.date AS createdAt
         FROM history
         INNER JOIN result ON history.id_result = result.id
         WHERE history.id_users = ?`,
        [id_users]
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  getHistoryById: async (id, userId) => {
    try {
      const [result] = await query(
        `SELECT history.id AS id_history,
                history.title AS title,
                history.date AS createdAt,
                result.id AS id_result,
                result.transcript AS transcript,
                result.summary AS summary
         FROM history
         INNER JOIN result ON history.id_result = result.id
         WHERE history.id = ? AND history.id_users = ?`,

        [id, userId]
      );

      if (!result) return;

      return {
        id_history: result.id_history,
        title: result.title,
        createdAt: result.createdAt,
        result: {
          id_result: result.id_result,
          transcript: result.transcript,
          summary: result.summary,
        },
      };
    } catch (error) {
      throw error;
    }
  },

  getMyHistory: async (userId) => {
    try {
      const result = await query(
        `SELECT history.id AS id_history,
                history.title AS title,
                history.date AS createdAt,
                result.id AS id_result,
                result.transcript AS transcript,
                result.summary AS summary
         FROM history
         INNER JOIN result ON history.id_result = result.id
         WHERE history.id_users = ?`,
        [userId]
      );

      if (!result) return;

      return result;
    } catch (error) {
      throw error;
    }
  },

  getMonthlyHistory: async (userId) => {
    try {
      const result = await query(
        `SELECT MONTH(history.date) AS month, 
                COUNT(*) AS total 
         FROM history 
         WHERE history.id_users = ?
         GROUP BY MONTH(history.date) 
         ORDER BY MONTH(history.date) ASC`,
        [userId]
      );

      const monthlyData = Array.from({ length: 12 }, (_, index) => ({
        name: new Date(0, index).toLocaleString('en-US', { month: 'short' }),
        total: 0,
      }));

      result.forEach((row) => {
        const monthIndex = row.month - 1;
        monthlyData[monthIndex].total = row.total;
      });

      return monthlyData;
    } catch (error) {
      throw error;
    }
  },
};
module.exports = History;

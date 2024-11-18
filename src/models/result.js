const { query } = require('../db/db');
const { generateUuid } = require('../utils/uuid');

const Result = {
  createResult: async (resultData, userId) => {
    try {
      const idResult = generateUuid();

      await query(
        `INSERT INTO result (id, transcript, summary)
         VALUES (?, ?, ?)`,
        [idResult, resultData.transcript, resultData.summary]
      );

      const idHistory = generateUuid();

      const today = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await query(
        `INSERT INTO history (id, title, date,  id_result, id_users)
         VALUES (?, ?, ?, ?, ?)`,
        [idHistory, resultData.title, today, idResult, resultData.id]
      );

      return {
        id: idResult,
        title: resultData.title,
        id_history: idHistory,
      };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Result;

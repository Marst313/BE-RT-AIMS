const { query } = require('../db/db');
const { generateUuid } = require('../utils/uuid');

const Result = {
  createResult: async (resultData) => {
    try {
      const idResult = generateUuid();

      await query(
        `INSERT INTO result (id, transcript, summary)
         VALUES (?, ?, ?)`,
        [idResult, resultData.transcript, resultData.summary]
      );

      const historyId = generateUuid();

      const today = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await query(
        `INSERT INTO history (id, title, date, file, id_result)
     VALUES (?, ?, ?, ?, ?)`,
        [historyId, resultData.title, today, resultData.file, idResult]
      );
    } catch (error) {
      throw error;
    }
  },

  getResultById: async (id) => {
    try {
      const result = await query(`SELECT * FROM result WHERE id = ?`, [id]);
      return result;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Result;

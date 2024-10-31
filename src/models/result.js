const { query } = require("../db/db");
const { generateUuid } = require("../utils/uuid");

const Result = {
  createResult: async (resultdata) => {
    try {
      const id = generateUuid();

      // Masukkan data ke dalam tabel result
      await query(
        `INSERT INTO result (id, transcript, summary)
         VALUES (?, ?, ?)`,
        [id, resultdata.transcript, resultdata.summary]
      );

      // Ambil id_history dari resultdata untuk mengupdate tabel history
      const historyId = generateUuid();
      // Update tabel history dengan id_result yang baru
      await query(
        `INSERT INTO history (id, id_result)
     VALUES (?, ?)`,
        [historyId, id]
      );

      return id; // Mengembalikan id yang baru ditambahkan
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

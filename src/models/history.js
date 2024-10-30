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
        `UPDATE course SET title = ?, 
        title = ?, 
        date = ?, 
        file = ?, 
        WHERE id = ?`,
        [
          historydata.title,
          historydata.title,
          historydata.date,
          historydata.file,
          historyid,
        ]
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
  //! jangan dihapus dulu, mau buat inner join nya bang
  //   getAllCourse: async () => {
  //     try {
  //       const result = await query(
  //         `SELECT course.id,
  //         course.title,
  //         course.description,
  //         course.thumbnail,
  //         course.start_date,
  //         course.end_date,
  //         sub_category_id, sub_categories AS subCategories
  //         FROM course
  //         LEFT JOIN sub_categories ON course.sub_category_id = sub_categories.id`
  //       );
  //       return result;
  //     } catch (error) {
  //       throw error;
  //     }
  //   },
  GetHistory: async () => {
    try {
      const result = await query(`SELECT title,date,file FROM history`);
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

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Buat pool koneksi
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const config = {
  issuer: process.env.JWT_ISSUER || 'APPLMS',
  audience: process.env.JWT_AUDIENCE || 'RT_AIMS',
};

async function query(query, value) {
  try {
    const [result] = await db.query(query, value === undefined ? [] : value);
    return result;
  } catch (error) {
    console.log('Failed to connect database:', error);
    throw error;
  }
}

module.exports = { query, db, config };

const db = require("../db");
const bcrypt = require("bcrypt");

async function initializeTables() {
  const checkTableQuery = `
    SELECT * FROM information_schema.tables
    WHERE table_schema = '${process.env.DB_NAME}'
    AND table_name = 'users'
    LIMIT 1;
  `;

  const createNewTableQuery = [
    `CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` int(8) NOT NULL AUTO_INCREMENT,
      \`uuid\` char(36) NOT NULL,
      \`username\` varchar(255) NOT NULL,
      \`email\` varchar(255) NOT NULL,
      \`password\` varchar(255) NOT NULL,
      \`role\` char(36) NOT NULL,
      \`id_history\` char(36) NOT NULL,
      PRIMARY KEY(\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

    `CREATE TABLE IF NOT EXISTS \`result\` (
      \`id\` int(36) NOT NULL,
      \`transcript\` varchar(255) NOT NULL,
      \`summary\` varchar(255) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

    `CREATE TABLE IF NOT EXISTS \`history\` (
      \`id\` char(36) NOT NULL,
      \`title\` varchar(255) NOT NULL,
      \`date\` date NOT NULL,
      \`file\` varchar(255) NOT NULL,
      \`id_result\` char(36) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,
  ];

  try {
    for (let createTable of createNewTableQuery) {
      await new Promise(function (resolve, reject) {
        db.query(createTable, function (err) {
          if (err) {
            console.error(`Error creating table:`);
            return reject(err);
          }
          resolve();
        });
      });
    }

    console.log("Database is ready");
    // Hapus atau komentari baris ini untuk mencegah penambahan data otomatis
    // await seedDatabase(); // Memanggil fungsi seedDatabase setelah tabel diinisialisasi
  } catch (error) {
    console.log(error);
  }
}

// Fungsi untuk menambah data pengguna (dapat dijalankan secara manual jika diperlukan)
async function seedDatabase() {
  const userData = {
    uuid: "1",
    username: "selta",
    email: "seltajaya.16@gmail.com",
    password: "selta1221", // Pastikan untuk menghash password sebelum menyimpan
    role: "admin",
    id_history: "1",
  };

  try {
    // Hash password sebelum menyimpannya
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Menyisipkan data ke tabel users
    const result = await db.promise().query(
      `INSERT INTO users (uuid, username, email, password, role, id_history) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userData.uuid,
        userData.username,
        userData.email,
        hashedPassword,
        userData.role,
        userData.id_history,
      ]
    );

    console.log("User inserted with ID:", result[0].insertId);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

module.exports = { initializeTables, seedDatabase };

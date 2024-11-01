const { db, query } = require("../db");
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
        \`id\` char(36) NOT NULL,
        \`username\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL UNIQUE,
        \`password\` varchar(255) NOT NULL,
        \`role\` char(36) NOT NULL,
        \`refresh_token\` LONGTEXT,
        \`id_history\` char(36),
        PRIMARY KEY(\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

    `CREATE TABLE IF NOT EXISTS \`result\` (
        \`id\` char(36) NOT NULL,
        \`transcript\` varchar(255) NOT NULL,
        \`summary\` varchar(255) NOT NULL,
        PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

    `CREATE TABLE IF NOT EXISTS \`history\` (
        \`id\` char(36) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`date\` date NOT NULL,
        \`file\` varchar(255) ,
        \`id_result\` char(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`id_result\`) REFERENCES \`result\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,
  ];

  try {
    for (let createQuery of createNewTableQuery) {
      await query(createQuery);
    }

    console.log("Database is ready");
  } catch (error) {
    console.log(error);
  }
}

module.exports = { initializeTables };

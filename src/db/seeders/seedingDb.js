const { query } = require('../db');

async function initializeTables() {
  const checkTableQuery = `
    SELECT * FROM information_schema.tables
    WHERE table_schema = '${process.env.DB_NAME}'
    AND table_name = 'users'
    LIMIT 1;
  `;

  const createNewTableQuery = [
    `CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` CHAR(36) NOT NULL,
        \`username\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`images_profile\` VARCHAR(255),
        \`password\` VARCHAR(255),
        \`role\` CHAR(36) NOT NULL,
        \`refresh_token\` LONGTEXT,
        \`password_reset_token\` VARCHAR(255),
        \`password_reset_expires\` DATETIME,
        PRIMARY KEY(\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

    `CREATE TABLE IF NOT EXISTS \`result\` (
        \`id\` CHAR(36) NOT NULL,
        \`transcript\` LONGTEXT NOT NULL,
        \`summary\` LONGTEXT NOT NULL,
        PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

    `CREATE TABLE IF NOT EXISTS \`history\` (
        \`id\` CHAR(36) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`date\` date NOT NULL,
        \`id_result\` CHAR(36) NOT NULL,
        \`id_users\` CHAR(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`id_result\`) REFERENCES \`result\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`id_users\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,
  ];

  try {
    for (let createQuery of createNewTableQuery) {
      await query(createQuery);
    }

    console.log('Database is ready');
  } catch (error) {
    console.log(error);
  }
}

module.exports = { initializeTables };

const db = require('../db');

async function initializeTables() {
  const checkTableQuery = `
  SELECT * from information_schema.tables
  WHERE table_schema = '${process.env.DB_Name}'
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

    console.log('Database is ready');
  } catch (error) {
    console.log(error);
  }
}

module.exports = { initializeTables };

require('../loadEnv');
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function migrate() {
  const sqlPath = path.join(__dirname, '..', '..', 'sql', 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Migração aplicada.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});

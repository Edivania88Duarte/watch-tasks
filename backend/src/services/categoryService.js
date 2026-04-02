const { pool } = require('../db/pool');

async function listByUser(userId) {
  const result = await pool.query(
    `SELECT id, name, created_at FROM categories WHERE user_id = $1 ORDER BY name`,
    [userId]
  );
  return result.rows;
}

async function create(userId, { name }) {
  const result = await pool.query(
    `INSERT INTO categories (user_id, name) VALUES ($1, $2)
     RETURNING id, name, created_at`,
    [userId, name.trim()]
  );
  return result.rows[0];
}

async function getById(userId, id) {
  const result = await pool.query(
    `SELECT id, name, created_at FROM categories WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function update(userId, id, { name }) {
  const result = await pool.query(
    `UPDATE categories SET name = $3
     WHERE id = $1 AND user_id = $2
     RETURNING id, name, created_at`,
    [id, userId, name.trim()]
  );
  return result.rows[0] || null;
}

async function remove(userId, id) {
  const result = await pool.query(
    `DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows[0] || null;
}

module.exports = { listByUser, create, getById, update, remove };

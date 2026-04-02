const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');
const config = require('../config');

async function register({ email, password, name }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at`,
    [email.toLowerCase().trim(), passwordHash, name.trim()]
  );
  return result.rows[0];
}

async function login({ email, password }) {
  const result = await pool.query(
    'SELECT id, email, password_hash, name FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  if (result.rows.length === 0) {
    return null;
  }
  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return null;
  }
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

module.exports = { register, login };

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL não definido. Crie backend/.env (ex.: npm run setup:env na pasta backend) e confirme que o PostgreSQL está a correr.'
  );
}

function buildPoolConfig(rawConnectionString) {
  const isRds = /rds\.amazonaws\.com/i.test(rawConnectionString);
  if (!isRds) {
    return { connectionString: rawConnectionString };
  }

  // If sslmode is present in URL, pg-connection-string may force a stricter mode
  // and ignore rejectUnauthorized=false. We strip it and define SSL explicitly.
  let sanitized = rawConnectionString;
  try {
    const parsed = new URL(rawConnectionString);
    parsed.searchParams.delete('sslmode');
    parsed.searchParams.delete('uselibpqcompat');
    sanitized = parsed.toString();
  } catch {
    // Keep original URL if parsing fails.
  }

  return {
    connectionString: sanitized,
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

const pool = new Pool({
  ...buildPoolConfig(connectionString),
  max: Number(process.env.PG_POOL_MAX || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

module.exports = { pool };

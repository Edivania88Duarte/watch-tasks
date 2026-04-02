const { pool } = require('../db/pool');

async function summary(userId) {
  const byStatus = await pool.query(
    `SELECT t.status, COUNT(DISTINCT t.id)::int AS count
     FROM tasks t
     LEFT JOIN task_collaborators tc ON tc.task_id = t.id
     WHERE t.owner_id = $1 OR tc.user_id = $1
     GROUP BY t.status`,
    [userId]
  );

  const byCategory = await pool.query(
    `SELECT COALESCE(c.name, '(sem categoria)') AS category_name,
            COUNT(DISTINCT t.id)::int AS count
     FROM tasks t
     LEFT JOIN task_collaborators tc ON tc.task_id = t.id
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.owner_id = $1 OR tc.user_id = $1
     GROUP BY c.name
     ORDER BY category_name`,
    [userId]
  );

  const total = byStatus.rows.reduce((acc, r) => acc + r.count, 0);

  return {
    total_tasks: total,
    by_status: byStatus.rows,
    by_category: byCategory.rows,
  };
}

module.exports = { summary };

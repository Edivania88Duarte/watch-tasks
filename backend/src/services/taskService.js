const { pool } = require('../db/pool');
const taskStatus = require('../constants/taskStatus');

async function userCanAccessTask(userId, taskId) {
  const r = await pool.query(
    `SELECT t.id, t.owner_id FROM tasks t
     LEFT JOIN task_collaborators tc ON tc.task_id = t.id AND tc.user_id = $2
     WHERE t.id = $1 AND (t.owner_id = $2 OR tc.user_id IS NOT NULL)`,
    [taskId, userId]
  );
  return r.rows[0] || null;
}

async function listForUser(userId) {
  const result = await pool.query(
    `SELECT t.id, t.owner_id, t.category_id, t.title, t.description,
            t.status, t.created_at, t.updated_at,
            (t.owner_id = $1) AS is_owner
     FROM tasks t
     WHERE t.owner_id = $1
        OR EXISTS (
          SELECT 1 FROM task_collaborators tc
          WHERE tc.task_id = t.id AND tc.user_id = $1
        )
     ORDER BY t.updated_at DESC`,
    [userId]
  );
  return result.rows;
}

async function create(ownerId, { categoryId, title, description, status }) {
  const st = taskStatus.isValid(status) ? status : 'todo';
  if (categoryId) {
    const cat = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [categoryId, ownerId]
    );
    if (cat.rows.length === 0) {
      const err = new Error('Categoria não encontrada');
      err.code = 'CATEGORY_NOT_FOUND';
      throw err;
    }
  }
  const result = await pool.query(
    `INSERT INTO tasks (owner_id, category_id, title, description, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, owner_id, category_id, title, description, status, created_at, updated_at`,
    [ownerId, categoryId || null, title.trim(), description || null, st]
  );
  const row = result.rows[0];
  row.is_owner = true;
  return row;
}

async function getById(userId, id) {
  const access = await userCanAccessTask(userId, id);
  if (!access) return null;
  const result = await pool.query(
    `SELECT t.id, t.owner_id, t.category_id, t.title, t.description, t.status, t.created_at, t.updated_at,
            (t.owner_id = $2) AS is_owner
     FROM tasks t WHERE t.id = $1`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function update(userId, id, { categoryId, title, description, status }) {
  const access = await userCanAccessTask(userId, id);
  if (!access) return null;
  const task = await pool.query('SELECT owner_id FROM tasks WHERE id = $1', [id]);
  if (task.rows.length === 0) return null;
  const isOwner = task.rows[0].owner_id === userId;

  const parts = [];
  const values = [];
  let p = 1;

  if (categoryId !== undefined) {
    if (!isOwner) {
      const err = new Error('Apenas o dono pode alterar a categoria');
      err.code = 'FORBIDDEN';
      throw err;
    }
    if (categoryId === null) {
      parts.push('category_id = NULL');
    } else {
      const cat = await pool.query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [categoryId, task.rows[0].owner_id]
      );
      if (cat.rows.length === 0) {
        const err = new Error('Categoria não encontrada');
        err.code = 'CATEGORY_NOT_FOUND';
        throw err;
      }
      parts.push(`category_id = $${p++}`);
      values.push(categoryId);
    }
  }
  if (title !== undefined) {
    parts.push(`title = $${p++}`);
    values.push(title.trim());
  }
  if (description !== undefined) {
    parts.push(`description = $${p++}`);
    values.push(description);
  }
  if (status !== undefined) {
    if (!taskStatus.isValid(status)) {
      const err = new Error('Status inválido');
      err.code = 'INVALID_STATUS';
      throw err;
    }
    parts.push(`status = $${p++}`);
    values.push(status);
  }
  if (parts.length === 0) {
    return getById(userId, id);
  }
  parts.push('updated_at = NOW()');
  values.push(id);
  const q = `UPDATE tasks SET ${parts.join(', ')} WHERE id = $${p} RETURNING id, owner_id, category_id, title, description, status, created_at, updated_at`;
  const result = await pool.query(q, values);
  const row = result.rows[0];
  row.is_owner = row.owner_id === userId;
  return row;
}

async function remove(userId, id) {
  const result = await pool.query(
    `DELETE FROM tasks WHERE id = $1 AND owner_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function listCollaborators(taskId, ownerId) {
  const task = await pool.query('SELECT owner_id FROM tasks WHERE id = $1', [taskId]);
  if (task.rows.length === 0) return null;
  if (task.rows[0].owner_id !== ownerId) return null;
  const result = await pool.query(
    `SELECT u.id, u.email, u.name, tc.created_at
     FROM task_collaborators tc
     JOIN users u ON u.id = tc.user_id
     WHERE tc.task_id = $1
     ORDER BY tc.created_at`,
    [taskId]
  );
  return result.rows;
}

async function addCollaborator(taskId, ownerId, collaboratorEmail) {
  const task = await pool.query('SELECT owner_id FROM tasks WHERE id = $1', [taskId]);
  if (task.rows.length === 0) return { error: 'NOT_FOUND' };
  if (task.rows[0].owner_id !== ownerId) return { error: 'FORBIDDEN' };

  const user = await pool.query('SELECT id FROM users WHERE email = $1', [
    collaboratorEmail.toLowerCase().trim(),
  ]);
  if (user.rows.length === 0) return { error: 'USER_NOT_FOUND' };
  const collabId = user.rows[0].id;
  if (collabId === ownerId) return { error: 'SELF' };

  await pool.query(
    `INSERT INTO task_collaborators (task_id, user_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [taskId, collabId]
  );
  const u = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [collabId]);
  return { collaborator: u.rows[0] };
}

async function removeCollaborator(taskId, ownerId, collaboratorUserId) {
  const task = await pool.query('SELECT owner_id FROM tasks WHERE id = $1', [taskId]);
  if (task.rows.length === 0) return null;
  if (task.rows[0].owner_id !== ownerId) return null;
  const result = await pool.query(
    `DELETE FROM task_collaborators WHERE task_id = $1 AND user_id = $2 RETURNING task_id`,
    [taskId, collaboratorUserId]
  );
  return result.rows[0] || null;
}

module.exports = {
  userCanAccessTask,
  listForUser,
  create,
  getById,
  update,
  remove,
  listCollaborators,
  addCollaborator,
  removeCollaborator,
};

const express = require('express');
const taskService = require('../services/taskService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const rows = await taskService.listForUser(req.user.id);
  return res.json(rows);
});

router.post('/', async (req, res) => {
  const { categoryId, title, description, status } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'title é obrigatório' });
  }
  try {
    const row = await taskService.create(req.user.id, {
      categoryId,
      title,
      description,
      status,
    });
    return res.status(201).json(row);
  } catch (err) {
    if (err.code === 'CATEGORY_NOT_FOUND') {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }
});

router.get('/:id', async (req, res) => {
  const row = await taskService.getById(req.user.id, req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Não encontrado' });
  }
  return res.json(row);
});

router.put('/:id', async (req, res) => {
  try {
    const row = await taskService.update(req.user.id, req.params.id, req.body || {});
    if (!row) {
      return res.status(404).json({ error: 'Não encontrado' });
    }
    return res.json(row);
  } catch (err) {
    if (err.code === 'FORBIDDEN') {
      return res.status(403).json({ error: err.message });
    }
    if (err.code === 'CATEGORY_NOT_FOUND') {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === 'INVALID_STATUS') {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }
});

router.delete('/:id', async (req, res) => {
  const row = await taskService.remove(req.user.id, req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Não encontrado' });
  }
  return res.status(204).send();
});

router.get('/:id/collaborators', async (req, res) => {
  const rows = await taskService.listCollaborators(req.params.id, req.user.id);
  if (rows === null) {
    return res.status(404).json({ error: 'Não encontrado ou sem permissão' });
  }
  return res.json(rows);
});

router.post('/:id/collaborators', async (req, res) => {
  const { email } = req.body || {};
  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'email é obrigatório' });
  }
  const result = await taskService.addCollaborator(req.params.id, req.user.id, email);
  if (result.error === 'NOT_FOUND') {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }
  if (result.error === 'FORBIDDEN') {
    return res.status(403).json({ error: 'Apenas o dono pode adicionar colaboradores' });
  }
  if (result.error === 'USER_NOT_FOUND') {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  if (result.error === 'SELF') {
    return res.status(400).json({ error: 'Não é possível adicionar a si mesmo' });
  }
  return res.status(201).json(result.collaborator);
});

router.delete('/:id/collaborators/:userId', async (req, res) => {
  const row = await taskService.removeCollaborator(
    req.params.id,
    req.user.id,
    req.params.userId
  );
  if (!row) {
    return res.status(404).json({ error: 'Não encontrado ou sem permissão' });
  }
  return res.status(204).send();
});

module.exports = router;

const express = require('express');
const categoryService = require('../services/categoryService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const rows = await categoryService.listByUser(req.user.id);
  return res.json(rows);
});

router.post('/', async (req, res) => {
  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'name é obrigatório' });
  }
  try {
    const row = await categoryService.create(req.user.id, { name });
    return res.status(201).json(row);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Já existe uma categoria com esse nome' });
    }
    throw err;
  }
});

router.get('/:id', async (req, res) => {
  const row = await categoryService.getById(req.user.id, req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Não encontrado' });
  }
  return res.json(row);
});

router.put('/:id', async (req, res) => {
  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'name é obrigatório' });
  }
  try {
    const row = await categoryService.update(req.user.id, req.params.id, { name });
    if (!row) {
      return res.status(404).json({ error: 'Não encontrado' });
    }
    return res.json(row);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Já existe uma categoria com esse nome' });
    }
    throw err;
  }
});

router.delete('/:id', async (req, res) => {
  const row = await categoryService.remove(req.user.id, req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Não encontrado' });
  }
  return res.status(204).send();
});

module.exports = router;

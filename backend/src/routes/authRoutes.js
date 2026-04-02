const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password e name são obrigatórios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  }
  try {
    const user = await authService.register({ email, password, name });
    return res.status(201).json({ user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email e password são obrigatórios' });
  }
  try {
    const result = await authService.login({ email, password });
    if (!result) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

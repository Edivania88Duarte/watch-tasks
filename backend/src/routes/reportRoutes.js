const express = require('express');
const reportService = require('../services/reportService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/summary', async (req, res) => {
  const data = await reportService.summary(req.user.id);
  return res.json(data);
});

module.exports = router;

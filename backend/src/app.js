require('./loadEnv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const openapiPath = path.join(__dirname, '..', 'openapi.yaml');
const openapiDoc = yaml.load(fs.readFileSync(openapiPath, 'utf8'));

// Em Lambda, PUBLIC_API_URL (definida no deploy) garante que o Swagger aponta para o API Gateway certo.
const publicUrl = process.env.PUBLIC_API_URL && String(process.env.PUBLIC_API_URL).trim();
if (publicUrl) {
  const base = publicUrl.replace(/\/+$/, '');
  const localOnly = (openapiDoc.servers || []).filter((s) =>
    /localhost|127\.0\.0\.1/.test(s.url)
  );
  openapiDoc.servers = [
    { url: base, description: 'API (deploy atual)' },
    ...localOnly,
  ];
}

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err);
  return res.status(500).json({ error: 'Erro interno' });
});

module.exports = app;

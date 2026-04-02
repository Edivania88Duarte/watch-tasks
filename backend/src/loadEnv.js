const fs = require('fs');
const path = require('path');

const backendRoot = path.join(__dirname, '..');
const envPath = path.join(backendRoot, '.env');

require('dotenv').config({ path: envPath });

if (!process.env.DATABASE_URL) {
  const example = path.join(backendRoot, '.env.example');
  if (!fs.existsSync(envPath) && fs.existsSync(example)) {
    console.error('');
    console.error('[backend] Falta o ficheiro .env com DATABASE_URL.');
    console.error('  Na pasta backend, execute:');
    console.error('    npm run setup:env');
    console.error('  ou copie manualmente .env.example para .env');
    console.error('');
  }
}

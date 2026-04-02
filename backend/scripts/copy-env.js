const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dest = path.join(root, '.env');
const example = path.join(root, '.env.example');

if (fs.existsSync(dest)) {
  console.log('backend/.env já existe.');
  process.exit(0);
}

if (!fs.existsSync(example)) {
  console.error('backend/.env.example não encontrado.');
  process.exit(1);
}

fs.copyFileSync(example, dest);
console.log('Criado backend/.env a partir de .env.example');

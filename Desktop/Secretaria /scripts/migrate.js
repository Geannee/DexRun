// scripts/migrate.js - Aplica arquivos SQL no banco configurado via .env
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('Faltam variáveis de ambiente do banco (DB_HOST, DB_USER, DB_NAME).');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    multipleStatements: true
  });

  const sqlFiles = [
    'criar_tabelas_completas.sql',
    'criar_tabela_usuarios.sql'
  ];

  for (const file of sqlFiles) {
    const full = path.join(process.cwd(), file);
    if (!fs.existsSync(full)) {
      console.warn(`Arquivo não encontrado, pulando: ${file}`);
      continue;
    }
    const sql = fs.readFileSync(full, 'utf8');
    console.log(`Aplicando ${file}...`);
    await conn.query(sql);
    console.log(`Concluído: ${file}`);
  }

  // Seed de serviços (se a tabela estiver vazia)
  const [countRows] = await conn.query('SELECT COUNT(*) AS cnt FROM servicos');
  if (countRows[0].cnt === 0) {
    const seedPath = path.join(process.cwd(), 'seed_servicos.sql');
    if (fs.existsSync(seedPath)) {
      console.log('Aplicando seed de serviços...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await conn.query(seedSql);
      console.log('Seed de serviços concluído.');
    } else {
      console.warn('Seed de serviços não encontrado, pulando.');
    }
  }

  await conn.end();
  console.log('Migrações concluídas com sucesso.');
}

run().catch(err => {
  console.error('Erro nas migrações:', err);
  process.exit(1);
});

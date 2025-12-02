require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    console.error('Faltam variáveis de ambiente do banco (DB_HOST, DB_USER, DB_NAME).');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: DB_HOST.includes('aivencloud') ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true,
  });

  const [rows] = await conn.query('SELECT COUNT(*) AS cnt FROM servicos');
  if (rows[0].cnt > 0) {
    console.log('Tabela servicos já possui registros. Nada a fazer.');
    await conn.end();
    return;
  }

  const sql = fs.readFileSync(path.join(process.cwd(), 'seed_servicos.sql'), 'utf8');
  await conn.query(sql);
  await conn.end();
  console.log('Seed de serviços aplicado com sucesso.');
}

main().catch((e) => {
  console.error('Erro ao aplicar seed de serviços:', e);
  process.exit(1);
});

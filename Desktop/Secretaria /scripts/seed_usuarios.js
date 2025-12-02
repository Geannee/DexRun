// Script de seed para criar a tabela `usuarios` e inserir o administrador
// Lê o arquivo SQL `criar_tabela_usuarios.sql` e executa os comandos no banco
const fs = require('fs');
const path = require('path');
const db = require('../db');

async function run() {
  try {
    const sqlPath = path.join(__dirname, '..', 'criar_tabela_usuarios.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove comments and split by semicolon
    const statements = sql
      .replace(/--.*$/gm, '')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executando ${statements.length} comandos SQL...`);

    for (const stmt of statements) {
      console.log(`SQL: ${stmt.substring(0, 80)}${stmt.length > 80 ? '...' : ''}`);
      await db.query(stmt);
    }

    // Confirmação
    const [rows] = await db.query('SELECT id, nome, email, usuario, nivel, ativo FROM usuarios');
    console.log('Usuários cadastrados:');
    for (const r of rows) {
      console.log(`- id=${r.id} | nome=${r.nome} | email=${r.email} | usuario=${r.usuario} | nivel=${r.nivel} | ativo=${r.ativo}`);
    }
    console.log('Seed concluído com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao executar o seed:', err);
    process.exit(1);
  }
}

run();

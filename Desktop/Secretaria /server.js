// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const apiRouter = require('./rotas/api');
const authRouter = require('./rotas/auth');
const whatsappRouter = require('./rotas/whatsapp');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Middleware
app.use(bodyParser.json());

// Rotas da API
app.use('/api/users', apiRouter);
app.use('/api/auth', authRouter);
app.use('/api/whatsapp', whatsappRouter);

// Servir arquivos estáticos da pasta public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Página inicial redireciona para /public/index.html
app.get('/', (req, res) => {
    res.redirect('/public/index.html');
});

// Iniciar servidor após testar banco
db.getConnection()
  .then(conn => {
    console.log("Conectado ao MySQL!");
    conn.release();
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch(err => {
    console.error("Erro ao conectar ao banco:", err);
    process.exit(1);
  });

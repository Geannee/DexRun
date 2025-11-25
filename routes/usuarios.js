const express = require('express');
const router = express.Router();
const db = require('../db'); // Importa o pool de conexões

// Rota de Login
// POST /api/users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // Consulta o usuário pelo e-mail no banco de dados
        const sql = 'SELECT * FROM Usuario WHERE email = ?';
        const [users] = await db.query(sql, [email]);

        // Verifica se o usuário foi encontrado
        if (users.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos.' }); // 401 Unauthorized
        }

        const user = users[0];

        // Compara a senha (IMPORTANTE: em um projeto real, use hashing!)
        if (password !== user.senha) {
            return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        }

        // Login bem-sucedido: retorna os dados do usuário (sem a senha)
        res.json({ id: user.id, nome: user.nome, email: user.email });

    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// ✅ Rota para CADASTRAR um novo usuário
// POST /api/users/
router.post('/', async (req, res) => {
    const { nome, cpf, whatsapp, email, senha } = req.body;

    // Validação básica dos campos obrigatórios
    if (!nome || !email || !senha || !cpf) {
        return res.status(400).json({ error: 'Nome, CPF, e-mail e senha são obrigatórios.' });
    }

    try {
        const sql = 'INSERT INTO Usuario (nome, cpf, whatsapp, email, senha) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [nome, cpf, whatsapp || null, email, senha]);
        
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: result.insertId });

    } catch (err) {
        // Trata erro de e-mail/CPF duplicado
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' }); // 409 Conflict
        }
        
        console.error("Erro ao cadastrar usuário:", err);
        res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
    }
});

module.exports = router;
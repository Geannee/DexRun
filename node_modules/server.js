//arquivo principal
const express = require('express');
const app = express();
const port = 3000;
const path = require('path'); //pegar o caminho dos arquivos estáticos

app.use(express.json());

//informar onde os arquivos estáticos estão
app.use(express.static('public'));

//chamar a conexão com o banco
const db = require('./db'); 

//API - rotas do sistema
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

//ROTA para a página que faz a listagem de usuários cadastrados no sistema
app.get('/Treinos', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'usuarios.html'));
});

//ROTA para a página de login
app.get('/login', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

//ROTA para a página de recuperação de senha
app.get('/recuperar-senha', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'recSenha.html'));
});

// ==================== USUÁRIOS (MANTIDO COMO ESTÁ) ====================

//importar o módulo das rotas
const usuariosRoutes = require('./routes/usuarios'); //puxa as rotas definidas dentro de api.js

app.use(express.json()); //interpretar os arquivos da req (body)

// Monta as rotas de usuários sob o prefixo /api/users
app.use('/api/users', usuariosRoutes); //alcançar as rotas do arquivo (api.js)

// ==================== TREINOS (NOVO CRUD COMPLETO) ====================

// CADASTRAR TREINO - POST /api/treinos
app.post('/api/treinos', async (req, res) => {
    let {
        usuario_id,
        nome_treino,
        data,
        periodo,
        cidade,
        estado,
        tipo_treino,
        km_por_percurso,
    } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ error: "O ID do usuário (usuario_id) é obrigatório." });
    }

    const sql = `
        INSERT INTO Treino (usuario_id, nome_treino, data, periodo, cidade, estado, tipo_treino, km_por_percurso) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await db.query(sql, [
            usuario_id,
            nome_treino,
            data || null,
            periodo || null,
            cidade || null,
            estado || null,
            tipo_treino || null,
            km_por_percurso || null
        ]);

        res.status(201).json({ 
            message: "Treino cadastrado com sucesso", 
            id: result.insertId 
        });
    } catch (err) {
        console.error("Erro ao cadastrar treino:", err);
        res.status(500).json({ error: "Erro interno ao cadastrar treino" });
    }
});

// LISTAR TODOS OS TREINOS - GET /api/treinos
app.get('/api/treinos', async (req, res) => {
    const sql = `
        SELECT 
            id_treino, 
            usuario_id,
            nome_treino, 
            tipo_treino, 
            km_por_percurso, 
            DATE_FORMAT(data, '%d/%m/%Y') AS data_formatada 
        FROM Treino 
        ORDER BY data DESC
    `;

    try {
        const [treinos] = await db.query(sql);
        res.json(treinos);
    } catch (err) {
        console.error("Erro ao listar treinos:", err);
        res.status(500).json({ error: "Erro interno ao listar treinos" });
    }
});

// LISTAR TREINOS DE UM USUÁRIO ESPECÍFICO - GET /api/treinos/user/:userId
app.get('/api/treinos/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT *, DATE_FORMAT(data, '%d/%m/%Y') AS data_formatada 
        FROM Treino 
        WHERE usuario_id = ? 
        ORDER BY data DESC
    `;

    try {
        const [treinos] = await db.query(sql, [userId]);
        res.json(treinos);
    } catch (err) {
        console.error(`Erro ao listar treinos para o usuário ${userId}:`, err);
        res.status(500).json({ error: "Erro interno ao listar treinos do usuário" });
    }
});

// BUSCAR UM TREINO ESPECÍFICO POR ID - GET /api/treinos/:id  <-- ROTA ADICIONADA
app.get('/api/treinos/:id', async (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM Treino WHERE id_treino = ?";

    try {
        const [treinos] = await db.query(sql, [id]);

        if (treinos.length === 0) {
            return res.status(404).json({ error: "Treino não encontrado" });
        }

        res.json(treinos[0]); // Retorna o primeiro (e único) treino encontrado

    } catch (err) {
        console.error(`Erro ao buscar o treino ${id}:`, err);
        res.status(500).json({ error: "Erro interno ao buscar dados do treino" });
    }
});

// EDITAR TREINO - PUT /api/treinos/:id
app.put('/api/treinos/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Requisição PUT para /api/treinos/:id recebida. ID do treino:', id);
    const {
        nome_treino,
        tipo_treino,
        km_por_percurso,
        data,
        periodo,
        cidade,
        estado,
        usuario_id
    } = req.body;
    console.log('Corpo da requisição (req.body):', req.body);

    if (!usuario_id) {
        return res.status(400).json({ error: "O ID do usuário (usuario_id) é obrigatório para registrar a alteração." });
    }

    const connection = await db.getConnection();

    try {
        // Inicia uma transação para garantir a consistência dos dados
        await connection.beginTransaction();

        // 1. Busca o treino original para comparar as alterações
        const [treinosAtuais] = await connection.query("SELECT * FROM Treino WHERE id_treino = ?", [id]);

        console.log('Treino original do banco de dados:', treinosAtuais[0]);
        if (treinosAtuais.length === 0) {
            await connection.rollback(); // Desfaz a transação
            return res.status(404).json({ error: "Treino não encontrado" });
        }
        const treinoOriginal = treinosAtuais[0];

        // 2. Compara os campos e monta o objeto de alterações
        const camposAlterados = {};
        const camposParaVerificar = ['nome_treino', 'tipo_treino', 'km_por_percurso', 'data', 'periodo', 'cidade', 'estado'];

        // Formata a data do banco (YYYY-MM-DDTHH:mm:ss.sssZ) para (YYYY-MM-DD) para comparação
        if (treinoOriginal.data) {
            treinoOriginal.data = new Date(treinoOriginal.data).toISOString().split('T')[0];
        }

        camposParaVerificar.forEach(campo => {
            // Compara o valor original (convertido para string, tratando null/undefined) com o novo valor
            if (String(treinoOriginal[campo] || '') !== String(req.body[campo] || '')) {
                camposAlterados[campo] = { de: treinoOriginal[campo] || null, para: req.body[campo] || null };
            }
        });

        console.log('Campos alterados detectados:', camposAlterados);
        // 3. Atualiza o treino na tabela principal 'Treino'
    const sql = `
        UPDATE Treino
        SET 
            nome_treino = ?, 
            tipo_treino = ?, 
            km_por_percurso = ?, 
            data = ?, 
            periodo = ?, 
            cidade = ?, 
            estado = ?
        WHERE id_treino = ?
    `;


        const [result] = await connection.query(sql, [
            nome_treino || null,
            tipo_treino || null,
            km_por_percurso || null,
            data || null,
            periodo || null,
            cidade || null,
            estado || null,
            id 
        ]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Treino não encontrado" });
        }

        // 4. Se houveram alterações, insere o log na tabela 'eventos_alterados'
        if (Object.keys(camposAlterados).length > 0) {
            console.log('Inserindo log na tabela eventos_alterados...');
            const sqlLog = `
                INSERT INTO eventos_alterados (id_treino, usuario_id, campos_alterados)
                VALUES (?, ?, ?)
            `;
            await connection.query(sqlLog, [id, usuario_id, JSON.stringify(camposAlterados)]);
        }

        // Confirma a transação
        await connection.commit();
        console.log('Transação confirmada. Treino atualizado com sucesso.');
        res.json({ message: "Treino atualizado com sucesso" });

    } catch (err) {
        await connection.rollback(); // Em caso de erro, desfaz tudo
        console.error("Erro ao atualizar treino:", err);
        res.status(500).json({ error: "Erro interno ao atualizar treino" });
    } finally {
        if (connection) connection.release();
    }
});

// EXCLUIR TREINO - DELETE /api/treinos/:id
app.delete('/api/treinos/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
        // Inicia uma transação para garantir que ambas as exclusões ocorram
        await connection.beginTransaction();

        // 1. Exclui os registros de histórico na tabela 'eventos_alterados'
        const sqlLog = "DELETE FROM eventos_alterados WHERE id_treino = ?";
        await connection.query(sqlLog, [id]);

        // 2. Exclui o treino principal na tabela 'Treino'
        const sqlTreino = "DELETE FROM Treino WHERE id_treino = ?";
        const [resultTreino] = await connection.query(sqlTreino, [id]);

        // Se nenhum treino foi encontrado na tabela principal, desfaz a transação
        if (resultTreino.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Treino não encontrado" });
        }

        // Confirma a transação se tudo deu certo
        await connection.commit();
        res.json({ message: "Treino excluído com sucesso" });

    } catch (err) {
        await connection.rollback(); // Em caso de erro, desfaz tudo
        console.error("Erro ao excluir treino:", err);
        res.status(500).json({ error: "Erro interno ao excluir treino" });
    } finally {
        if (connection) connection.release(); // Libera a conexão de volta para o pool
    }
});

// ==================== INÍCIO DO SERVIDOR ====================

const listener = app.listen(process.env.PORT || port, () =>{
    console.log(`Servidor funcionando na porta ${listener.address().port}`);
});

listener.on('error', (err) => {
    console.error('Erro ao iniciar servidor:', err && err.message ? err.message : err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Porta ${process.env.PORT || port} já está em uso. Tente encerrar o processo que usa a porta ou rode com PORT=3001 node server.js`);
    }
    process.exit(1);
});

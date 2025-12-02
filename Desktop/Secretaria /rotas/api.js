// rotas/api.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { enviarEmailConfirmacao, enviarWhatsAppConfirmacao } = require('../notificacoes');

// Buscar paciente por CPF
router.get('/cpf/:cpf', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM pacientes WHERE cpf = ?", [req.params.cpf]);

        if (rows.length === 0) return res.status(404).send("Paciente não encontrado");

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao buscar paciente");
    }
});

// Listar todos pacientes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM pacientes");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao listar pacientes");
    }
});

// Criar paciente
router.post('/', async (req, res) => {
    const {
        nome,
        data_nascimento,
        sexo,
        cpf,
        rg,
        telefone,
        telefone_secundario,
        email,
        estado_civil,
        profissao
    } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO pacientes 
            (nome, data_nascimento, sexo, cpf, rg, telefone, telefone_secundario, email, estado_civil, profissao) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nome,
                data_nascimento,
                sexo,
                cpf,
                rg,
                telefone,
                telefone_secundario,
                email,
                estado_civil,
                profissao
            ]
        );

        res.status(201).json({
            id: result.insertId,
            nome
        });

    } catch (err) {
        console.error("Erro ao cadastrar paciente:", err);
        res.status(500).send("Erro ao cadastrar paciente");
    }
});

// Atualizar paciente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
        nome,
        data_nascimento,
        sexo,
        cpf,
        rg,
        telefone,
        telefone_secundario,
        email,
        estado_civil,
        profissao
    } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE pacientes 
            SET nome = ?, data_nascimento = ?, sexo = ?, cpf = ?, rg = ?, 
                telefone = ?, telefone_secundario = ?, email = ?, estado_civil = ?, profissao = ?
            WHERE id = ?`,
            [
                nome,
                data_nascimento,
                sexo,
                cpf,
                rg,
                telefone,
                telefone_secundario,
                email,
                estado_civil,
                profissao,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Paciente não encontrado' });
        }

        res.json({
            message: 'Paciente atualizado com sucesso!',
            id,
            nome
        });

    } catch (err) {
        console.error("Erro ao atualizar paciente:", err);
        res.status(500).json({ error: 'Erro ao atualizar paciente' });
    }
});

// Buscar paciente por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM pacientes WHERE id = ?", [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Paciente não encontrado" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar paciente" });
    }
});

// Criar agendamento
router.post('/agendamentos', async (req, res) => {
    const { paciente_id, servico, data, horario, observacoes } = req.body;
    
    try {
        // BUSCAR O ID DO SERVIÇO A PARTIR DO NOME
        const [servicoRows] = await db.query(
            "SELECT id FROM servicos WHERE nome = ? AND ativo = TRUE",
            [servico]
        );

        if (servicoRows.length === 0) {
            return res.status(400).json({ 
                error: "Serviço não encontrado",
                message: `O serviço "${servico}" não está disponível. Por favor, selecione outro serviço.`
            });
        }

        const servico_id = servicoRows[0].id;

        // VERIFICAR SE JÁ EXISTE AGENDAMENTO NO MESMO DIA E HORÁRIO
        const [agendamentosExistentes] = await db.query(
            "SELECT id FROM agendamentos WHERE data = ? AND horario = ?",
            [data, horario]
        );

        // Se já existe um agendamento nesse horário, retorna erro
        if (agendamentosExistentes.length > 0) {
            return res.status(409).json({ 
                error: "Horário já ocupado",
                message: "Já existe um agendamento para este dia e horário. Por favor, escolha outro horário."
            });
        }

        // Se o horário está disponível, cria o agendamento
        const [result] = await db.query(
            "INSERT INTO agendamentos (paciente_id, servico_id, data, horario, observacoes) VALUES (?, ?, ?, ?, ?)",
            [paciente_id, servico_id, data, horario, observacoes]
        );
        
        // BUSCAR DADOS DO PACIENTE PARA ENVIAR NOTIFICAÇÃO
        const [pacienteRows] = await db.query("SELECT * FROM pacientes WHERE id = ?", [paciente_id]);
        const paciente = pacienteRows[0];
        
        // BUSCAR NOME DO SERVIÇO
        const [servicoNomeRows] = await db.query("SELECT nome FROM servicos WHERE id = ?", [servico_id]);
        const servicoNome = servicoNomeRows[0]?.nome || servico;
        
        // Enviar notificação de confirmação (não aguarda para não travar a resposta)
        const dadosAgendamento = {
            data,
            horario,
            servico: servicoNome,
            observacoes
        };
        
        // Tentar enviar email (assíncrono)
        enviarEmailConfirmacao(paciente, dadosAgendamento)
            .then(resultado => {
                if (resultado.success) {
                    console.log('✅ Notificação enviada com sucesso');
                } else {
                    console.log('⚠️ Notificação não enviada:', resultado.message);
                }
            })
            .catch(err => console.error('❌ Erro ao enviar notificação:', err));
        
        // Tentar enviar WhatsApp se habilitado
        enviarWhatsAppConfirmacao(paciente, dadosAgendamento).catch(err => 
            console.error('❌ Erro ao enviar WhatsApp:', err)
        );
        
        res.status(201).json({ 
            id: result.insertId,
            message: "Agendamento criado com sucesso!" 
        });
    } catch (err) {
        console.error("Erro ao criar agendamento:", err);
        res.status(500).json({ 
            error: "Erro interno",
            message: err.message || "Erro ao criar agendamento" 
        });
    }
});

// Listar agendamentos
router.get('/agendamentos', async (req, res) => {
    try {
        // Tentar fazer JOIN com servicos, se falhar buscar sem JOIN
        let query = `
            SELECT 
                a.id,
                p.nome,
                p.telefone,
                s.nome as servico,
                a.data as data_agendamento,
                a.horario,
                a.observacoes,
                a.status
            FROM agendamentos a
            INNER JOIN pacientes p ON p.id = a.paciente_id
            LEFT JOIN servicos s ON s.id = a.servico_id
            ORDER BY a.data ASC, a.horario ASC
        `;
        
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Erro ao listar agendamentos:", err);
        res.status(500).json({ 
            error: "Erro ao listar agendamentos",
            message: err.message 
        });
    }
});

// Relatório completo de agendamentos (para impressão)
router.get('/agendamentos/relatorio', async (req, res) => {
    try {
        const { data_inicio, data_fim, status } = req.query;
        
        let query = `
            SELECT 
                a.id,
                a.data,
                a.horario,
                a.status,
                a.observacoes,
                p.nome as paciente_nome,
                p.cpf,
                p.telefone,
                p.telefone_secundario,
                p.email,
                p.data_nascimento,
                s.nome as servico,
                s.duracao
            FROM agendamentos a
            INNER JOIN pacientes p ON p.id = a.paciente_id
            LEFT JOIN servicos s ON s.id = a.servico_id
            WHERE 1=1
        `;
        
        const params = [];
        
        // Filtrar por data de início
        if (data_inicio) {
            query += ` AND a.data >= ?`;
            params.push(data_inicio);
        }
        
        // Filtrar por data fim
        if (data_fim) {
            query += ` AND a.data <= ?`;
            params.push(data_fim);
        }
        
        // Filtrar por status
        if (status) {
            query += ` AND a.status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY a.data ASC, a.horario ASC`;
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error("Erro ao gerar relatório:", err);
        res.status(500).json({ 
            error: "Erro ao gerar relatório",
            message: err.message 
        });
    }
});

// Buscar horários ocupados de uma data específica
router.get('/agendamentos/data/:data', async (req, res) => {
    try {
        const { data } = req.params;
        
        const [rows] = await db.query(`
            SELECT 
                a.id AS id,
                a.data,
                a.horario,
                a.status,
                a.observacoes,
                p.nome,
                p.id AS paciente_id,
                p.telefone,
                p.email,
                p.cpf,
                s.nome AS servico
            FROM agendamentos a
            INNER JOIN pacientes p ON p.id = a.paciente_id
            LEFT JOIN servicos s ON s.id = a.servico_id
            WHERE a.data = ?
            ORDER BY a.horario ASC
        `, [data]);
        
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar horários:", err);
        res.status(500).json({ 
            error: "Erro ao buscar horários",
            message: err.message 
        });
    }
});

// Buscar disponibilidade do mês (quantos agendamentos por dia)
router.get('/agendamentos/mes/:ano/:mes', async (req, res) => {
    try {
        const { ano, mes } = req.params;
        
        const [rows] = await db.query(`
            SELECT 
                a.data,
                COUNT(*) as total_agendamentos
            FROM agendamentos a
            WHERE YEAR(a.data) = ? AND MONTH(a.data) = ?
            GROUP BY a.data
        `, [ano, mes]);
        
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar disponibilidade:", err);
        res.status(500).json({ 
            error: "Erro ao buscar disponibilidade",
            message: err.message 
        });
    }
});

// Alterar status do agendamento
router.put('/agendamentos/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('📝 Recebida requisição para alterar status:', { id, status, body: req.body });
    
    // Validar status
    const statusValidos = ['pendente', 'confirmado', 'cancelado', 'concluido'];
    if (!statusValidos.includes(status)) {
        console.log('❌ Status inválido:', status);
        return res.status(400).json({ error: `Status inválido: "${status}". Use: ${statusValidos.join(', ')}` });
    }
    
    try {
        const [result] = await db.query(
            'UPDATE agendamentos SET status = ? WHERE id = ?',
            [status, id]
        );
        
        console.log('✅ Status atualizado com sucesso:', { id, status, affectedRows: result.affectedRows });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        
        res.json({ success: true, message: 'Status atualizado com sucesso' });
    } catch (err) {
        console.error("❌ Erro ao atualizar status:", err);
        res.status(500).json({ 
            error: "Erro ao atualizar status",
            message: err.message 
        });
    }
});

// Excluir agendamento
router.delete('/agendamentos/:id', async (req, res) => {
    const { id } = req.params;
    
    console.log('🗑️ Recebida requisição para excluir agendamento:', { id });
    
    try {
        const [result] = await db.query(
            'DELETE FROM agendamentos WHERE id = ?',
            [id]
        );
        
        console.log('✅ Agendamento excluído com sucesso:', { id, affectedRows: result.affectedRows });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }
        
        res.json({ success: true, message: 'Agendamento excluído com sucesso' });
    } catch (err) {
        console.error("❌ Erro ao excluir agendamento:", err);
        res.status(500).json({ 
            error: "Erro ao excluir agendamento",
            message: err.message 
        });
    }
});

module.exports = router;

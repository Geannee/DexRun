// rotas/auth.js - Rotas de autenticação
const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config');

// Configurar transporte de email
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: config.email.auth
});

// Gerar código de verificação de 6 dígitos
function gerarCodigoVerificacao() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/login - Solicitar login
router.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;
    
    console.log('🔐 Tentativa de login:', { usuario });
    
    try {
        // Buscar usuário no banco
        const [usuarios] = await db.query(
            'SELECT * FROM usuarios WHERE usuario = ? AND ativo = 1',
            [usuario]
        );
        
        if (usuarios.length === 0) {
            console.log('❌ Usuário não encontrado');
            return res.status(401).json({ error: 'Usuário ou senha incorretos' });
        }
        
        const user = usuarios[0];
        
        // Verificar senha (em produção, use bcrypt)
        if (user.senha !== senha) {
            console.log('❌ Senha incorreta');
            return res.status(401).json({ error: 'Usuário ou senha incorretos' });
        }
        
        // Gerar código de verificação
        const codigoVerificacao = gerarCodigoVerificacao();
        const expiraEm = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
        
        // Salvar código no banco
        await db.query(
            'UPDATE usuarios SET codigo_verificacao = ?, codigo_expira_em = ? WHERE id = ?',
            [codigoVerificacao, expiraEm, user.id]
        );
        
        // Enviar código por email
        const mailOptions = {
            from: config.email.from,
            to: user.email,
            subject: '🔐 Código de Verificação - Painel Administrativo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%); padding: 30px; border-radius: 10px; text-align: center;">
                        <h1 style="color: #D4AF37; font-size: 32px; margin: 0;">🦷 ${config.clinica.nome}</h1>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px;">
                        <h2 style="color: #1A1A1A; margin-top: 0;">Código de Verificação</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Olá, <strong>${user.nome}</strong>!
                        </p>
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Use o código abaixo para acessar o Painel Administrativo:
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8960F 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
                            <span style="color: #0A0A0A; font-size: 36px; font-weight: bold; letter-spacing: 8px;">
                                ${codigoVerificacao}
                            </span>
                        </div>
                        
                        <p style="color: #999; font-size: 14px; text-align: center;">
                            ⏰ Este código expira em <strong>10 minutos</strong>
                        </p>
                        
                        <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <strong>⚠️ Importante:</strong> Se você não solicitou este código, ignore este email.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>${config.clinica.nome}</p>
                        <p>${config.clinica.endereco}</p>
                        <p>📞 ${config.clinica.telefone}</p>
                    </div>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        console.log('✅ Código enviado para:', user.email);
        
        res.json({ 
            success: true, 
            message: 'Código de verificação enviado para seu email',
            email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Oculta parte do email
        });
        
    } catch (err) {
        console.error('❌ Erro no login:', err);
        res.status(500).json({ 
            error: 'Erro ao processar login',
            message: err.message 
        });
    }
});

// POST /api/auth/verificar - Verificar código
router.post('/verificar', async (req, res) => {
    const { usuario, codigo } = req.body;
    
    console.log('🔍 Verificando código:', { usuario, codigo });
    
    try {
        // Buscar usuário
        const [usuarios] = await db.query(
            'SELECT * FROM usuarios WHERE usuario = ? AND ativo = 1',
            [usuario]
        );
        
        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        
        const user = usuarios[0];
        
        // Verificar código
        if (user.codigo_verificacao !== codigo) {
            console.log('❌ Código incorreto');
            return res.status(401).json({ error: 'Código de verificação incorreto' });
        }
        
        // Verificar se expirou
        if (new Date() > new Date(user.codigo_expira_em)) {
            console.log('❌ Código expirado');
            return res.status(401).json({ error: 'Código expirado. Solicite um novo código.' });
        }
        
        // Limpar código usado
        await db.query(
            'UPDATE usuarios SET codigo_verificacao = NULL, codigo_expira_em = NULL, ultimo_acesso = NOW() WHERE id = ?',
            [user.id]
        );
        
        console.log('✅ Login autorizado para:', user.nome);
        
        // Retornar dados do usuário (sem senha)
        res.json({
            success: true,
            usuario: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                usuario: user.usuario,
                nivel: user.nivel
            }
        });
        
    } catch (err) {
        console.error('❌ Erro na verificação:', err);
        res.status(500).json({ 
            error: 'Erro ao verificar código',
            message: err.message 
        });
    }
});

module.exports = router;

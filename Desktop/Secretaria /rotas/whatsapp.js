// rotas/whatsapp.js - Webhook para responder mensagens do WhatsApp
const express = require('express');
const router = express.Router();

// Webhook para receber mensagens do WhatsApp (Evolution API ou similar) - DESABILITADO
router.post('/webhook', async (req, res) => {
    try {
        const { message, from } = req.body;
        
        console.log('📱 Mensagem recebida do WhatsApp (webhook desabilitado):', { from, message });
        
        // Auto-resposta desabilitada
        res.json({ success: true, disabled: true });
        return;
        
        // Mensagem de resposta automática (código mantido para referência)
        const respostaAutomatica = `
*Olá! 👋*

Obrigado por entrar em contato com nossa clínica! 🦷

Para agendar sua consulta de forma rápida e prática, acesse nosso sistema:

🔗 *Link de Agendamento:*
https://scabbily-cartographic-oma.ngrok-free.dev

✨ *É fácil e rápido:*
• Escolha o melhor dia
• Selecione o horário disponível
• Receba confirmação instantânea

📧 Você receberá a confirmação por email e WhatsApp!

_Qualquer dúvida, estou à disposição!_ 😊
        `.trim();
        
        // Retornar resposta para o sistema de WhatsApp
        res.json({
            success: true,
            reply: {
                to: from,
                message: respostaAutomatica
            }
        });
        
    } catch (error) {
        console.error('❌ Erro no webhook WhatsApp:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint de teste
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Webhook WhatsApp funcionando!',
        url: '/api/whatsapp/webhook'
    });
});

module.exports = router;

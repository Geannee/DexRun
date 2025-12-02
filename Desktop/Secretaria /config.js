// config.js - Configurações via .env para nuvem
require('dotenv').config();

const cfg = {
    email: {
        enabled: process.env.EMAIL_ENABLED ? process.env.EMAIL_ENABLED === 'true' : true,
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 465,
        secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : true,
        auth: {
            user: process.env.EMAIL_USER || 'geanne1976@gmail.com',
            pass: process.env.EMAIL_PASS || ''
        },
        from: process.env.EMAIL_FROM || 'Clínica Odontológica <geanne1976@gmail.com>'
    },

    whatsapp: {
        enabled: process.env.TWILIO_ENABLED ? process.env.TWILIO_ENABLED === 'true' : false,
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'
    },

    clinica: {
        nome: process.env.CLINICA_NOME || 'Clínica Odontológica',
        telefone: process.env.CLINICA_TELEFONE || '(61) 983116472',
        endereco: process.env.CLINICA_ENDERECO || 'Quadra 300 Conjunto 48 casa 10 -  Recanto das Emas - DF'
    }
};

module.exports = cfg;

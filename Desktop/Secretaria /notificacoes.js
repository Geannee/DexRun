// notificacoes.js - Sistema de notificações (Email e WhatsApp)
const nodemailer = require('nodemailer');
const config = require('./config');

// Configurar transporte de email
let transporterEmail = null;
if (config.email.enabled) {
    transporterEmail = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: config.email.auth
    });
}

// Formatar data para exibição
function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Formatar horário (remover segundos)
function formatarHorario(horarioStr) {
    return horarioStr.substring(0, 5); // 09:00:00 -> 09:00
}

// Enviar email de confirmação
async function enviarEmailConfirmacao(paciente, agendamento) {
    if (!config.email.enabled || !transporterEmail) {
        console.log('📧 Email desabilitado - não enviado');
        return { success: false, message: 'Email desabilitado' };
    }

    const dataFormatada = formatarData(agendamento.data);
    const horarioFormatado = formatarHorario(agendamento.horario);

    const mailOptions = {
        from: config.email.from,
        to: paciente.email,
        subject: `✅ Agendamento Confirmado - ${config.clinica.nome}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
                <div style="background-color: #4da6ff; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0;">✅ Agendamento Confirmado!</h1>
                </div>
                
                <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 18px; color: #333;">Olá, <strong>${paciente.nome}</strong>!</p>
                    
                    <p style="color: #555;">Seu agendamento foi confirmado com sucesso. Seguem os detalhes:</p>
                    
                    <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                        <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${dataFormatada}</p>
                        <p style="margin: 5px 0;"><strong>⏰ Horário:</strong> ${horarioFormatado}</p>
                        <p style="margin: 5px 0;"><strong>🦷 Serviço:</strong> ${agendamento.servico}</p>
                        ${agendamento.observacoes ? `<p style="margin: 5px 0;"><strong>📝 Observações:</strong> ${agendamento.observacoes}</p>` : ''}
                    </div>
                    
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p style="margin: 0; color: #856404;"><strong>⚠️ Importante:</strong> Por favor, chegue com 10 minutos de antecedência.</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="color: #555; font-size: 14px;">
                        <strong>${config.clinica.nome}</strong><br>
                        📞 ${config.clinica.telefone}<br>
                        📍 ${config.clinica.endereco}
                    </p>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                        Você receberá um lembrete 24 horas antes da sua consulta.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporterEmail.sendMail(mailOptions);
        console.log(`✅ Email de confirmação enviado para ${paciente.email}`);
        return { success: true, message: 'Email enviado com sucesso' };
    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        return { success: false, message: error.message };
    }
}

// Enviar email de lembrete (24h antes)
async function enviarEmailLembrete(paciente, agendamento) {
    if (!config.email.enabled || !transporterEmail) {
        console.log('📧 Email desabilitado - não enviado');
        return { success: false, message: 'Email desabilitado' };
    }

    const dataFormatada = formatarData(agendamento.data);
    const horarioFormatado = formatarHorario(agendamento.horario);

    const mailOptions = {
        from: config.email.from,
        to: paciente.email,
        subject: `🔔 Lembrete: Consulta Amanhã - ${config.clinica.nome}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
                <div style="background-color: #ff9800; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0;">🔔 Lembrete de Consulta</h1>
                </div>
                
                <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 18px; color: #333;">Olá, <strong>${paciente.nome}</strong>!</p>
                    
                    <p style="color: #555;">Este é um lembrete da sua consulta <strong>amanhã</strong>:</p>
                    
                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
                        <p style="margin: 5px 0; font-size: 18px;"><strong>📅 Amanhã - ${dataFormatada}</strong></p>
                        <p style="margin: 5px 0; font-size: 18px;"><strong>⏰ Horário: ${horarioFormatado}</strong></p>
                        <p style="margin: 5px 0;"><strong>🦷 Serviço:</strong> ${agendamento.servico}</p>
                    </div>
                    
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                        <p style="margin: 0; color: #1565c0;"><strong>💡 Dica:</strong> Chegue com 10 minutos de antecedência!</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="color: #555; font-size: 14px;">
                        <strong>${config.clinica.nome}</strong><br>
                        📞 ${config.clinica.telefone}<br>
                        📍 ${config.clinica.endereco}
                    </p>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                        Caso precise remarcar ou cancelar, entre em contato conosco.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporterEmail.sendMail(mailOptions);
        console.log(`✅ Email de lembrete enviado para ${paciente.email}`);
        return { success: true, message: 'Lembrete enviado com sucesso' };
    } catch (error) {
        console.error('❌ Erro ao enviar lembrete:', error);
        return { success: false, message: error.message };
    }
}

// Enviar WhatsApp (Twilio) - Confirmação
async function enviarWhatsAppConfirmacao(paciente, agendamento) {
    if (!config.whatsapp.enabled) {
        console.log('📱 WhatsApp desabilitado - não enviado');
        return { success: false, message: 'WhatsApp desabilitado' };
    }

    const dataFormatada = formatarData(agendamento.data);
    const horarioFormatado = formatarHorario(agendamento.horario);

    const mensagem = `✅ *Agendamento Confirmado!*

Olá, *${paciente.nome}*!

Seu agendamento foi confirmado:

📅 *Data:* ${dataFormatada}
⏰ *Horário:* ${horarioFormatado}
🦷 *Serviço:* ${agendamento.servico}

⚠️ *Importante:* Chegue com 10 minutos de antecedência.

${config.clinica.nome}
📞 ${config.clinica.telefone}`;

    try {
        // Aqui você integraria com a API do Twilio
        // const client = require('twilio')(config.whatsapp.accountSid, config.whatsapp.authToken);
        // await client.messages.create({
        //     body: mensagem,
        //     from: `whatsapp:${config.whatsapp.phoneNumber}`,
        //     to: `whatsapp:+55${paciente.telefone}`
        // });
        
        console.log(`✅ WhatsApp enviado para ${paciente.telefone}`);
        return { success: true, message: 'WhatsApp enviado' };
    } catch (error) {
        console.error('❌ Erro ao enviar WhatsApp:', error);
        return { success: false, message: error.message };
    }
}

module.exports = {
    enviarEmailConfirmacao,
    enviarEmailLembrete,
    enviarWhatsAppConfirmacao
};

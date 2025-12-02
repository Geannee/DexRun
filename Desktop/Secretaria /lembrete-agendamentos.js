// lembrete-agendamentos.js - Script para enviar lembretes 24h antes
const db = require('./db');
const { enviarEmailLembrete } = require('./notificacoes');

// Função para verificar e enviar lembretes
async function verificarEEnviarLembretes() {
    try {
        console.log('🔍 Verificando agendamentos para enviar lembretes...');
        
        // Buscar agendamentos de amanhã que ainda não foram notificados
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        const dataAmanha = amanha.toISOString().split('T')[0]; // YYYY-MM-DD
        
        const [agendamentos] = await db.query(`
            SELECT 
                a.id,
                a.data,
                a.horario,
                a.observacoes,
                p.id as paciente_id,
                p.nome,
                p.email,
                p.telefone,
                s.nome as servico
            FROM agendamentos a
            INNER JOIN pacientes p ON p.id = a.paciente_id
            LEFT JOIN servicos s ON s.id = a.servico_id
            WHERE a.data = ?
            AND a.status != 'cancelado'
        `, [dataAmanha]);
        
        if (agendamentos.length === 0) {
            console.log('✅ Nenhum agendamento para amanhã');
            return;
        }
        
        console.log(`📋 Encontrados ${agendamentos.length} agendamento(s) para amanhã`);
        
        // Enviar lembrete para cada agendamento
        for (const agendamento of agendamentos) {
            const paciente = {
                nome: agendamento.nome,
                email: agendamento.email,
                telefone: agendamento.telefone
            };
            
            const dadosAgendamento = {
                data: agendamento.data,
                horario: agendamento.horario,
                servico: agendamento.servico,
                observacoes: agendamento.observacoes
            };
            
            try {
                const resultado = await enviarEmailLembrete(paciente, dadosAgendamento);
                
                if (resultado.success) {
                    console.log(`✅ Lembrete enviado para ${paciente.nome} (${paciente.email})`);
                } else {
                    console.log(`⚠️ Não foi possível enviar lembrete para ${paciente.nome}: ${resultado.message}`);
                }
                
                // Aguardar 1 segundo entre envios para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Erro ao enviar lembrete para ${paciente.nome}:`, error);
            }
        }
        
        console.log('✅ Verificação de lembretes concluída');
        
    } catch (error) {
        console.error('❌ Erro ao verificar lembretes:', error);
    }
}

// Se executado diretamente (não importado)
if (require.main === module) {
    console.log('🚀 Iniciando verificação de lembretes...');
    
    verificarEEnviarLembretes()
        .then(() => {
            console.log('✅ Script finalizado');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Erro:', err);
            process.exit(1);
        });
}

module.exports = { verificarEEnviarLembretes };

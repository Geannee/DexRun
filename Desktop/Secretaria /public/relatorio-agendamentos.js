// relatorio-agendamentos.js

// Formatar data para exibição
function formatarData(dataStr) {
  if (!dataStr) return 'Data inválida';
  const dataSemHora = dataStr.split('T')[0];
  const [ano, mes, dia] = dataSemHora.split('-');
  if (!ano || !mes || !dia) return 'Data inválida';
  return `${dia}/${mes}/${ano}`;
}

// Formatar horário (remover segundos)
function formatarHorario(horarioStr) {
  if (!horarioStr) return '-';
  return horarioStr.substring(0, 5); // 09:00:00 -> 09:00
}

// Calcular idade
function calcularIdade(dataNascimento) {
  if (!dataNascimento) return '-';
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade + ' anos';
}

// Carregar relatório
async function carregarRelatorio() {
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;
  const status = document.getElementById('statusFiltro').value;
  
  // Montar URL com parâmetros
  let url = '/api/users/agendamentos/relatorio?';
  const params = [];
  
  if (dataInicio) params.push(`data_inicio=${dataInicio}`);
  if (dataFim) params.push(`data_fim=${dataFim}`);
  if (status) params.push(`status=${status}`);
  
  url += params.join('&');
  
  // Mostrar loading
  document.getElementById('loading').style.display = 'block';
  document.getElementById('listaAgendamentos').innerHTML = '';
  document.getElementById('nenhumResultado').style.display = 'none';
  document.getElementById('resumo').style.display = 'none';
  
  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error('Erro ao carregar relatório');
    }
    
    const agendamentos = await res.json();
    
    document.getElementById('loading').style.display = 'none';
    
    if (agendamentos.length === 0) {
      document.getElementById('nenhumResultado').style.display = 'block';
      return;
    }
    
    // Calcular resumo
    const totalPendentes = agendamentos.filter(a => a.status === 'pendente').length;
    const totalConfirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    const totalCancelados = agendamentos.filter(a => a.status === 'cancelado').length;
    
    document.getElementById('totalAgendamentos').textContent = agendamentos.length;
    document.getElementById('totalPendentes').textContent = totalPendentes;
    document.getElementById('totalConfirmados').textContent = totalConfirmados;
    document.getElementById('resumo').style.display = 'flex';
    
    // Renderizar agendamentos
    renderizarAgendamentos(agendamentos);
    
  } catch (error) {
    console.error('Erro ao carregar relatório:', error);
    document.getElementById('loading').textContent = 'Erro ao carregar relatório';
  }
}

// Renderizar lista de agendamentos
function renderizarAgendamentos(agendamentos) {
  const container = document.getElementById('listaAgendamentos');
  container.innerHTML = '';
  
  agendamentos.forEach(agendamento => {
    const card = document.createElement('div');
    card.className = 'agendamento-card';
    
    const statusClass = `status-${agendamento.status || 'pendente'}`;
    const statusTexto = (agendamento.status || 'pendente').toUpperCase();
    
    card.innerHTML = `
      <div class="agendamento-header">
        <div class="paciente-nome">👤 ${agendamento.paciente_nome}</div>
        <div class="data-hora">
          📅 ${formatarData(agendamento.data)} ⏰ ${formatarHorario(agendamento.horario)}
        </div>
      </div>
      
      <div class="agendamento-body">
        <div class="info-item">
          <span class="info-label">🦷 Serviço:</span>
          <span class="info-value">${agendamento.servico || 'Não informado'}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">📞 Telefone:</span>
          <span class="info-value">${agendamento.telefone || 'Não informado'}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">📱 Tel. Secundário:</span>
          <span class="info-value">${agendamento.telefone_secundario || '-'}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">📧 Email:</span>
          <span class="info-value">${agendamento.email || 'Não informado'}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">🆔 CPF:</span>
          <span class="info-value">${agendamento.cpf || '-'}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">🎂 Idade:</span>
          <span class="info-value">${calcularIdade(agendamento.data_nascimento)}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">⏱️ Duração:</span>
          <span class="info-value">${agendamento.duracao || '-'} minutos</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">📋 Status:</span>
          <span class="status-badge ${statusClass}">${statusTexto}</span>
        </div>
      </div>
      
      ${agendamento.observacoes ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e0e0e0;">
          <div class="info-label" style="margin-bottom: 5px;">📝 Observações:</div>
          <div style="color: #555; font-style: italic;">${agendamento.observacoes}</div>
        </div>
      ` : ''}
    `;
    
    container.appendChild(card);
  });
}

// Definir data de geração
document.getElementById('dataGeracao').textContent = new Date().toLocaleString('pt-BR');

// Definir data de hoje como padrão
const hoje = new Date().toISOString().split('T')[0];
document.getElementById('dataInicio').value = hoje;

// Carregar automaticamente ao abrir
carregarRelatorio();

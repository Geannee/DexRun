// ============================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// ============================================
(function verificarAutenticacao() {
  const adminLogado = localStorage.getItem('adminLogado');
  const loginTime = localStorage.getItem('adminLoginTime');
  
  // Verificar se está logado
  if (adminLogado !== 'true') {
    window.location.href = 'login.html';
    return;
  }
  
  // Verificar se a sessão expirou (24 horas)
  if (loginTime) {
    const horasDecorridas = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
    if (horasDecorridas > 24) {
      localStorage.removeItem('adminLogado');
      localStorage.removeItem('adminLoginTime');
      alert('Sua sessão expirou. Por favor, faça login novamente.');
      window.location.href = 'login.html';
      return;
    }
  }
})();

// Função para fazer logout
function logout() {
  if (confirm('Deseja sair do painel administrativo?')) {
    localStorage.removeItem('adminLogado');
    localStorage.removeItem('adminLoginTime');
    window.location.href = 'login.html';
  }
}

// ============================================
// SISTEMA DE TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'success') {
  // Criar container se não existir
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Criar toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(toast);
  
  // Auto-remover após 4 segundos
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Gerenciamento de seções
const menuItems = document.querySelectorAll('.menu-item');
const secoes = document.querySelectorAll('.secao-admin');

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    const secaoAlvo = item.dataset.secao;
    
    // Remove active de todos
    menuItems.forEach(m => m.classList.remove('active'));
    secoes.forEach(s => s.classList.remove('active'));
    
    // Adiciona active no clicado
    item.classList.add('active');
    document.getElementById(`secao-${secaoAlvo}`).classList.add('active');
  });
});

// ============================================
// SEÇÃO 1: AGENDA DE CONSULTAS
// ============================================

// Definir data padrão (hoje e +30 dias)
const hoje = new Date().toISOString().split('T')[0];
const daquiA30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
document.getElementById('dataInicio').value = hoje;
document.getElementById('dataFim').value = daquiA30Dias;

// Carregar agenda ao iniciar
carregarAgenda();

document.getElementById('btnFiltrarAgenda').addEventListener('click', carregarAgenda);

async function carregarAgenda() {
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;
  const status = document.getElementById('filtroStatus').value;
  
  const loadingEl = document.getElementById('loadingAgenda');
  const tabelaEl = document.getElementById('tabelaAgenda');
  const listaEl = document.getElementById('listaAgenda');
  
  loadingEl.style.display = 'block';
  tabelaEl.style.display = 'none';
  
  try {
    let url = '/api/users/agendamentos/relatorio?';
    if (dataInicio) url += `data_inicio=${dataInicio}&`;
    if (dataFim) url += `data_fim=${dataFim}&`;
    if (status) url += `status=${status}`;
    
    const response = await fetch(url);
    const agendamentos = await response.json();
    
    loadingEl.style.display = 'none';
    
    if (agendamentos.length === 0) {
      listaEl.innerHTML = '<tr><td colspan="7" style="text-align:center">Nenhum agendamento encontrado</td></tr>';
      tabelaEl.style.display = 'block';
      return;
    }
    
    listaEl.innerHTML = agendamentos.map(a => `
      <tr>
        <td>${formatarData(a.data)}</td>
        <td>${a.horario}</td>
        <td>${a.paciente_nome}</td>
        <td>${a.telefone || '—'}</td>
        <td>${a.servico || '—'}</td>
        <td><span class="status-badge status-${a.status}">${a.status}</span></td>
        <td>
          ${a.status === 'pendente' ? `<button class="btn-acao btn-confirmar" onclick="alterarStatus(${a.id}, 'confirmado')">✓ Confirmar</button>` : ''}
          ${a.status === 'confirmado' ? `<button class="btn-acao btn-concluir" onclick="alterarStatus(${a.id}, 'concluido')">✓ Concluir</button>` : ''}
          ${a.status !== 'cancelado' && a.status !== 'concluido' ? `<button class="btn-acao btn-cancelar" onclick="alterarStatus(${a.id}, 'cancelado')">✗ Cancelar</button>` : ''}
          <button class="btn-acao btn-excluir" onclick="excluirAgendamento(${a.id})">🗑️ Excluir</button>
        </td>
      </tr>
    `).join('');
    
    tabelaEl.style.display = 'block';
    
  } catch (error) {
    console.error('Erro ao carregar agenda:', error);
    loadingEl.innerHTML = '<p style="color: #f44336;">Erro ao carregar agenda</p>';
  }
}

async function alterarStatus(agendamentoId, novoStatus) {
  if (!confirm(`Deseja alterar o status para "${novoStatus}"?`)) return;
  
  try {
    const response = await fetch(`/api/users/agendamentos/${agendamentoId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    });
    
    if (response.ok) {
      showToast('Status atualizado com sucesso!', 'success');
      // Atualiza a agenda e, se a seção Pacientes do Dia estiver ativa, atualiza também
      carregarAgenda();
      const secPacientes = document.getElementById('secao-pacientes-dia');
      if (secPacientes && secPacientes.classList.contains('active')) {
        buscarPacientesDia();
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro ao atualizar status:', response.status, errorData);
      showToast(errorData.error || 'Erro ao atualizar status', 'error');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    showToast('Erro ao atualizar status: ' + error.message, 'error');
  }
}

async function excluirAgendamento(agendamentoId) {
  if (!confirm('⚠️ Tem certeza que deseja EXCLUIR este agendamento? Esta ação não pode ser desfeita.')) return;
  
  try {
    const response = await fetch(`/api/users/agendamentos/${agendamentoId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      showToast('Agendamento excluído com sucesso!', 'success');
      carregarAgenda();
      const secPacientes = document.getElementById('secao-pacientes-dia');
      if (secPacientes && secPacientes.classList.contains('active')) {
        buscarPacientesDia();
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro ao excluir agendamento:', response.status, errorData);
      showToast(errorData.error || 'Erro ao excluir agendamento', 'error');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    showToast('Erro ao excluir agendamento: ' + error.message, 'error');
  }
}

function formatarData(valor) {
  if (!valor) return '—';
  // Se vier como string 'YYYY-MM-DD' ou com hora, extrai por regex para evitar timezone
  if (typeof valor === 'string') {
    const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  }
  // Fallback: tenta construir Date e formatar em UTC para não deslocar o dia
  const d = new Date(valor);
  if (isNaN(d.getTime())) return String(valor);
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const ano = d.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

// ============================================
// SEÇÃO 2: CONFIGURAÇÃO DE HORÁRIOS
// ============================================

// Salvar configuração de horários (localStorage por enquanto)
document.getElementById('btnSalvarHorarios').addEventListener('click', () => {
  const configuracao = {
    segunda: {
      ativo: document.getElementById('segunda').checked,
      inicio: document.querySelector('#segunda').parentElement.querySelector('.hora-inicio').value,
      fim: document.querySelector('#segunda').parentElement.querySelector('.hora-fim').value
    },
    terca: {
      ativo: document.getElementById('terca').checked,
      inicio: document.querySelector('#terca').parentElement.querySelector('.hora-inicio').value,
      fim: document.querySelector('#terca').parentElement.querySelector('.hora-fim').value
    },
    quarta: {
      ativo: document.getElementById('quarta').checked,
      inicio: document.querySelector('#quarta').parentElement.querySelector('.hora-inicio').value,
      fim: document.querySelector('#quarta').parentElement.querySelector('.hora-fim').value
    },
    quinta: {
      ativo: document.getElementById('quinta').checked,
      inicio: document.querySelector('#quinta').parentElement.querySelector('.hora-inicio').value,
      fim: document.querySelector('#quinta').parentElement.querySelector('.hora-fim').value
    },
    sexta: {
      ativo: document.getElementById('sexta').checked,
      inicio: document.querySelector('#sexta').parentElement.querySelector('.hora-inicio').value,
      fim: document.querySelector('#sexta').parentElement.querySelector('.hora-fim').value
    },
    sabado: {
      ativo: document.getElementById('sabado').checked,
      inicio: document.querySelector('#sabado').parentElement.querySelector('.hora-inicio').value,
      fim: document.querySelector('#sabado').parentElement.querySelector('.hora-fim').value
    },
    domingo: {
      ativo: document.getElementById('domingo').checked,
      inicio: document.querySelector('#domingo').parentElement.querySelector('.hora-inicio').value,
      fim: document.querySelector('#domingo').parentElement.querySelector('.hora-fim').value
    }
  };
  
  localStorage.setItem('configHorarios', JSON.stringify(configuracao));
  
  const mensagem = document.getElementById('mensagemHorarios');
  mensagem.textContent = '✓ Configuração salva com sucesso!';
  mensagem.className = 'success';
  
  setTimeout(() => {
    mensagem.textContent = '';
    mensagem.className = '';
  }, 3000);
});

// Bloquear data
document.getElementById('btnBloquearData').addEventListener('click', () => {
  const data = document.getElementById('dataBloqueio').value;
  const motivo = document.getElementById('motivoBloqueio').value;
  
  if (!data) {
    showToast('Selecione uma data', 'warning');
    return;
  }
  
  const bloqueios = JSON.parse(localStorage.getItem('datasBloqueadas') || '[]');
  bloqueios.push({ data, motivo: motivo || 'Sem motivo especificado' });
  localStorage.setItem('datasBloqueadas', JSON.stringify(bloqueios));
  
  showToast('Data bloqueada com sucesso!', 'success');
  
  document.getElementById('dataBloqueio').value = '';
  document.getElementById('motivoBloqueio').value = '';
  
  carregarBloqueios();
});

function carregarBloqueios() {
  const bloqueios = JSON.parse(localStorage.getItem('datasBloqueadas') || '[]');
  const lista = document.getElementById('listaBloqueios');
  
  if (bloqueios.length === 0) {
    lista.innerHTML = '<p style="color: #999; text-align: center;">Nenhuma data bloqueada</p>';
    return;
  }
  
  lista.innerHTML = bloqueios.map((b, index) => `
    <div class="bloqueio-item">
      <div class="bloqueio-info">
        <strong>${formatarData(b.data)}</strong> - ${b.motivo}
      </div>
      <button class="btn-excluir-sm" onclick="removerBloqueio(${index})">🗑️ Excluir</button>
    </div>
  `).join('');
}

function removerBloqueio(index) {
  const bloqueios = JSON.parse(localStorage.getItem('datasBloqueadas') || '[]');
  bloqueios.splice(index, 1);
  localStorage.setItem('datasBloqueadas', JSON.stringify(bloqueios));
  carregarBloqueios();
}

// Carregar bloqueios ao iniciar
carregarBloqueios();

// ============================================
// SEÇÃO 3: PACIENTES DO DIA
// ============================================

// Definir data padrão como hoje
document.getElementById('dataPacientes').value = hoje;

document.getElementById('btnBuscarPacientesDia').addEventListener('click', buscarPacientesDia);

async function buscarPacientesDia() {
  const data = document.getElementById('dataPacientes').value;
  
  if (!data) {
    showToast('Selecione uma data', 'warning');
    return;
  }
  
  const loadingEl = document.getElementById('loadingPacientes');
  const resultadoEl = document.getElementById('resultadoPacientesDia');
  const btnImprimir = document.getElementById('btnImprimirDia');
  
  loadingEl.style.display = 'block';
  resultadoEl.innerHTML = '';
  btnImprimir.style.display = 'none';
  
  try {
    const response = await fetch(`/api/users/agendamentos/data/${data}`);
    const pacientes = await response.json();
    
    loadingEl.style.display = 'none';
    
    if (pacientes.length === 0) {
      resultadoEl.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Nenhum paciente agendado para esta data</p>';
      return;
    }
    
    // Cabeçalho
    resultadoEl.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid var(--dourado);">
        <h3 style="color: var(--dourado); font-size: 24px; margin-bottom: 10px;">
          📅 Pacientes Agendados - ${formatarData(data)}
        </h3>
        <p style="color: var(--dourado-claro); font-size: 16px;">
          Total: ${pacientes.length} paciente(s)
        </p>
      </div>
    `;
    
    // Cards dos pacientes
    pacientes.forEach(p => {
      const horaFmt = p.horario ? String(p.horario).slice(0,5) : '-';
      const dataFmt = p.data ? formatarData(p.data) : formatarData(data);
      resultadoEl.innerHTML += `
        <div class="paciente-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4>⏰ ${horaFmt} - ${p.nome}</h4>
            <span class="status-badge status-${p.status}">${p.status}</span>
          </div>
          <div class="paciente-info">
            <p><strong>📅 Data:</strong> ${dataFmt}</p>
            <p><strong>⏰ Horário:</strong> ${horaFmt}</p>
            <p><strong>📞 Telefone:</strong> ${p.telefone}</p>
            <p><strong>📧 Email:</strong> ${p.email || 'Não informado'}</p>
            <p><strong>🦷 Procedimento:</strong> ${p.servico}</p>
          </div>
          <div class="acoes-card">
            <a class="btn-secondary" href="cadastro.html?id=${p.paciente_id}">📝 Ficha</a>
            <button class="btn-primary" onclick="alterarStatus(${p.id}, 'confirmado')">✓ Confirmar</button>
            <button class="btn-concluir" onclick="alterarStatus(${p.id}, 'concluido')">✓ Concluir</button>
            <button class="btn-cancelar" onclick="alterarStatus(${p.id}, 'cancelado')">✗ Cancelar</button>
          </div>
          ${p.observacoes ? `<p style="margin-top: 10px; color: var(--dourado-claro); font-style: italic;"><strong>Obs:</strong> ${p.observacoes}</p>` : ''}
        </div>
      `;
    });
    
    btnImprimir.style.display = 'inline-block';
    
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    loadingEl.innerHTML = '<p style="color: #f44336;">Erro ao buscar pacientes</p>';
  }
}

document.getElementById('btnImprimirDia').addEventListener('click', () => {
  window.print();
});

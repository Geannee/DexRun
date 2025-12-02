// Estado global
let pacienteSelecionado = null;
let servicoSelecionado = null;
let dataSelecionada = null;
let horarioSelecionado = null;
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
let disponibilidadeMes = {};

// Função auxiliar para formatar data do MySQL (YYYY-MM-DD) para DD/MM/YYYY
function formatarData(dataStr) {
  if (!dataStr) return 'Data inválida';
  
  // Se já vier com T00:00:00, remove
  const dataSemHora = dataStr.split('T')[0];
  const [ano, mes, dia] = dataSemHora.split('-');
  
  if (!ano || !mes || !dia) return 'Data inválida';
  
  return `${dia}/${mes}/${ano}`;
}

// Buscar paciente por CPF
async function buscarPacientePorCPF(cpf) {
  const res = await fetch(`/api/users/cpf/${cpf}`);
  if (!res.ok) return null;
  return await res.json();
}

// Buscar disponibilidade do mês
async function buscarDisponibilidadeMes(ano, mes) {
  const res = await fetch(`/api/users/agendamentos/mes/${ano}/${mes + 1}`);
  const dados = await res.json();
  
  disponibilidadeMes = {};
  dados.forEach(d => {
    disponibilidadeMes[d.data] = d.total_agendamentos;
  });
  
  console.log('📊 Disponibilidade do mês:', disponibilidadeMes);
  
  return disponibilidadeMes;
}

// Buscar horários ocupados de uma data
async function buscarHorariosOcupados(data) {
  const res = await fetch(`/api/users/agendamentos/data/${data}`);
  return await res.json();
}

// Verificar se data está bloqueada pelo administrador
function verificarDataBloqueada(dataStr) {
  const bloqueios = JSON.parse(localStorage.getItem('datasBloqueadas') || '[]');
  return bloqueios.some(b => b.data === dataStr);
}

// Verificar dias de trabalho configurados
function verificarDiaTrabalho(dataStr) {
  const config = JSON.parse(localStorage.getItem('configHorarios') || '{}');
  const data = new Date(dataStr + 'T00:00:00');
  const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const diaSemana = diasSemana[data.getDay()];
  
  // Se não há configuração, considera todos os dias como disponíveis
  if (!config[diaSemana]) return true;
  
  // Retorna se o dia está ativo
  return config[diaSemana].ativo === true;
}

// Renderizar calendário
async function renderizarCalendario() {
  const primeiroDia = new Date(anoAtual, mesAtual, 1);
  const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const diaSemanaInicio = primeiroDia.getDay();
  
  // Atualizar título
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  document.getElementById('mesAnoTitulo').textContent = `${meses[mesAtual]} ${anoAtual}`;
  
  // Buscar disponibilidade
  await buscarDisponibilidadeMes(anoAtual, mesAtual);
  
  // Renderizar dias
  const calendario = document.getElementById('calendario');
  calendario.innerHTML = '';
  
  // Cabeçalho dos dias da semana
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  diasSemana.forEach(dia => {
    const divDia = document.createElement('div');
    divDia.className = 'dia-semana';
    divDia.textContent = dia;
    calendario.appendChild(divDia);
  });
  
  // Espaços vazios antes do primeiro dia
  for (let i = 0; i < diaSemanaInicio; i++) {
    const divVazio = document.createElement('div');
    divVazio.className = 'dia-vazio';
    calendario.appendChild(divVazio);
  }
  
  // Dias do mês
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dataAtual = new Date(anoAtual, mesAtual, dia);
    dataAtual.setHours(0, 0, 0, 0);
    const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    
    const divDia = document.createElement('div');
    divDia.className = 'dia-mes';
    divDia.textContent = dia;
    
    // Desabilitar dias passados
    if (dataAtual < hoje) {
      divDia.classList.add('passado');
    } else {
      // Verificar se data está bloqueada pelo administrador
      const dataBloqueada = verificarDataBloqueada(dataStr);
      const diaDeTrabalho = verificarDiaTrabalho(dataStr);
      
      if (dataBloqueada || !diaDeTrabalho) {
        divDia.classList.add('bloqueado');
        divDia.style.cursor = 'not-allowed';
        divDia.title = dataBloqueada ? 'Data bloqueada pelo administrador' : 'Dia sem atendimento';
        console.log(`🚫 Dia ${dia} BLOQUEADO`);
      } else {
        // Verificar disponibilidade
        const totalAgendamentos = disponibilidadeMes[dataStr] || 0;
        const horariosTotal = 9; // 09:00 às 17:00 = 9 horários (09, 10, 11, 12, 13, 14, 15, 16, 17)
        
        if (totalAgendamentos >= horariosTotal) {
          divDia.classList.add('lotado'); // Vermelho - Sem vagas
          divDia.style.cursor = 'not-allowed';
          divDia.title = 'Dia lotado - Todos os horários ocupados';
          console.log(`🔴 Dia ${dia} LOTADO: ${totalAgendamentos}/${horariosTotal} agendamentos`);
          // Não adiciona evento de clique em dias lotados
        } else if (totalAgendamentos > 0) {
          divDia.classList.add('parcial'); // Amarelo - Parcialmente ocupado
          divDia.title = `${horariosTotal - totalAgendamentos} horário(s) disponível(is)`;
          console.log(`🟡 Dia ${dia} PARCIAL: ${totalAgendamentos}/${horariosTotal} agendamentos`);
          divDia.addEventListener('click', () => selecionarDia(dataStr));
        } else {
          divDia.classList.add('disponivel'); // Verde - Totalmente livre
          divDia.title = 'Dia disponível';
          divDia.addEventListener('click', () => selecionarDia(dataStr));
        }
      }
    }
    
    calendario.appendChild(divDia);
  }
}

// Selecionar um dia do calendário
async function selecionarDia(data) {
  // Verificar se a data está bloqueada
  if (verificarDataBloqueada(data) || !verificarDiaTrabalho(data)) {
    alert('Esta data está bloqueada e não está disponível para agendamentos.');
    return;
  }
  
  // Verificar se o dia está lotado
  const dataStr = data;
  const totalAgendamentos = disponibilidadeMes[dataStr] || 0;
  const horariosTotal = 9;
  
  if (totalAgendamentos >= horariosTotal) {
    alert('Este dia está totalmente lotado. Todos os horários já foram preenchidos. Por favor, escolha outra data.');
    return;
  }
  
  dataSelecionada = data;
  
  // Remover seleção anterior
  document.querySelectorAll('.dia-mes').forEach(d => d.classList.remove('selecionado'));
  event.target.classList.add('selecionado');
  
  // Mostrar horários disponíveis
  await mostrarHorarios(data);

  // Atualizar resumo de data no card do paciente (se existir)
  const resumoDataEl = document.getElementById('resumoData');
  if (resumoDataEl) {
    resumoDataEl.innerHTML = `<b>Data:</b> ${formatarData(dataSelecionada)}`;
  }
  // Atualizar bloco de resumo
  atualizarResumoAgendamento();
}

// Mostrar horários disponíveis do dia
async function mostrarHorarios(data) {
  const horariosOcupados = await buscarHorariosOcupados(data);
  const horariosOcupadosSet = new Set(horariosOcupados.map(h => h.horario));
  
  const container = document.getElementById('horariosContainer');
  const grid = document.getElementById('horariosGrid');
  const dataFormatada = formatarData(data);
  
  document.getElementById('dataSelecionada').textContent = dataFormatada;
  
  grid.innerHTML = '';
  
  const horariosTotal = 9; // 09:00 às 17:00
  let horariosDisponiveis = 0;
  
  // Gerar horários de 09:00 às 17:00
  for (let hora = 9; hora <= 17; hora++) {
    const horario = `${String(hora).padStart(2, '0')}:00:00`;
    const horarioExibicao = `${String(hora).padStart(2, '0')}:00`;
    
    const divHorario = document.createElement('div');
    divHorario.className = 'horario-slot';
    divHorario.textContent = horarioExibicao;
    
    if (horariosOcupadosSet.has(horario)) {
      divHorario.classList.add('ocupado');
      divHorario.title = 'Horário já agendado';
      divHorario.style.cursor = 'not-allowed';
    } else {
      horariosDisponiveis++;
      divHorario.classList.add('livre');
      divHorario.addEventListener('click', () => selecionarHorario(horario, horarioExibicao));
    }
    
    grid.appendChild(divHorario);
  }
  
  // Se não há horários disponíveis, exibir mensagem
  if (horariosDisponiveis === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--dourado-claro); padding: 20px;">Todos os horários deste dia estão ocupados. Por favor, selecione outra data.</p>';
  }
  
  container.style.display = 'block';
  horarioSelecionado = null;
  document.getElementById('observacoesContainer').style.display = 'none';
}

// Selecionar horário
function selecionarHorario(horario, horarioExibicao) {
  horarioSelecionado = horario;
  
  // Remover seleção anterior
  document.querySelectorAll('.horario-slot').forEach(h => h.classList.remove('selecionado'));
  event.target.classList.add('selecionado');
  
  // Mostrar campo de observações
  document.getElementById('observacoesContainer').style.display = 'block';

  // Atualizar resumo de horário no card do paciente (se existir)
  const resumoHoraEl = document.getElementById('resumoHorario');
  if (resumoHoraEl) {
    resumoHoraEl.innerHTML = `<b>Horário:</b> ${horarioExibicao}`;
  }
  // Atualizar bloco de resumo
  atualizarResumoAgendamento();
}

// Evento CPF - busca paciente quando sair do campo
document.getElementById("cpfInput").addEventListener("blur", async () => {
  const cpf = cpfInput.value.trim();
  
  // Limpar mensagens anteriores
  pacienteInfo.innerHTML = "";
  cpfInput.dataset.pacienteId = "";
  
  // Se o campo estiver vazio, não faz nada
  if (!cpf) return;
  
  // Buscar paciente pelo CPF
  const paciente = await buscarPacientePorCPF(cpf);

  if (paciente) {
    // PACIENTE ENCONTRADO - Mostra os dados
    pacienteSelecionado = paciente;
    pacienteInfo.innerHTML = `
      <div class="paciente-encontrado">
        <p>✅ <b>Paciente encontrado!</b></p>
        <p><b>Nome:</b> ${paciente.nome}</p>
        <p><b>Telefone:</b> ${paciente.telefone}</p>
        <p><b>E-mail:</b> ${paciente.email || 'Não informado'}</p>
        <p id="resumoData"><b>Data:</b> ${dataSelecionada ? formatarData(dataSelecionada) : '—'}</p>
        <p id="resumoHorario"><b>Horário:</b> ${horarioSelecionado ? (horarioSelecionado.slice(0,5)) : '—'}</p>
      </div>
    `;
    // Mostrar seleção de serviço
    document.getElementById('selecaoServico').style.display = 'block';
    // Atualizar resumo do agendamento (telefone, e-mail, data, horário)
    atualizarResumoAgendamento();
  } else {
    // PACIENTE NÃO ENCONTRADO - Mostra mensagem e botão para cadastro
    pacienteSelecionado = null;
    pacienteInfo.innerHTML = `
      <div class="paciente-nao-encontrado">
        <p style="color: #d32f2f; font-weight: bold;">❌ CPF não cadastrado!</p>
        <p>Este CPF não está no sistema. Por favor, cadastre o paciente primeiro.</p>
        <button type="button" onclick="window.location.href='cadastro.html'" class="btnCadastrar">
          ➕ Ir para Cadastro
        </button>
      </div>
    `;
    document.getElementById('selecaoServico').style.display = 'none';
    document.getElementById('calendarioContainer').style.display = 'none';
    // Esconder resumo
    const resumo = document.getElementById('resumoAgendamento');
    if (resumo) resumo.style.display = 'none';
  }
});

// Evento de seleção de serviço
document.getElementById('servicoSelect').addEventListener('change', async (e) => {
  servicoSelecionado = e.target.value;
  
  if (servicoSelecionado) {
    // Mostrar calendário
    document.getElementById('calendarioContainer').style.display = 'block';
    await renderizarCalendario();
  }
});

// Navegação do calendário
document.getElementById('mesAnterior').addEventListener('click', async () => {
  mesAtual--;
  if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  }
  await renderizarCalendario();
});

document.getElementById('mesSeguinte').addEventListener('click', async () => {
  mesAtual++;
  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  }
  await renderizarCalendario();
});

// Confirmar agendamento
document.getElementById('btnConfirmarAgendamento').addEventListener('click', async () => {
  if (!pacienteSelecionado || !servicoSelecionado || !dataSelecionada || !horarioSelecionado) {
    alert('Por favor, preencha todas as informações!');
    return;
  }

  const body = {
    paciente_id: pacienteSelecionado.id,
    servico: servicoSelecionado,
    data: dataSelecionada,
    horario: horarioSelecionado,
    observacoes: document.getElementById('obsInput').value
  };

  const formMsg = document.getElementById('formMsg');
  
  try {
    const res = await fetch("/api/users/agendamentos", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body)
    });

    if (res.ok) {
      // AGENDAMENTO CRIADO COM SUCESSO
      formMsg.textContent = "✅ Agendamento realizado com sucesso!";
      formMsg.className = "msg success";
      
      // Limpar formulário
      document.getElementById('cpfInput').value = '';
      document.getElementById('servicoSelect').value = '';
      document.getElementById('obsInput').value = '';
      document.getElementById('pacienteInfo').innerHTML = '';
      document.getElementById('selecaoServico').style.display = 'none';
      document.getElementById('calendarioContainer').style.display = 'none';
      document.getElementById('horariosContainer').style.display = 'none';
      document.getElementById('observacoesContainer').style.display = 'none';
      
      pacienteSelecionado = null;
      servicoSelecionado = null;
      dataSelecionada = null;
      horarioSelecionado = null;
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => {
        formMsg.textContent = '';
        formMsg.className = '';
      }, 5000);
      
    } else if (res.status === 409) {
      // HORÁRIO JÁ OCUPADO (conflito)
      const errorData = await res.json();
      formMsg.textContent = `⚠️ ${errorData.message}`;
      formMsg.className = "msg error";
    } else {
      // OUTRO ERRO
      const errorData = await res.json().catch(() => ({ message: "Erro ao agendar" }));
      formMsg.textContent = `❌ ${errorData.message || "Erro ao agendar!"}`;
      formMsg.className = "msg error";
    }
  } catch (err) {
    formMsg.textContent = `❌ Erro de conexão: ${err.message}`;
    formMsg.className = "msg error";
  }
});

// Monta o resumo com telefone, e-mail, data e horário
function atualizarResumoAgendamento() {
  const resumo = document.getElementById('resumoAgendamento');
  if (!resumo) return;

  if (!pacienteSelecionado) {
    resumo.style.display = 'none';
    return;
  }

  const nome = pacienteSelecionado.nome || '-';
  const telefone = pacienteSelecionado.telefone || '-';
  const email = pacienteSelecionado.email || 'Não informado';
  const dataTxt = dataSelecionada ? formatarData(dataSelecionada) : '—';
  const horaTxt = horarioSelecionado ? horarioSelecionado.slice(0,5) : '—';

  resumo.innerHTML = `
    <h4>Resumo do Agendamento</h4>
    <div class="resumo-grid">
      <div class="resumo-item"><strong>Paciente:</strong> ${nome}</div>
      <div class="resumo-item"><strong>Telefone:</strong> ${telefone}</div>
      <div class="resumo-item"><strong>E-mail:</strong> ${email}</div>
      <div class="resumo-item"><strong>Data:</strong> ${dataTxt}</div>
      <div class="resumo-item"><strong>Horário:</strong> ${horaTxt}</div>
    </div>
  `;
  resumo.style.display = 'block';
}

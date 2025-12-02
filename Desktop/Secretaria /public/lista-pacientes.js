// lista-pacientes.js
let todosOsPacientes = [];

// Carregar lista de pacientes
async function carregarPacientes() {
  try {
    const res = await fetch('/api/users');
    
    if (!res.ok) {
      throw new Error('Erro ao carregar pacientes');
    }
    
    todosOsPacientes = await res.json();
    
    document.getElementById('loading').style.display = 'none';
    
    if (todosOsPacientes.length === 0) {
      document.getElementById('mensagemVazio').style.display = 'block';
      document.getElementById('tabelaPacientes').style.display = 'none';
    } else {
      document.getElementById('mensagemVazio').style.display = 'none';
      document.getElementById('tabelaPacientes').style.display = 'table';
      renderizarPacientes(todosOsPacientes);
    }
    
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error);
    document.getElementById('loading').textContent = 'Erro ao carregar pacientes';
  }
}

// Renderizar lista de pacientes na tabela
function renderizarPacientes(pacientes) {
  const tbody = document.getElementById('listaPacientes');
  tbody.innerHTML = '';
  
  if (pacientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum paciente encontrado</td></tr>';
    return;
  }
  
  pacientes.forEach(paciente => {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td><strong>${paciente.nome}</strong></td>
      <td>${paciente.cpf || '-'}</td>
      <td>${paciente.telefone || '-'}</td>
      <td>${paciente.email || '-'}</td>
      <td>
        <button class="btn-editar" onclick="editarPaciente(${paciente.id})">
          ✏️ Editar
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
}

// Redirecionar para página de edição
function editarPaciente(id) {
  window.location.href = `cadastro.html?id=${id}`;
}

// Busca em tempo real
document.getElementById('buscaInput').addEventListener('input', (e) => {
  const termo = e.target.value.toLowerCase().trim();
  
  if (!termo) {
    renderizarPacientes(todosOsPacientes);
    return;
  }
  
  const pacientesFiltrados = todosOsPacientes.filter(p => {
    return (
      (p.nome && p.nome.toLowerCase().includes(termo)) ||
      (p.cpf && p.cpf.includes(termo)) ||
      (p.telefone && p.telefone.includes(termo)) ||
      (p.email && p.email.toLowerCase().includes(termo))
    );
  });
  
  renderizarPacientes(pacientesFiltrados);
});

// Carregar ao iniciar
carregarPacientes();

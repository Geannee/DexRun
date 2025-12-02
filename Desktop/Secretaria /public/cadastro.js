// Verificar se está em modo de edição (URL com ?id=123)
const urlParams = new URLSearchParams(window.location.search);
const pacienteId = urlParams.get('id');
let modoEdicao = false;

// Se tem ID na URL, carregar dados do paciente
if (pacienteId) {
  modoEdicao = true;
  document.getElementById('tituloForm').textContent = 'Editar Paciente';
  document.getElementById('btnSubmit').textContent = 'Atualizar Paciente';
  document.getElementById('pacienteId').value = pacienteId;
  carregarPaciente(pacienteId);
}

// Carregar dados do paciente para edição
async function carregarPaciente(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    
    if (!res.ok) {
      alert('Paciente não encontrado!');
      window.location.href = 'index.html';
      return;
    }
    
    const paciente = await res.json();
    
    // Preencher formulário
    document.getElementById('nome').value = paciente.nome || '';
    document.getElementById('data_nascimento').value = paciente.data_nascimento || '';
    document.getElementById('sexo').value = paciente.sexo || '';
    document.getElementById('cpf').value = paciente.cpf || '';
    document.getElementById('rg').value = paciente.rg || '';
    document.getElementById('telefone').value = paciente.telefone || '';
    document.getElementById('telefone_secundario').value = paciente.telefone_secundario || '';
    document.getElementById('email').value = paciente.email || '';
    document.getElementById('estado_civil').value = paciente.estado_civil || '';
    document.getElementById('profissao').value = paciente.profissao || '';
    
  } catch (error) {
    console.error('Erro ao carregar paciente:', error);
    alert('Erro ao carregar dados do paciente!');
  }
}

// Submeter formulário (cadastro ou edição)
document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    nome: document.getElementById("nome").value,
    data_nascimento: document.getElementById("data_nascimento").value,
    sexo: document.getElementById("sexo").value,
    cpf: document.getElementById("cpf").value,
    rg: document.getElementById("rg").value,
    telefone: document.getElementById("telefone").value,
    telefone_secundario: document.getElementById("telefone_secundario").value,
    email: document.getElementById("email").value,
    estado_civil: document.getElementById("estado_civil").value,
    profissao: document.getElementById("profissao").value
  };

  const msg = document.getElementById("mensagem");
  
  try {
    let res;
    
    if (modoEdicao) {
      // ATUALIZAR paciente existente
      res = await fetch(`/api/users/${pacienteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
    } else {
      // CRIAR novo paciente
      res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
    }

    if (res.ok) {
      const resultado = await res.json();
      msg.textContent = modoEdicao ? "✅ Paciente atualizado com sucesso!" : "✅ Paciente cadastrado com sucesso!";
      msg.className = "success";
      
      if (!modoEdicao) {
        document.getElementById("cadastroForm").reset();
      }
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      
    } else {
      const erro = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
      msg.textContent = `❌ ${erro.error || 'Erro ao salvar paciente'}`;
      msg.className = "error";
    }
  } catch (error) {
    console.error('Erro:', error);
    msg.textContent = "❌ Erro de conexão!";
    msg.className = "error";
  }
});

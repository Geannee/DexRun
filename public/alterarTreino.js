document.addEventListener('DOMContentLoaded', async () => {
  // Referências aos elementos
  const els = {
    mensagemBoasVindas: document.getElementById('mensagemBoasVindas'),
    usuarioIdInput: document.getElementById('usuario_id'),
    idTreinoInput: document.getElementById('id_treino'),
    nomeTreino: document.getElementById('nome_treino'),
    periodo: document.getElementById('periodo'),
    data: document.getElementById('data'),
    cidade: document.getElementById('cidade'),
    estado: document.getElementById('estado'),
    tipoTreino: document.getElementById('tipo_treino'),
    kmPorPercurso: document.getElementById('km_por_percurso'),
    form: document.getElementById('alterarForm')
  };

  // Usuário logado
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  els.mensagemBoasVindas.textContent = userId && userName
    ? `${userName.split(' ')[0]}, agora podemos alterar o seu evento.`
    : 'Altere os dados do seu evento.';
  if (userId) els.usuarioIdInput.value = userId;

  // ID do treino
  const treinoId = new URLSearchParams(window.location.search).get('id');
  if (!treinoId) {
    alert('ID do treino não encontrado.');
    return window.location.href = '/ListarTreino.html';
  }
  els.idTreinoInput.value = treinoId;

  // Utilitários
  const formatarData = d => d ? new Date(d).toISOString().split('T')[0] : '';  //toISOString Transforma o objeto Date em uma string no formato ISO 8601: Exemplo: "2025-11-25T10:00:00.000Z".
  const preencherFormulario = t => {                                            //split ('T') Divide a string ISO em duas partes, separadas pelo "T".
    els.nomeTreino.value = t.nome_treino || '';                                   //Antes do "T" → a data (2025-11-25). Depois do "T" → o horário (10:00:00.000Z).
    els.periodo.value = t.periodo || '';
    els.data.value = formatarData(t.data);
    els.cidade.value = t.cidade || '';
    els.estado.value = t.estado || '';
    els.tipoTreino.value = t.tipo_treino || '';
    els.kmPorPercurso.value = t.km_por_percurso || '';
  };

  // Carregar treino
  try {
    const res = await fetch(`/api/treinos/${treinoId}`);
    if (!res.ok) throw new Error('Não foi possível carregar os dados.');
    preencherFormulario(await res.json());
  } catch (err) {
    console.error('Erro ao carregar treino:', err);
    alert(err.message);
    return window.location.href = '/ListarTreino.html';
  }

  // Submeter alterações
  els.form?.addEventListener('submit', async e => {
    e.preventDefault();
    const dadosTreino = Object.fromEntries(new FormData(e.target).entries());

    try {
  const res = await fetch(`/api/treinos/${treinoId}`, {
    method: 'PUT', // tipo da requisição: atualizar recurso existente
    headers: { 'Content-Type': 'application/json' }, // corpo será JSON
    body: JSON.stringify(dadosTreino) // transforma objeto em string JSON
  });



      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Falha ao atualizar o treino.');
      }

      alert('Treino alterado com sucesso!');
      window.location.href = `/ListarTreino.html?modified=${treinoId}`;
    } catch (err) {
      console.error('Erro ao salvar alteração:', err);
      alert(err.message);
    }
  });
});
 
// observacao sobre RES, Method, OUT, JSON

//const res = await fetch(`/api/treinos/${treinoId}`, {.  // res Faz uma requisição HTTP usando a função fetch. O await faz o código esperar a resposta do servidor antes de continuar. O resultado é armazenado na variável res.
//method: 'PUT', ccc//Informa que a requisição é do tipo PUT, usada para atualizar recursos existentes no servidor.Diferente de POST (criar) e GET (buscar).
//headers: { 'Content-Type': 'application/json' }, //Define o cabeçalho da requisição.Diz ao servidor que o corpo da requisição está em formato JSON.
//body: JSON.stringify(dadosTreino) //Converte o objeto dadosTreino em uma string JSON.Esse é o conteúdo que será enviado ao servidor para atuali
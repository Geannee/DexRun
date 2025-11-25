document.addEventListener('DOMContentLoaded', () => {
  // Referências aos elementos
  const { formTreino, userIdInput, userInfoDiv } = {
    formTreino: document.getElementById('formTreino'),
    userIdInput: document.getElementById('usuario_id'),
    userInfoDiv: document.getElementById('userInfo')
  };

  // Recupera usuário logado
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  // Exibe usuário logado
  if (userId) {
    userIdInput && (userIdInput.value = userId);
    if (userInfoDiv) {
      const firstName = userName?.split(' ')[0] || userId;
      userInfoDiv.innerHTML = `Olá, <span>${firstName}</span>`;
    }
  }

  // Função para cadastrar treino
  const cadastrarTreino = async dadosTreino => {
    try {
      const res = await fetch('/api/treinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosTreino)
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || `Erro ${res.status}: ${res.statusText}`);
      }

      await res.json();
      alert(`Treino "${dadosTreino.nome_treino}" cadastrado com sucesso!`);
      formTreino?.reset();
    } catch (err) {
      console.error('Erro no cadastro do treino:', err);
      alert(`Erro no cadastro: ${err.message}`);
    }
  };

  // Validação dos campos obrigatórios
  const validarTreino = dados => {
    if (!dados.nome_treino || !dados.periodo || !dados.tipo_treino) {
      alert('Preencha todos os campos obrigatórios.');
      return false;
    }
    if (!dados.data) delete dados.data;
    return true;
  };

  // Listener do formulário
  formTreino?.addEventListener('submit', e => {
    e.preventDefault();
    const dadosTreino = Object.fromEntries(new FormData(formTreino).entries());
    if (validarTreino(dadosTreino)) cadastrarTreino(dadosTreino);
  });
});

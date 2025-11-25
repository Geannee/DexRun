document.addEventListener('DOMContentLoaded', async () => {
  // Recupera usuário
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  

  // Elementos da UI
  const userInfoDiv = document.getElementById('userInfo');
  const loginButton = document.getElementById('loginButton');
  const logoutButton = document.getElementById('logoutButton');
  const listaDeTreinos = document.getElementById('listaDeTreinos');

  // Exibe usuário logado
  const atualizarUIUsuario = () => {
    if (userId && userName) {
      const firstName = userName.split(' ')[0];
      userInfoDiv.textContent = `Olá, ${firstName}`;
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';
    } else {
      userInfoDiv.textContent = '';
      loginButton.style.display = 'block';
      logoutButton.style.display = 'none';
    }
  };

  atualizarUIUsuario();

  // Logout
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = '/Login.html';
  });

  // Se não há usuário, redireciona
  if (!userId) return (window.location.href = '/Login.html');

  // Ícones por tipo de treino
  const iconMap = {
    Caminhada: 'caminhada.png',
    Corrida: 'corredor.png',
    Sprint: 'sprint.png',
    Longao: 'maratona.png',
    Longão: 'maratona.png'
  };

  // Renderiza lista de treinos
  const renderTreinos = treinos => {
    if (!treinos || treinos.length === 0) {
      listaDeTreinos.innerHTML =
        '<p>Você ainda não cadastrou nenhum treino. <a href="/criarTreino.html">Crie um agora!</a></p>';
      return;
    }

    listaDeTreinos.innerHTML = ''; // limpa "Carregando..."

    treinos.forEach(({ id_treino, nome_treino, tipo_treino, data_formatada }) => {
      const iconFile = iconMap[tipo_treino] || 'default.png';

      const card = document.createElement('div');
      card.className = 'card-treino';
      card.innerHTML = `
        <div class="card-icone">
          <img src="img/icone/${iconFile}" alt="${tipo_treino}" />
        </div>
        <div class="card-conteudo">
          <h3 class="evento-nome">${nome_treino}</h3>
          <p class="evento-tipo"><strong>Tipo:</strong> ${tipo_treino}</p>
          <div class="card-data">${data_formatada}</div>
        </div>
        <div class="card-acoes">
          <a href="/Alterar.html?id=${id_treino}" class="btn-acao btn-alterar">Alterar</a>
          <button class="btn-acao btn-excluir" data-id="${id_treino}">Excluir</button>
        </div>
      `;
      listaDeTreinos.appendChild(card);
    });

    // Eventos de exclusão
    document.querySelectorAll('.btn-excluir').forEach(button => {
      button.addEventListener('click', async e => {
        const id = e.target.dataset.id;
        if (!confirm('Tem certeza que deseja excluir este treino?')) return;

        try {
          const res = await fetch(`/api/treinos/${id}`, { method: 'DELETE' });
          const data = await res.json();
          alert(data.message);
          window.location.reload();
        } catch {
          alert('Erro ao excluir treino.');
        }
      });
    });
  };

  // Busca treinos
  try {
    const res = await fetch(`/api/treinos/user/${userId}`);
    if (!res.ok) throw new Error('Não foi possível carregar seus treinos.');
    const treinos = await res.json();
    renderTreinos(treinos);
  } catch (err) {
    console.error('Erro ao buscar treinos:', err);
    listaDeTreinos.innerHTML = `<p style="color: red;">${err.message}</p>`;
  }
});

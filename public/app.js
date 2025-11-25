// ==================== USUÁRIOS ====================

// Elementos
const formUsuario = document.getElementById('formUsuario');
const userList = document.getElementById('userList');

// CADASTRAR USUÁRIO
if (formUsuario) {
    formUsuario.addEventListener('submit', e => {
        e.preventDefault();

        const usuario = {
            nome: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value,
            whatsapp: document.getElementById('whatsapp').value,
            email: document.getElementById('email').value,
            senha: document.getElementById('senha').value
        };

        fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario)
        })
        .then(res => res.json())
        .then(() => {
            alert('Usuário cadastrado com sucesso!');
            formUsuario.reset();
            carregarUsuarios();
        })
        .catch(err => alert(`Erro: ${err.message}`));
    });
}

// LISTAR USUÁRIOS
function carregarUsuarios() {
    fetch('/api/users')
        .then(res => res.json())
        .then(data => {
            userList.innerHTML = '';
            data.forEach(user => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${user.nome} (${user.email})
                    <button onclick="atualizarUsuario(${user.id})">Editar</button>
                    <button onclick="excluirUsuario(${user.id})">Excluir</button>
                `;
                userList.append(li);
            });
        });
}

// ATUALIZAR USUÁRIO
function atualizarUsuario(id) {
    const nome = prompt('Novo nome:');
    const email = prompt('Novo email:');

    fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email })
    }).then(() => carregarUsuarios());
}

// EXCLUIR USUÁRIO
function excluirUsuario(id) {
    if (!confirm('Excluir este usuário?')) return;

    fetch(`/api/users/${id}`, { method: 'DELETE' })
        .then(() => carregarUsuarios());
}


// ==================== TREINOS ====================

// Elementos
const formTreino = document.getElementById('formTreino');
const treinoList = document.getElementById('treinoList');

// CADASTRAR TREINO
if (formTreino) {
    formTreino.addEventListener('submit', e => {
        e.preventDefault();

        const treino = {
            usuario_id: document.getElementById('usuario_id').value,
            nome_treino: document.getElementById('nome_treino').value,
            data: document.getElementById('data').value,
            periodo: document.getElementById('periodo').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value,
            tipo_treino: document.getElementById('tipo_treino').value,
            km_por_percurso: document.getElementById('km_por_percurso').value
        };

        fetch('/api/treinos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(treino)
        })
        .then(res => res.json())
        .then(() => {
            alert('Treino cadastrado com sucesso!');
            formTreino.reset();
            carregarTreinos();
        })
        .catch(err => alert(`Erro: ${err.message}`));
    });
}

// LISTAR TREINOS
function carregarTreinos() {
    fetch('/api/treinos')
        .then(res => res.json())
        .then(data => {
            treinoList.innerHTML = '';
            data.forEach(treino => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${treino.nome_treino} - ${treino.tipo_treino} - ${treino.km_por_percurso} km (${treino.data_formatada || treino.data})
                    <button onclick="excluirTreino(${treino.id_treino})">Excluir</button>
                `;
                treinoList.append(li);
            });
        });
}

// EXCLUIR TREINO
function excluirTreino(id) {
    if (!confirm('Excluir este treino?')) return;

    fetch(`/api/treinos/${id}`, { method: 'DELETE' })
        .then(() => carregarTreinos());
}

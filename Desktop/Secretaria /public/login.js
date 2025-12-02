// Variáveis globais
let usuarioAtual = '';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const mensagemErro = document.getElementById('mensagemErro');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    usuarioAtual = usuario;
    
    // Desabilitar botão enquanto processa
    const btnLogin = loginForm.querySelector('.btn-login');
    btnLogin.disabled = true;
    btnLogin.textContent = '⏳ Enviando...';
    
    // Fazer requisição de login
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Mostrar tela de verificação
        mostrarTelaVerificacao(data.email);
      } else {
        throw new Error(data.error || 'Erro ao fazer login');
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      mensagemErro.textContent = '❌ ' + error.message;
      mensagemErro.classList.add('show');
      
      setTimeout(() => {
        mensagemErro.classList.remove('show');
      }, 3000);
    })
    .finally(() => {
      btnLogin.disabled = false;
      btnLogin.textContent = '🔐 Entrar';
    });
  });
});

function mostrarTelaVerificacao(emailMascarado) {
  const loginForm = document.getElementById('loginForm');
  
  loginForm.innerHTML = `
    <div class="form-group">
      <label>📧 Código de Verificação</label>
      <p style="color: var(--dourado-claro); font-size: 14px; margin-bottom: 15px;">
        Enviamos um código de 6 dígitos para <strong>${emailMascarado}</strong>
      </p>
      <input 
        type="text" 
        id="codigoVerificacao" 
        placeholder="Digite o código" 
        maxlength="6" 
        pattern="[0-9]{6}"
        required
        autocomplete="off"
        style="text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
    </div>
    
    <div id="mensagemVerificacao" class="mensagem-erro"></div>
    
    <button type="submit" class="btn-login">✓ Verificar Código</button>
    
    <button type="button" onclick="location.reload()" class="btn-voltar" style="margin-top: 10px;">
      ← Voltar ao Login
    </button>
  `;
  
  // Focar no campo de código
  document.getElementById('codigoVerificacao').focus();
  
  // Adicionar listener para verificação
  loginForm.addEventListener('submit', verificarCodigo);
}

function verificarCodigo(e) {
  e.preventDefault();
  
  const codigo = document.getElementById('codigoVerificacao').value;
  const mensagemVerificacao = document.getElementById('mensagemVerificacao');
  const btnVerificar = document.querySelector('.btn-login');
  
  btnVerificar.disabled = true;
  btnVerificar.textContent = '⏳ Verificando...';
  
  fetch('/api/auth/verificar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      usuario: usuarioAtual, 
      codigo 
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Salvar sessão no localStorage
      localStorage.setItem('adminLogado', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
      localStorage.setItem('adminUsuario', JSON.stringify(data.usuario));
      
      // Mensagem de sucesso
      mensagemVerificacao.textContent = '✓ Acesso autorizado! Redirecionando...';
      mensagemVerificacao.style.background = 'rgba(76, 175, 80, 0.2)';
      mensagemVerificacao.style.borderColor = 'rgba(76, 175, 80, 0.5)';
      mensagemVerificacao.style.color = '#4caf50';
      mensagemVerificacao.classList.add('show');
      
      // Redirecionar após 1 segundo
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 1000);
    } else {
      throw new Error(data.error || 'Código inválido');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    mensagemVerificacao.textContent = '❌ ' + error.message;
    mensagemVerificacao.classList.add('show');
    
    document.getElementById('codigoVerificacao').value = '';
    document.getElementById('codigoVerificacao').focus();
    
    setTimeout(() => {
      mensagemVerificacao.classList.remove('show');
    }, 3000);
  })
  .finally(() => {
    btnVerificar.disabled = false;
    btnVerificar.textContent = '✓ Verificar Código';
  });
}

gmail# 📧 Sistema de Notificações - Guia de Configuração

## 🚀 Funcionalidades Implementadas

✅ **Confirmação imediata** por email após agendamento  
✅ **Lembrete automático** 24 horas antes da consulta  
✅ Suporte para WhatsApp (via Twilio) - opcional

---

## 📝 Configuração do Email (Gmail)

### Passo 1: Configurar Senha de Aplicativo no Gmail

1. Acesse sua conta Google: https://myaccount.google.com/
2. Vá em **Segurança** → **Verificação em duas etapas** (ative se não estiver)
3. Role até **Senhas de app** e clique
4. Selecione **Email** e **Outro (nome personalizado)**
5. Digite "Sistema Agendamentos" e clique em **Gerar**
6. **Copie a senha** de 16 caracteres gerada

### Passo 2: Editar arquivo `config.js`

Abra o arquivo `/config.js` e edite:

```javascript
email: {
    enabled: true, // ✅ Deixe como true
    service: 'gmail',
    auth: {
        user: 'seuemail@gmail.com', // ← Cole seu email aqui
        pass: 'xxxx xxxx xxxx xxxx'  // ← Cole a senha de aplicativo aqui
    },
    from: 'Clínica Odontológica <seuemail@gmail.com>'
}
```

### Passo 3: Configurar dados da clínica

No mesmo arquivo `config.js`:

```javascript
clinica: {
    nome: 'Clínica Dr. Silva', // ← Nome da sua clínica
    telefone: '(11) 99999-9999', // ← Telefone da clínica
    endereco: 'Rua Exemplo, 123 - São Paulo/SP' // ← Endereço
}
```

---

## 📱 Configuração do WhatsApp (Opcional - Twilio)

### Passo 1: Criar conta no Twilio

1. Acesse: https://www.twilio.com/
2. Crie uma conta gratuita (trial)
3. Pegue seu **Account SID** e **Auth Token**
4. Configure um número com WhatsApp

### Passo 2: Editar `config.js`

```javascript
whatsapp: {
    enabled: true, // ← Mude para true
    accountSid: 'ACxxxxxxxxxxxxxxxxx', // ← Cole seu Account SID
    authToken: 'seu-token-aqui',      // ← Cole seu Auth Token
    phoneNumber: '+5511999999999'     // ← Número do Twilio
}
```

### Passo 3: Instalar pacote Twilio

```bash
npm install twilio
```

---

## 🔧 Instalação

```bash
cd /Users/geanne/Desktop/Secretaria
npm install nodemailer
```

---

## ▶️ Como Usar

### Iniciar o servidor

```bash
node server.js
```

### Verificação automática de lembretes

- ✅ Roda **automaticamente a cada 1 hora**
- ✅ Executa 5 segundos após iniciar o servidor
- ✅ Envia lembretes para agendamentos do dia seguinte

### Executar verificação manual

```bash
node lembrete-agendamentos.js
```

---

## 📧 Exemplo de Emails

### Email de Confirmação
Enviado **imediatamente** após o agendamento:
- ✅ Agendamento Confirmado!
- 📅 Data e horário
- 🦷 Serviço agendado
- 📝 Observações (se houver)

### Email de Lembrete
Enviado **24 horas antes** da consulta:
- 🔔 Lembrete: Consulta Amanhã
- ⏰ Data e horário destacados
- 💡 Dicas para o paciente

---

## ⚠️ Problemas Comuns

### "Erro ao enviar email"
- ✅ Verifique se habilitou a verificação em 2 etapas no Gmail
- ✅ Certifique-se de usar a **senha de aplicativo**, não sua senha normal
- ✅ Verifique se o email do paciente está cadastrado corretamente

### "Email desabilitado - não enviado"
- ✅ No `config.js`, certifique-se que `email.enabled: true`

### Lembretes não estão sendo enviados
- ✅ Verifique se o servidor está rodando
- ✅ Veja o console para mensagens de erro
- ✅ Execute manualmente: `node lembrete-agendamentos.js`

---

## 📊 Logs do Sistema

O sistema exibe logs coloridos:
- ✅ **Verde**: Operação bem-sucedida
- ⚠️ **Amarelo**: Avisos (email desabilitado, etc)
- ❌ **Vermelho**: Erros

---

## 🎯 Próximos Passos

1. Configure o email no `config.js`
2. Instale o nodemailer: `npm install nodemailer`
3. Reinicie o servidor: `node server.js`
4. Teste fazendo um agendamento!

---

## 💡 Dicas

- Use um email exclusivo para o sistema (crie um novo Gmail se necessário)
- O paciente precisa ter **email cadastrado** no banco de dados
- Lembretes são enviados apenas para agendamentos **não cancelados**
- Verifique a pasta de spam do paciente se não receber

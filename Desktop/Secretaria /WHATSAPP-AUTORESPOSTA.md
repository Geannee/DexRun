# 🤖 Configurar Resposta Automática no WhatsApp

## Opção 1: WhatsApp Business App (GRÁTIS - Mais Simples)

### Configurar Mensagem de Saudação:

1. **Abra WhatsApp Business** no celular
2. **Menu (⋮)** → **Configurações** → **Ferramentas comerciais**
3. **Mensagem de saudação** → Ativar
4. Cole esta mensagem:

```
Olá! 👋

Obrigado por entrar em contato! 🦷

Para agendar sua consulta de forma rápida e prática, acesse:

🔗 https://scabbily-cartographic-oma.ngrok-free.dev

✨ É fácil e rápido:
• Escolha o melhor dia
• Selecione o horário disponível  
• Receba confirmação instantânea

📧 Você receberá confirmação por email e WhatsApp!

Qualquer dúvida, estou à disposição! 😊
```

5. Configure quando enviar (sempre, horário específico, etc)
6. **SALVAR**

---

## Opção 2: Evolution API (GRÁTIS - Automático Total)

### Para resposta 100% automática via código:

#### 1. Instalar Evolution API:

```bash
# Opção A: Docker (recomendado)
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  atendai/evolution-api

# Opção B: Manual
git clone https://github.com/EvolutionAPI/evolution-api
cd evolution-api
npm install
npm start
```

#### 2. Conectar WhatsApp:

- Acesse: `http://localhost:8080`
- Crie uma instância
- Escaneie QR Code com seu WhatsApp Business
- Configure webhook: `https://seu-ngrok.ngrok-free.dev/api/whatsapp/webhook`

#### 3. Seu servidor já está preparado!

A rota `/api/whatsapp/webhook` já está criada e vai responder automaticamente todas as mensagens com o link do agendamento.

---

## Opção 3: Link Encurtado Bonito

Antes de configurar, encurte o link:

1. Acesse: https://bitly.com
2. Cole: `https://scabbily-cartographic-oma.ngrok-free.dev`
3. Personalize: `https://bit.ly/clinica-agenda`
4. Use esse link nas mensagens

---

## ✅ Recomendação

**Para começar HOJE:** Use **Opção 1** (WhatsApp Business App)
- Gratuito
- 2 minutos para configurar
- Funciona imediatamente

**Para automação total:** Use **Opção 2** (Evolution API)
- Gratuito mas mais técnico
- Responde 100% automático
- Requer instalação

---

## 📱 Teste

Depois de configurar, peça para alguém te chamar no WhatsApp e veja se recebe a mensagem automática!

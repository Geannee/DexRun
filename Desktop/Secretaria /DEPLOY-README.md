# Deploy na Nuvem (Render + Banco Gerenciado)

Este guia coloca o app Node/Express na nuvem usando Render (Web Service) e um banco MySQL gerenciado (Railway ou PlanetScale).

## Visão Geral
- Backend: Render Web Service com Dockerfile.
- Banco: MySQL gerenciado (Railway) ou PlanetScale (MySQL compatível).
- Variáveis: configuradas no painel Render.

## Passo a Passo

### 1) Preparar o repositório
- Confirme que existe `Dockerfile` na raiz.
- Revise `.env.example` e anote variáveis necessárias.

### 2) Criar o Banco
Opção A — Railway (MySQL):
1. Crie conta em https://railway.app
2. New Project → Database → MySQL.
3. Copie as credenciais (host, user, password, port, database).

Opção B — PlanetScale:
1. Crie conta em https://planetscale.com
2. New Database.
3. Gere um `Password` (Access Token) e pegue `HOST`/`USERNAME`/`PASSWORD`.
4. Use `DB_PORT=3306` normalmente.

### 3) Deploy do Backend no Render
1. Crie conta em https://render.com
2. New → Web Service → Connect seu GitHub (repo com este projeto).
3. Environment: Docker.
4. Runtime: Docker, Region: escolha próxima ao Brasil.
5. Variáveis de ambiente:
   - `PORT=3000` (Render define `PORT`, mas mantenha coerente com Dockerfile).
   - `ORIGIN_URL=https://<seu-servico>.onrender.com`
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` (do banco)
   - `EMAIL_*` se usar Nodemailer
   - `TWILIO_*` se usar WhatsApp/SMS
6. Start command: usa `CMD` do Dockerfile (`node server.js`).
7. Deploy.

### 4) Migrar/Popular Banco
- Use seus arquivos SQL (`criar_tabela_usuarios.sql`, etc.) conectando ao banco gerenciado.
- Você pode rodar localmente com cliente MySQL ou usar a UI do provedor.
- Depois rode o script de seed, ajustando conexão para o banco na nuvem.

### 5) Testar
- Acesse a URL pública do Render.
- Verifique `/public/index.html` abrindo a raiz (o `server.js` redireciona para `/public`).
- Teste agendamentos, login administrador e envio de e-mails.

### 6) WhatsApp (Opcional)
- Twilio Sandbox: habilite em https://www.twilio.com/whatsapp, copie `ACCOUNT_SID`, `AUTH_TOKEN` e `TWILIO_WHATSAPP_FROM`.
- No backend, ao criar agendamento, dispare mensagem via Twilio client (já instalado) — lembre de usar `whatsapp:+55XXXXXXXXXXX`.

## Dicas
- Logs: use o painel Render → Logs para acompanhar erros.
- Segurança: nunca commite `.env` com segredos.
- Escala: Render permite autoscaling; ajuste plano conforme tráfego.

## Problemas Comuns
- Timeout de DB: confira `DB_HOST` acessível pela rede do Render.
- Porta: certifique-se de usar `process.env.PORT` no `server.js`.
- CORS: se for necessário, defina `ORIGIN_URL` e ajuste middleware de CORS.

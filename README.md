# Gerador de Propostas com IA
### Clube Divos da IA — Amanda Diniz

Sistema para gerar propostas comerciais personalizadas usando Claude, com base no contexto de conversa do lead e nos serviços da sua empresa.

---

## Setup passo a passo

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/gerador-propostas.git
cd gerador-propostas
npm install
```

### 2. Criar projeto no Supabase (gratuito)
1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project**
3. Dê um nome (ex: `gerador-propostas`) e crie
4. Vá em **SQL Editor** e cole o conteúdo de `supabase/schema.sql`
5. Clique em **Run**
6. Vá em **Project Settings > API** e copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Criar conta na Claude API (obrigatório, pago)
1. Acesse [console.anthropic.com](https://console.anthropic.com) e crie uma conta
2. **IMPORTANTE:** Vá em **Billing** e cadastre um cartão de crédito antes de começar
3. Vá em **API Keys** > **Create Key** e copie a chave → `ANTHROPIC_API_KEY`
> Custo: ~R$ 0,10 por proposta. Você recebe US$5 de crédito na criação da conta.

### 4. Criar conta no Groq (gratuito, para transcrição de áudio)
1. Acesse [console.groq.com](https://console.groq.com) e crie uma conta gratuita
2. Vá em **API Keys** > **Create API Key** e copie → `GROQ_API_KEY`

### 5. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```
Abra o arquivo `.env.local` que foi criado. No Mac, pelo terminal:
```bash
open -e .env.local
```
O arquivo já tem instruções em cada campo — preencha um por um:
- **APP_PASSWORD** → senha que você vai usar para entrar no app (escolha qualquer uma)
- **ANTHROPIC_API_KEY** → chave do Claude API (console.anthropic.com)
- **GROQ_API_KEY** → chave do Groq (console.groq.com)
- **NEXT_PUBLIC_SUPABASE_URL**, **ANON_KEY**, **SERVICE_ROLE_KEY** → do seu projeto no Supabase
- **UAZAPI_INSTANCE_TOKEN** → opcional, deixe em branco se não for usar

Salve o arquivo quando terminar.

### 6. Rodar o app localmente

> **Importante:** esse comando precisa ser rodado no **Terminal do seu computador**, não no Claude Code.

Abra o Terminal, entre na pasta do projeto e rode:
```bash
cd gerador-propostas
npm run dev
```
O terminal vai ficar rodando — isso é normal. Abra o navegador em http://localhost:3000 e entre com a senha que você definiu no `APP_PASSWORD`.

Para parar o servidor: **Ctrl+C** no terminal.

### 8. Deploy no Vercel (opcional)
```bash
npx vercel
```
Ou conecte o repositório GitHub no [vercel.com](https://vercel.com) e configure as variáveis lá.

---

## Como usar

**Primeiro uso:** vá em **Configurar** e preencha os dados da sua empresa e serviços.

**Gerar proposta:**
1. Novo Lead → preencha nome, empresa, nicho
2. Adicione contexto: cole conversa do WhatsApp, ata de reunião, transcreva áudio ou escreva notas
3. Clique em **Gerar proposta com Claude**
4. Visualize → Imprimir / Salvar PDF (Ctrl+P → Salvar como PDF)
5. Se precisar ajustar: clique em **Refinar** e descreva o que mudar

---

## UAZAPI (opcional — puxar histórico do WhatsApp)

Para puxar automaticamente o histórico de conversa do WhatsApp:
1. Acesse [uazapiGO.com](https://uazapi.com) e crie uma conta
2. Crie uma instância e escaneie o QR code com seu WhatsApp
3. Copie o token da instância
4. Adicione ao `.env.local`:
```
UAZAPI_BASE_URL=https://free.uazapi.com
UAZAPI_INSTANCE_TOKEN=seu-token-aqui
```

---

## Custos

| Serviço | Custo |
|---------|-------|
| Supabase (banco de dados) | Gratuito |
| Vercel (deploy) | Gratuito |
| Groq (transcrição de áudio) | Gratuito |
| **Claude API (gerar propostas)** | **~R$0,10 por proposta** |
| UAZAPI (histórico WhatsApp) | Pago (opcional) |

### ⚠️ Sobre a Claude API

Ao criar sua conta você recebe **US$5 de crédito gratuito** (~50 propostas). Depois do crédito, custa ~R$0,10 por proposta gerada.

**Cadastre um cartão antes de começar** para que o sistema não pare quando o crédito acabar. Se o crédito esgotar sem cartão, o app vai mostrar uma mensagem explicando o que fazer.

---

## Stack

Next.js · Supabase · Claude API (Sonnet) · Groq Whisper · UAZAPI (opcional)

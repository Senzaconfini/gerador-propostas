# Gerador de Propostas com IA
### Clube Divos da IA — Amanda Diniz

Sistema para gerar propostas comerciais personalizadas usando Claude, com base no contexto de conversa do lead e nos serviços da sua agência.

---

## Setup em 5 passos

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/gerador-propostas.git
cd gerador-propostas
npm install
```

### 2. Criar projeto no Supabase (gratuito)
1. Acesse supabase.com e crie uma conta
2. Clique em **New Project**
3. Dê um nome (ex: `gerador-propostas`) e crie
4. Vá em **SQL Editor** e cole o conteúdo de `supabase/schema.sql`
5. Clique em **Run**
6. Vá em **Project Settings > API** e copie a URL e a chave `anon public`

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```
Preencha as 3 variáveis obrigatórias no `.env.local`.

### 4. Rodar localmente
```bash
npm run dev
```
Abra http://localhost:3000

### 5. Deploy no Vercel
```bash
npx vercel
```
Ou conecte o repositório GitHub no vercel.com e configure as variáveis lá.

---

## Como usar

**Primeiro uso:** vá em **Configurar** e preencha os dados da sua agência e serviços.

**Gerar proposta:**
1. Novo Lead → preencha os dados
2. Adicione contexto: conversa do WhatsApp, ata de reunião, notas
3. Clique em **Gerar proposta com Claude**
4. Visualize → Imprimir / Salvar PDF (Ctrl+P → Salvar como PDF)
5. Envie pelo WhatsApp

---

## UAZAPI (opcional)

Para envio automático via WhatsApp, adicione ao `.env.local`:
```
UAZAPI_BASE_URL=https://sua-instancia.uazapi.com
UAZAPI_INSTANCE_TOKEN=seu-token
```

---

## Personalizar identidade visual

Edite as cores em `app/globals.css` — o Claude usa essas cores ao gerar a proposta.

---

## Stack
Next.js 15 · Supabase · Claude API · UAZAPI (opcional)

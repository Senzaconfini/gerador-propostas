import Anthropic from '@anthropic-ai/sdk'
import type { Config, Servico } from './supabase'
import type { ConteudoProposta } from './template'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function gerarConteudoProposta(params: {
  config: Config
  servicos: Servico[]
  lead: { nome: string; empresa: string; nicho: string }
  conversa: string
  reuniao: string
  audioTranscrito: string
  notasExtras: string
}): Promise<ConteudoProposta> {
  const { config, servicos, lead, conversa, reuniao, audioTranscrito, notasExtras } = params

  const servicosTexto = servicos
    .filter(s => s.ativo)
    .map(s => `- ${s.nome}: ${s.preco}/${s.unidade}${s.descricao ? ` — ${s.descricao}` : ''}`)
    .join('\n')

  const contextoLead = [
    conversa       && `=== HISTÓRICO WHATSAPP ===\n${conversa}`,
    reuniao        && `=== ATA DE REUNIÃO ===\n${reuniao}`,
    audioTranscrito && `=== ÁUDIO TRANSCRITO ===\n${audioTranscrito}`,
    notasExtras    && `=== NOTAS EXTRAS ===\n${notasExtras}`,
  ].filter(Boolean).join('\n\n')

  const hoje = new Date()
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const dataFormatada = `${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`

  const systemPrompt = `Você é um especialista em propostas comerciais para a Senza Confini, uma agência brasileira de marketing digital.

BASE DE CONHECIMENTO DA AGÊNCIA:
Nome: ${config.agencia_nome}
Descrição: ${config.agencia_descricao}
Diferenciais: ${config.agencia_diferenciais}
Tom de voz: ${config.tom_de_voz || 'profissional, acolhedor e direto'}

SERVIÇOS E PREÇOS DISPONÍVEIS:
${servicosTexto || 'A definir com base nas dores do cliente'}

SUA TAREFA
Analisar o contexto do lead e gerar o CONTEÚDO da proposta em formato JSON (não HTML, não markdown). O layout é fixo e aplicado depois. Você só escreve os textos.

REGRAS DE ESCRITA (importantes)
- Linguagem simples, calorosa e direta. Nada de jargão de marketing.
- Fale com a pessoa pelo nome quando fizer sentido.
- NUNCA use travessão (—). Use vírgula, ponto final ou dois pontos.
- NUNCA use reticências (...).
- Frases curtas. Evite frases com mais de 25 palavras.
- O cliente pode não ser do digital. Explique "o que é" o serviço com uma analogia visual que ele já conheça.
- Use o método Senza: Faça, Entenda, Repita. Nos cards, descreva O QUE é feito em cada fase, não apenas o nome.
- No passo a passo, inclua uma linha sobre o "relatório no WhatsApp toda sexta-feira" quando houver gestão recorrente.
- Preços: use o padrão "R$ 1.200".

ESCOLHA DOS PLANOS
- Se o lead precisa de um único serviço, gere UM plano só.
- Se faz sentido oferecer dois níveis (Essencial vs Completo), gere DOIS planos. O mais caro deve ter "destaque": true e uma linha de "Recomendado".
- Se o serviço envolve anúncio pago (tráfego pago, Google Ads), inclua a linha "ads" com o investimento mínimo em plataforma.

FORMATO DE SAÍDA
Retorne APENAS um JSON válido, sem texto antes ou depois, sem markdown fences. A estrutura:

{
  "titulo_servico": "string — nome curto do serviço principal, ex: 'Gestão de Tráfego Pago' ou 'Pacote Saúde e Beleza'",
  "empresa_cliente": "string — nome da empresa do lead",
  "nome_cliente": "string — primeiro nome do lead",
  "data": "${dataFormatada}",
  "momento": {
    "titulo": "string — frase forte que capta onde o cliente está agora, 8 a 14 palavras",
    "lead": "string — 2 a 3 frases reconhecendo o que ele construiu e o próximo passo",
    "complemento": "string — 1 a 2 frases tranquilizando que a Senza cuida da parte técnica"
  },
  "o_que_e": {
    "titulo": "string — ex: 'O que é tráfego pago'",
    "paragrafo": "string — 2 a 3 frases explicando o serviço com analogia simples",
    "pilares": ["3 benefícios curtos, cada um de 5 a 10 palavras"]
  },
  "metodo": {
    "intro": "string — 1 frase conectando o método ao que o cliente vai receber",
    "faca": "string — 1 frase sobre a fase de execução inicial",
    "entenda": "string — 1 frase sobre a fase de análise de resultados",
    "repita": "string — 1 frase sobre a fase de otimização"
  },
  "passo_a_passo": [
    "5 a 7 passos concretos, cada um de 10 a 20 palavras"
  ],
  "planos": [
    {
      "nome": "string — ex: 'Plano Essencial' ou 'Pacote Completo'",
      "subtitulo": "string curta — ex: 'Para começar com o essencial'",
      "preco": "string — ex: 'R$ 750'",
      "periodo": "string — ex: 'por mês' ou 'por projeto'",
      "itens": ["3 a 5 itens curtos sobre o que está incluso"],
      "ads": "string opcional — observação sobre custo de anúncio ou taxa adicional",
      "destaque": false
    }
  ],
  "nota_planos": "string opcional — observação curta explicando valores separados (plano vs anúncio, por exemplo)",
  "fechamento": {
    "label": "string — ex: 'Vamos começar?'",
    "titulo": "string — frase convidativa, ex: 'É só marcar a nossa conversa'",
    "subtitulo": "string — frase menor com o compromisso da agência",
    "contato": "string — telefone e @instagram da agência, ex: '(21) 96879-3651 · @senzaconfini_mkt'"
  }
}`

  const userPrompt = `LEAD:
Nome: ${lead.nome}
Empresa: ${lead.empresa || 'Não informado'}
Nicho: ${lead.nicho || 'Não informado'}

${contextoLead || 'Nenhum contexto de conversa fornecido. Gere uma proposta genérica mas bem feita para esse lead.'}

Gere o JSON da proposta.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Resposta inesperada do Claude')

  const jsonText = content.text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')

  try {
    return JSON.parse(jsonText) as ConteudoProposta
  } catch {
    throw new Error('O Claude retornou um JSON inválido. Tente gerar novamente.')
  }
}

export async function refinarConteudoProposta(params: {
  conteudoAtual: ConteudoProposta
  instrucao: string
}): Promise<ConteudoProposta> {
  const { conteudoAtual, instrucao } = params

  const systemPrompt = `Você edita o JSON de uma proposta comercial.
Receberá o JSON atual e uma instrução de alteração. Faça APENAS a alteração pedida, mantendo todo o restante idêntico.
Retorne SOMENTE o JSON completo modificado, sem texto antes ou depois, sem markdown fences.
Regras de escrita: NUNCA use travessão (—), nem reticências. Frases curtas e diretas.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `JSON ATUAL:\n${JSON.stringify(conteudoAtual, null, 2)}\n\nINSTRUÇÃO:\n${instrucao}\n\nRetorne o JSON completo com a alteração.`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Resposta inesperada do Claude')

  const jsonText = content.text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')

  try {
    return JSON.parse(jsonText) as ConteudoProposta
  } catch {
    throw new Error('O Claude retornou um JSON inválido no refino. Tente novamente.')
  }
}

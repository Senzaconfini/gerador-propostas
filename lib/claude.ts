import Anthropic from '@anthropic-ai/sdk'
import type { Config, Servico } from './supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function gerarProposta(params: {
  config: Config
  servicos: Servico[]
  lead: { nome: string; empresa: string; nicho: string }
  conversa: string
  reuniao: string
  audioTranscrito: string
  notasExtras: string
}): Promise<string> {
  const { config, servicos, lead, conversa, reuniao, audioTranscrito, notasExtras } = params

  const servicosTexto = servicos
    .filter(s => s.ativo)
    .map(s => `- ${s.nome}: R$ ${s.preco}/${s.unidade}${s.descricao ? ` — ${s.descricao}` : ''}`)
    .join('\n')

  const contextoLead = [
    conversa       && `=== HISTÓRICO WHATSAPP ===\n${conversa}`,
    reuniao        && `=== ATA DE REUNIÃO ===\n${reuniao}`,
    audioTranscrito && `=== ÁUDIO TRANSCRITO ===\n${audioTranscrito}`,
    notasExtras    && `=== NOTAS EXTRAS ===\n${notasExtras}`,
  ].filter(Boolean).join('\n\n')

  const systemPrompt = `Você é um especialista em propostas comerciais para negócios criativos e de serviços.
Você vai gerar uma proposta comercial personalizada em HTML completo, visualmente bonita e persuasiva.

BASE DE CONHECIMENTO DA EMPRESA:
Nome: ${config.agencia_nome}
Descrição: ${config.agencia_descricao}
Diferenciais: ${config.agencia_diferenciais}
Tom de voz: ${config.tom_de_voz || 'profissional, acolhedor e direto'}

SERVIÇOS E PREÇOS:
${servicosTexto || 'Serviços a serem definidos com base nas dores do cliente'}

INSTRUÇÕES PARA A PROPOSTA:
1. Analise o contexto do lead e identifique as dores, objetivos e necessidades específicas
2. Selecione apenas os serviços que fazem sentido para esse cliente
3. Personalize o texto com o nome do cliente e detalhes da conversa
4. A proposta deve ser irresistível: mostre o valor, não só o preço
5. Use linguagem do tom de voz da empresa
6. Inclua uma seção de "por que agora" baseada nas dores identificadas
7. Finalize com um próximo passo claro

FORMATO HTML — REGRAS OBRIGATÓRIAS:
- Retorne APENAS o conteúdo que vai dentro de <body>, começando com uma tag <style>
- NÃO inclua <!DOCTYPE>, <html>, <head> ou <body> tags
- Todo CSS deve estar dentro da tag <style> no início (não use style="" inline nos elementos)
- Fontes via Google Fonts: Playfair Display (títulos) e Inter (corpo)

PALETA DE CORES — USE EXATAMENTE ESTAS:
- Fundo principal: #070D0D (quase preto)
- Superfície cards: #111818
- Superfície secundária: #1A2020
- Texto principal: #FFF7EC (creme)
- Destaque rosa: #F5CBD7 (blush)
- Acento: #C4908E (rose gold)
- Botões/bordas: #741E31 (berry)
- Escuro quente: #3E2723 (espresso)

REGRAS DE DESIGN CRÍTICAS:
1. TODOS os elementos devem ter fundo escuro (#070D0D ou #111818 ou #1A2020) — NUNCA fundo branco ou claro
2. TODO o texto deve ser claro (#FFF7EC ou #F5CBD7 ou #C4908E) — NUNCA texto escuro em fundo claro
3. No início do <style>, SEMPRE inclua: * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
4. Defina background-color: #070D0D no body e em TODAS as seções
5. Use page-break-after: always para separar seções como páginas distintas no PDF

ESTRUTURA OBRIGATÓRIA — TODAS AS 6 SEÇÕES DEVEM ESTAR PRESENTES:
1. CAPA — nome do lead, empresa, título da proposta, data
2. O QUE ENTENDEMOS — dores e contexto identificados na conversa
3. O QUE VAMOS FAZER — serviços selecionados com descrição detalhada
4. INVESTIMENTO — tabela com os serviços escolhidos e valores, total mensal/projeto
5. POR QUE AGORA — urgência baseada nas dores do lead
6. PRÓXIMOS PASSOS — call to action claro com contato

NUNCA omita a seção de INVESTIMENTO com os valores. Ela é obrigatória.

CADA SEÇÃO deve ter:
- background-color explícito (#070D0D ou variação escura)
- padding mínimo de 60px
- min-height: 100vh para ocupar a página inteira no PDF`

  const userPrompt = `LEAD:
Nome: ${lead.nome}
Empresa: ${lead.empresa || 'Não informado'}
Nicho: ${lead.nicho || 'Não informado'}

${contextoLead || 'Nenhum contexto de conversa fornecido — gere uma proposta genérica mas personalizada para o lead.'}

Gere a proposta comercial completa em HTML.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Resposta inesperada do Claude')
  return content.text
}

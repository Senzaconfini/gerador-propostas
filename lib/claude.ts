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
    .map(s => `- ${s.nome}: ${s.preco}/${s.unidade}${s.descricao ? ` — ${s.descricao}` : ''}`)
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
- Fontes via Google Fonts: Newsreader (títulos e display) e Archivo (corpo e rótulos). Importe ambas no início do <style>: @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Archivo:wght@400;500;600;700&display=swap');

PALETA DE CORES — USE EXATAMENTE ESTAS (identidade Senza Confini):
- Fundo principal: #141714 (quase preto esverdeado)
- Superfície cards: #1C241C
- Verde da marca: #1E3320
- Verde da capa (fundo da capa, onde entra a logo): #223522
- Texto principal: #E8E0D0 (creme)
- Dourado (acento, títulos de destaque, números, linhas finas): #B89A5A
- Verde digital (acento secundário): #80A880

REGRAS DE DESIGN CRÍTICAS:
1. TODOS os elementos devem ter fundo escuro (#141714, #1C241C ou #1E3320) — NUNCA fundo branco ou claro
2. TODO o texto deve ser claro (#E8E0D0) ou dourado (#B89A5A) — NUNCA texto escuro em fundo claro
3. Use o dourado #B89A5A como cor de destaque com elegância e sem exagero: títulos de seção, números do investimento, linhas finas e detalhes
4. No início do <style>, SEMPRE inclua: * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
5. Defina background-color: #141714 no body e em TODAS as seções, EXCETO a CAPA, que usa #223522
6. Use page-break-after: always para separar seções como páginas distintas no PDF

ESTRUTURA OBRIGATÓRIA — TODAS AS 6 SEÇÕES DEVEM ESTAR PRESENTES:
1. CAPA — fundo verde #223522 ocupando a página inteira. No topo, centralizada, a LOGO da Senza: <img src="/senza-logo.jpg" alt="Senza Confini" style="width:150px;height:150px;border-radius:50%;display:block;margin:0 auto 32px;" />. Como a logo já tem o fundo verde #223522, ela se integra sem emenda a esse mesmo verde. Abaixo da logo: o nome "Senza Confini" em Newsreader, o título da proposta, o nome do lead e da empresa, e a data
2. O QUE ENTENDEMOS — dores e contexto identificados na conversa
3. O QUE VAMOS FAZER — serviços selecionados com descrição detalhada
4. INVESTIMENTO — tabela com os serviços escolhidos e valores, total mensal/projeto
5. POR QUE AGORA — urgência baseada nas dores do lead
6. PRÓXIMOS PASSOS — call to action claro com contato

NUNCA omita a seção de INVESTIMENTO com os valores. Ela é obrigatória.

CADA SEÇÃO deve ter:
- background-color explícito (#141714 ou variação escura; a CAPA usa #223522)
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

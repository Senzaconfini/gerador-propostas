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

  const systemPrompt = `Você é um especialista em propostas comerciais para agências de marketing e negócios criativos.
Você vai gerar uma proposta comercial personalizada em HTML completo, visualmente bonita e persuasiva.

BASE DE CONHECIMENTO DA AGÊNCIA:
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
5. Use linguagem do tom de voz da agência
6. Inclua uma seção de "por que agora" baseada nas dores identificadas
7. Finalize com um próximo passo claro

FORMATO HTML:
- HTML completo com CSS inline (para funcionar como PDF ao imprimir)
- Design profissional usando as cores da identidade visual já definidas no CSS
- Fontes: Playfair Display (títulos) e Inter (corpo) via Google Fonts
- Paleta: #070D0D (fundo), #FFF7EC (texto claro), #F5CBD7 (destaques rosa), #741E31 (berry), #C4908E (rose gold), #3E2723 (espresso)
- Estrutura: Capa → O que entendemos → O que vamos fazer → Investimento → Próximos passos → Assinatura
- Otimizado para impressão (@media print)
- Não inclua <!DOCTYPE html> ou <html> tags — retorne apenas o conteúdo dentro de <body> com o <style> no início`

  const userPrompt = `LEAD:
Nome: ${lead.nome}
Empresa: ${lead.empresa || 'Não informado'}
Nicho: ${lead.nicho || 'Não informado'}

${contextoLead || 'Nenhum contexto de conversa fornecido — gere uma proposta genérica mas personalizada para o lead.'}

Gere a proposta comercial completa em HTML.`

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8000,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Resposta inesperada do Claude')
  return content.text
}

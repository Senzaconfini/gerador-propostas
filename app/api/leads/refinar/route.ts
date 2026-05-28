import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { leadId, instrucao } = await req.json()
  if (!leadId || !instrucao) return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })

  const { data: proposta } = await supabase
    .from('propostas')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!proposta) return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: `Você é um editor de propostas comerciais em HTML.
Receberá uma proposta HTML existente e uma instrução de alteração.
Faça APENAS a alteração solicitada, mantendo todo o restante idêntico.
Retorne o HTML completo modificado, sem explicações.
IMPORTANTE: Mantenha todos os estilos, cores e estrutura originais.`,
    messages: [{
      role: 'user',
      content: `HTML ATUAL DA PROPOSTA:\n${proposta.html}\n\nINSTRUÇÃO DE ALTERAÇÃO:\n${instrucao}\n\nRetorne o HTML completo com a alteração aplicada.`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') return NextResponse.json({ error: 'Erro no Claude' }, { status: 500 })

  const novoHtml = content.text

  await supabase.from('propostas').update({ html: novoHtml }).eq('id', proposta.id)

  return NextResponse.json({ ok: true })
}

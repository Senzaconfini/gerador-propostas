import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { refinarConteudoProposta } from '@/lib/claude'
import { montarHtmlProposta, type ConteudoProposta } from '@/lib/template'

export const maxDuration = 60

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
  if (!proposta.conteudo) return NextResponse.json({
    error: 'Essa proposta foi gerada em um formato antigo e não pode ser refinada. Gere uma nova proposta para ativar o refino rápido.',
  }, { status: 400 })

  try {
    const novoConteudo = await refinarConteudoProposta({
      conteudoAtual: proposta.conteudo as ConteudoProposta,
      instrucao,
    })

    const novoHtml = montarHtmlProposta(novoConteudo)

    await supabase.from('propostas')
      .update({ html: novoHtml, conteudo: novoConteudo })
      .eq('id', proposta.id)

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const semCredito = msg.includes('credit') || msg.includes('billing') || msg.includes('quota') || msg.includes('insufficient')
    return NextResponse.json({
      error: semCredito
        ? 'Créditos da API Claude esgotados. Acesse console.anthropic.com → Billing e adicione um método de pagamento.'
        : `Erro ao refinar: ${msg}`,
    }, { status: 500 })
  }
}

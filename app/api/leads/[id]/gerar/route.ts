import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { gerarProposta } from '@/lib/claude'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [
    { data: lead },
    { data: ctx },
    { data: config },
    { data: servicos },
  ] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase.from('lead_contexto').select('*').eq('lead_id', id).single(),
    supabase.from('config').select('*').single(),
    supabase.from('servicos').select('*').eq('ativo', true).order('ordem'),
  ])

  if (!lead) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
  if (!config) return NextResponse.json({ error: 'Configure a agência antes de gerar propostas' }, { status: 400 })

  const html = await gerarProposta({
    config,
    servicos: servicos || [],
    lead: { nome: lead.nome, empresa: lead.empresa, nicho: lead.nicho },
    conversa:        ctx?.conversa        || '',
    reuniao:         ctx?.reuniao         || '',
    audioTranscrito: ctx?.audio_transcrito || '',
    notasExtras:     ctx?.notas_extras    || '',
  })

  // Salvar proposta no banco
  const { data: proposta } = await supabase
    .from('propostas')
    .insert({ lead_id: id, html })
    .select()
    .single()

  // Atualizar status do lead
  await supabase.from('leads').update({ status: 'proposta_gerada', updated_at: new Date().toISOString() }).eq('id', id)

  return NextResponse.json({ propostaId: proposta?.id })
}

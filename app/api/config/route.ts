import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [{ data: config }, { data: servicos }] = await Promise.all([
    supabase.from('config').select('*').single(),
    supabase.from('servicos').select('*').order('ordem'),
  ])
  return NextResponse.json({ config: config || null, servicos: servicos || [] })
}

type ServicoInput = { nome?: string; descricao?: string; preco?: string; unidade?: string }

export async function POST(req: NextRequest) {
  const { config, servicos } = await req.json() as {
    config: Record<string, unknown>
    servicos: ServicoInput[]
  }

  const { data: existing } = await supabase.from('config').select('id').single()
  if (existing?.id) {
    await supabase.from('config').update({ ...config, updated_at: new Date().toISOString() }).eq('id', existing.id)
  } else {
    await supabase.from('config').insert(config)
  }

  await supabase.from('servicos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const toSave = (servicos || [])
    .filter(s => s.nome)
    .map((s, i) => ({
      nome: s.nome!,
      descricao: s.descricao || '',
      preco: s.preco || '0',
      unidade: s.unidade || 'mês',
      ordem: i,
      ativo: true,
    }))
  if (toSave.length > 0) await supabase.from('servicos').insert(toSave)

  return NextResponse.json({ ok: true })
}

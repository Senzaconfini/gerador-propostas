import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ leads: data || [] })
}

export async function POST(req: NextRequest) {
  const form = await req.json() as { nome?: string; empresa?: string; whatsapp?: string; nicho?: string }

  const { data, error } = await supabase
    .from('leads')
    .insert({
      nome: form.nome || '',
      empresa: form.empresa || '',
      whatsapp: form.whatsapp || '',
      nicho: form.nicho || '',
      status: 'novo',
    })
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Erro ao criar lead' }, { status: 500 })

  await supabase.from('lead_contexto').insert({
    lead_id: data.id, conversa: '', reuniao: '', audio_transcrito: '', notas_extras: '',
  })

  return NextResponse.json({ lead: data })
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json() as {
    conversa?: string; reuniao?: string; audio_transcrito?: string; notas_extras?: string
  }
  const ctx = {
    conversa: body.conversa || '',
    reuniao: body.reuniao || '',
    audio_transcrito: body.audio_transcrito || '',
    notas_extras: body.notas_extras || '',
  }

  const { data: existing } = await supabase.from('lead_contexto').select('id').eq('lead_id', id).single()
  if (existing?.id) {
    await supabase.from('lead_contexto').update({ ...ctx, updated_at: new Date().toISOString() }).eq('id', existing.id)
  } else {
    await supabase.from('lead_contexto').insert({ ...ctx, lead_id: id })
  }

  return NextResponse.json({ ok: true })
}

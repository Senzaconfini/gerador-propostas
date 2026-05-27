import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { enviarMensagem, uazapiAtivo } from '@/lib/uazapi'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!uazapiAtivo()) return NextResponse.json({ error: 'UAZAPI não configurado' }, { status: 400 })

  const [{ data: lead }, { data: config }] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase.from('config').select('mensagem_padrao').single(),
  ])

  if (!lead?.whatsapp) return NextResponse.json({ error: 'Lead sem WhatsApp cadastrado' }, { status: 400 })

  const mensagem = (config?.mensagem_padrao || 'Olá, [nome]! Preparei uma proposta para você. Segue em anexo!')
    .replace('[nome]', lead.nome)

  await enviarMensagem(lead.whatsapp, mensagem)

  // Marcar como enviada
  await supabase.from('leads').update({ status: 'proposta_enviada', updated_at: new Date().toISOString() }).eq('id', id)
  await supabase.from('propostas').update({ enviada: true, enviada_em: new Date().toISOString() }).eq('lead_id', id)

  return NextResponse.json({ ok: true })
}

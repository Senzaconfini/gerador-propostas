import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { enviarMensagem, enviarArquivo, uazapiAtivo } from '@/lib/uazapi'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!uazapiAtivo()) return NextResponse.json({ error: 'UAZAPI não configurado' }, { status: 400 })

  const [{ data: lead }, { data: config }, { data: proposta }] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase.from('config').select('mensagem_padrao').single(),
    supabase.from('propostas').select('html').eq('lead_id', id).order('created_at', { ascending: false }).limit(1).single(),
  ])

  if (!lead?.whatsapp) return NextResponse.json({ error: 'Lead sem WhatsApp cadastrado' }, { status: 400 })

  const mensagem = (config?.mensagem_padrao || 'Olá, [nome]! Preparei uma proposta para você. Segue em anexo!')
    .replace('[nome]', lead.nome)

  try {
    // 1. Envia a mensagem de texto
    await enviarMensagem(lead.whatsapp, mensagem)

    // 2. Envia o HTML da proposta como arquivo
    if (proposta?.html) {
      const base64 = Buffer.from(proposta.html, 'utf-8').toString('base64')
      const filename = `proposta-${(lead.empresa || lead.nome).replace(/\s+/g, '-').toLowerCase()}.html`
      await enviarArquivo(lead.whatsapp, base64, filename)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao enviar'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Marcar como enviada
  await supabase.from('leads').update({ status: 'proposta_enviada', updated_at: new Date().toISOString() }).eq('id', id)
  await supabase.from('propostas').update({ enviada: true, enviada_em: new Date().toISOString() }).eq('lead_id', id)

  return NextResponse.json({ ok: true })
}

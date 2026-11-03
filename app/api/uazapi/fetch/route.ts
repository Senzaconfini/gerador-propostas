import { NextRequest, NextResponse } from 'next/server'
import { fetchChat, uazapiAtivo } from '@/lib/uazapi'

export async function HEAD() {
  return uazapiAtivo() ? NextResponse.json(null, { status: 200 }) : NextResponse.json(null, { status: 503 })
}

export async function GET(req: NextRequest) {
  if (!uazapiAtivo()) return NextResponse.json({ error: 'UAZAPI não configurado' }, { status: 503 })

  const numero = req.nextUrl.searchParams.get('numero')
  if (!numero) return NextResponse.json({ error: 'Número obrigatório' }, { status: 400 })

  try {
    const transcript = await fetchChat(numero)
    if (transcript.startsWith('__RAW_COUNT__:')) {
      const n = transcript.split(':')[1]
      return NextResponse.json({
        error: `O UAZAPI retornou ${n} mensagem(ns), mas em um formato que o app não reconheceu. Avise o suporte para ajustar o mapeamento.`,
      })
    }
    if (!transcript) {
      return NextResponse.json({
        error: 'O UAZAPI não retornou mensagens para este número. Normalmente é conversa anterior à conexão da instância, ou sem histórico salvo. Você pode colar a conversa manualmente.',
      })
    }
    return NextResponse.json({ transcript })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[UAZAPI route error]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

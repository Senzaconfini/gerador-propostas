import { NextRequest, NextResponse } from 'next/server'
import { fetchChat, uazapiAtivo } from '@/lib/uazapi'

export async function HEAD() {
  return uazapiAtivo() ? NextResponse.json(null, { status: 200 }) : NextResponse.json(null, { status: 503 })
}

export async function GET(req: NextRequest) {
  if (!uazapiAtivo()) return NextResponse.json({ error: 'UAZAPI não configurado' }, { status: 503 })

  const numero = req.nextUrl.searchParams.get('numero')
  if (!numero) return NextResponse.json({ error: 'Número obrigatório' }, { status: 400 })

  const transcript = await fetchChat(numero)
  return NextResponse.json({ transcript })
}

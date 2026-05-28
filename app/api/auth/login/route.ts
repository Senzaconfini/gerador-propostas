import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { senha } = await req.json()
  const APP_PASSWORD = process.env.APP_PASSWORD

  if (!APP_PASSWORD || senha !== APP_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', APP_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}

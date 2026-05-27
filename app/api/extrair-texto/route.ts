import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const nome = file.name.toLowerCase()
  let texto = ''

  if (nome.endsWith('.docx') || nome.endsWith('.doc')) {
    const result = await mammoth.extractRawText({ buffer })
    texto = result.value
  } else if (nome.endsWith('.txt')) {
    texto = buffer.toString('utf-8')
  } else if (nome.endsWith('.pdf')) {
    try {
      const pdfParse = await import('pdf-parse')
      const fn = (pdfParse as unknown as { default: (b: Buffer) => Promise<{ text: string }> }).default ?? pdfParse
      const data = await (fn as (b: Buffer) => Promise<{ text: string }>)(buffer)
      texto = data.text
    } catch {
      texto = 'Erro ao extrair texto do PDF. Cole o texto manualmente.'
    }
  } else {
    texto = buffer.toString('utf-8')
  }

  return NextResponse.json({ texto: texto.trim() })
}

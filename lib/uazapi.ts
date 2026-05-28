const BASE_URL  = process.env.UAZAPI_BASE_URL  || ''
const TOKEN     = process.env.UAZAPI_INSTANCE_TOKEN || ''

export const uazapiAtivo = () => !!TOKEN && !!BASE_URL

export async function fetchChat(numero: string, maxMessages = 500): Promise<string> {
  if (!uazapiAtivo()) throw new Error('UAZAPI não configurado')

  const chatid = numero.replace(/\D/g, '') + '@s.whatsapp.net'

  const res = await fetch(`${BASE_URL}/message/find`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': TOKEN,
    },
    body: JSON.stringify({ chatid, limit: maxMessages, offset: 0 }),
  })

  const text = await res.text()

  if (!res.ok) throw new Error(`UAZAPI erro ${res.status}: ${text.slice(0, 200)}`)

  const data = JSON.parse(text)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const msgs: any[] = data.messages || []
  msgs.sort((a, b) => (a.timestamp || a.messageTimestamp || 0) - (b.timestamp || b.messageTimestamp || 0))

  return msgs
    .map(m => {
      const ts = m.messageTimestamp || m.timestamp
      const dt = ts ? new Date(ts > 1e12 ? ts : ts * 1000).toLocaleString('pt-BR') : ''
      const quem = m.fromMe ? 'Você' : 'Lead'

      const tipo = m.messageType || ''
      const texto =
        m.text ||
        (tipo.includes('Audio') ? '[áudio]' :
         tipo.includes('Image') ? '[imagem]' :
         tipo.includes('Video') ? '[vídeo]' :
         tipo.includes('Document') ? '[documento]' :
         tipo.includes('Sticker') ? '[sticker]' :
         '[mídia]')

      return `[${dt}] ${quem}: ${texto}`
    })
    .filter(l => !l.includes('] :'))
    .join('\n')
}

export async function enviarMensagem(numero: string, texto: string): Promise<void> {
  if (!uazapiAtivo()) throw new Error('UAZAPI não configurado')

  const number = numero.replace(/\D/g, '')
  const res = await fetch(`${BASE_URL}/send/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'token': TOKEN },
    body: JSON.stringify({ number, text: texto }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`UAZAPI erro ${res.status}: ${body.slice(0, 200)}`)
  }
}

export async function enviarArquivo(numero: string, base64: string, filename: string, caption = ''): Promise<void> {
  if (!uazapiAtivo()) throw new Error('UAZAPI não configurado')

  const number = numero.replace(/\D/g, '')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = { number, base64, filename }
  if (caption) payload.caption = caption

  const res = await fetch(`${BASE_URL}/send/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'token': TOKEN },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`UAZAPI erro ${res.status}: ${body.slice(0, 200)}`)
  }
}

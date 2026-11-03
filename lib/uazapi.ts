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
  // O array de mensagens pode vir em formatos diferentes dependendo da versão do UAZAPI
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const msgs: any[] =
    Array.isArray(data)                 ? data :
    Array.isArray(data.messages)        ? data.messages :
    Array.isArray(data.data)            ? data.data :
    Array.isArray(data.data?.messages)  ? data.data.messages :
    Array.isArray(data.result)          ? data.result :
    Array.isArray(data.records)         ? data.records :
    []

  const getTs = (m: Record<string, unknown>): number =>
    Number(m.messageTimestamp || m.timestamp || m.t ||
      (m.key as Record<string, unknown>)?.timestamp || 0)

  msgs.sort((a, b) => getTs(a) - getTs(b))

  const linhas = msgs.map(m => {
    const tsRaw = getTs(m)
    const dt = tsRaw ? new Date(tsRaw > 1e12 ? tsRaw : tsRaw * 1000).toLocaleString('pt-BR') : ''
    const fromMe = m.fromMe ?? m.key?.fromMe ?? false
    const quem = fromMe ? 'Você' : 'Lead'

    const tipo = m.messageType || m.type || ''
    const msgObj = m.message || {}
    const texto =
      m.text ||
      m.body ||
      m.caption ||
      m.content ||
      msgObj.conversation ||
      msgObj.extendedTextMessage?.text ||
      msgObj.imageMessage?.caption ||
      msgObj.videoMessage?.caption ||
      (String(tipo).toLowerCase().includes('audio') ? '[áudio]' :
       String(tipo).toLowerCase().includes('image') ? '[imagem]' :
       String(tipo).toLowerCase().includes('video') ? '[vídeo]' :
       String(tipo).toLowerCase().includes('document') ? '[documento]' :
       String(tipo).toLowerCase().includes('sticker') ? '[sticker]' :
       '')

    return texto ? `[${dt}] ${quem}: ${texto}` : ''
  }).filter(Boolean)

  // Devolve o transcript; se não houver nada reconhecível, sinaliza quantas mensagens brutas vieram
  if (linhas.length === 0) {
    return msgs.length > 0 ? `__RAW_COUNT__:${msgs.length}` : ''
  }
  return linhas.join('\n')
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

const BASE_URL  = process.env.UAZAPI_BASE_URL  || ''
const TOKEN     = process.env.UAZAPI_INSTANCE_TOKEN || ''

export const uazapiAtivo = () => !!TOKEN && !!BASE_URL

export async function fetchChat(numero: string, maxMessages = 200): Promise<string> {
  if (!uazapiAtivo()) throw new Error('UAZAPI não configurado')

  const chatId = numero.replace(/\D/g, '') + '@s.whatsapp.net'
  const res = await fetch(`${BASE_URL}/chat/findMessages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': TOKEN,
    },
    body: JSON.stringify({ chatId, count: maxMessages }),
  })

  if (!res.ok) throw new Error(`UAZAPI erro: ${res.status}`)
  const data = await res.json()

  // Formata mensagens em transcript legível
  const msgs: { from: string; body: string; timestamp: number }[] = data.messages || []
  msgs.sort((a, b) => a.timestamp - b.timestamp)

  return msgs
    .map(m => {
      const dt = new Date(m.timestamp * 1000).toLocaleString('pt-BR')
      const quem = m.from.includes('@s.whatsapp.net') ? 'Lead' : 'Você'
      return `[${dt}] ${quem}: ${m.body || '[mídia]'}`
    })
    .join('\n')
}

export async function enviarMensagem(numero: string, texto: string): Promise<void> {
  if (!uazapiAtivo()) throw new Error('UAZAPI não configurado')

  const phone = numero.replace(/\D/g, '')
  await fetch(`${BASE_URL}/message/sendText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'token': TOKEN },
    body: JSON.stringify({ phone, message: texto }),
  })
}

export async function enviarArquivo(numero: string, base64: string, filename: string, caption = ''): Promise<void> {
  if (!uazapiAtivo()) throw new Error('UAZAPI não configurado')

  const phone = numero.replace(/\D/g, '')
  await fetch(`${BASE_URL}/message/sendFile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'token': TOKEN },
    body: JSON.stringify({ phone, base64, filename, caption }),
  })
}

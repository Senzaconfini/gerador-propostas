import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost'
    // Usa service_role no servidor (API routes), anon key no browser
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      || 'placeholder'
    _client = createClient(url, key)
  }
  return _client
}

// Compatibilidade: export direto para uso no cliente
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  }
})

// Types
export type Lead = {
  id: string
  nome: string
  empresa: string
  whatsapp: string
  nicho: string
  status: 'novo' | 'proposta_gerada' | 'proposta_enviada'
  created_at: string
  updated_at: string
}

export type LeadContexto = {
  id: string
  lead_id: string
  conversa: string
  reuniao: string
  audio_transcrito: string
  notas_extras: string
}

export type Proposta = {
  id: string
  lead_id: string
  html: string
  enviada: boolean
  enviada_em: string | null
  created_at: string
}

export type Servico = {
  id: string
  nome: string
  descricao: string
  preco: string
  unidade: string
  ordem: number
  ativo: boolean
}

export type Config = {
  id: string
  agencia_nome: string
  agencia_descricao: string
  agencia_diferenciais: string
  tom_de_voz: string
  mensagem_padrao: string
}

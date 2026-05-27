'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type Lead, type LeadContexto } from '@/lib/supabase'
import { ArrowLeft, Download, Wand2, MessageSquare, FileText, Mic, StickyNote, Phone } from 'lucide-react'
import Link from 'next/link'

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [ctx, setCtx] = useState<Partial<LeadContexto>>({ conversa: '', reuniao: '', audio_transcrito: '', notas_extras: '' })
  const [saving, setSaving] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [puxando, setPuxando] = useState(false)
  const [uazapiAtivo, setUazapiAtivo] = useState(false)
  const [tab, setTab] = useState<'conversa' | 'reuniao' | 'audio' | 'notas'>('conversa')
  const reuniaoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('leads').select('*').eq('id', id).single(),
      supabase.from('lead_contexto').select('*').eq('lead_id', id).single(),
    ]).then(([{ data: l }, { data: c }]) => {
      if (l) setLead(l)
      if (c) setCtx(c)
    })
    // Checar UAZAPI
    fetch('/api/uazapi/fetch', { method: 'HEAD' }).then(r => setUazapiAtivo(r.ok))
  }, [id])

  async function salvarContexto() {
    setSaving(true)
    const { data: existing } = await supabase.from('lead_contexto').select('id').eq('lead_id', id).single()
    if (existing?.id) {
      await supabase.from('lead_contexto').update({ ...ctx, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('lead_contexto').insert({ ...ctx, lead_id: id })
    }
    setSaving(false)
  }

  async function puxarConversa() {
    if (!lead?.whatsapp) return
    setPuxando(true)
    const res = await fetch(`/api/uazapi/fetch?numero=${lead.whatsapp}`)
    const data = await res.json()
    if (data.transcript) setCtx(p => ({ ...p, conversa: data.transcript }))
    setPuxando(false)
  }

  async function handleUploadArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/extrair-texto', { method: 'POST', body: form })
    const { texto } = await res.json()
    if (texto) setCtx(p => ({ ...p, reuniao: texto }))
  }

  async function gerarProposta() {
    await salvarContexto()
    setGerando(true)
    const res = await fetch(`/api/leads/${id}/gerar`, { method: 'POST' })
    const data = await res.json()
    setGerando(false)
    if (data.propostaId) {
      router.push(`/leads/${id}/proposta`)
    }
  }

  const tabs = [
    { key: 'conversa', label: 'Conversa WhatsApp', icon: MessageSquare },
    { key: 'reuniao',  label: 'Ata de Reunião',    icon: FileText },
    { key: 'audio',    label: 'Áudio Transcrito',   icon: Mic },
    { key: 'notas',    label: 'Notas Extras',        icon: StickyNote },
  ] as const

  if (!lead) return <div style={{ color: 'var(--muted)', paddingTop: 40 }}>Carregando...</div>

  return (
    <div style={{ maxWidth: 820 }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}>
        <ArrowLeft size={14} /> Dashboard
      </Link>

      {/* Header do lead */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <div className="section-label">Lead</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: 'var(--cream)', marginBottom: 6 }}>{lead.nome}</h1>
          <div style={{ color: 'var(--muted)', fontSize: 14, display: 'flex', gap: 16 }}>
            {lead.empresa && <span>{lead.empresa}</span>}
            {lead.nicho && <span>· {lead.nicho}</span>}
            {lead.whatsapp && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={12} /> {lead.whatsapp}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {lead.status !== 'novo' && (
            <Link href={`/leads/${id}/proposta`}>
              <button className="btn btn-secondary"><Download size={14} /> Ver proposta</button>
            </Link>
          )}
          <button className="btn btn-primary" onClick={gerarProposta} disabled={gerando} style={{ padding: '10px 20px' }}>
            {gerando ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Gerando proposta...
              </span>
            ) : (
              <><Wand2 size={14} /> Gerar proposta com Claude</>
            )}
          </button>
        </div>
      </div>

      {/* Contexto do lead */}
      <div className="card">
        <div className="section-label">Contexto do lead</div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
          Adicione o máximo de contexto possível. O Claude usa essas informações para personalizar a proposta.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: '8px 8px 0 0',
              fontSize: 13, fontWeight: tab === key ? 600 : 400, cursor: 'pointer', border: 'none',
              background: tab === key ? 'var(--surface2)' : 'transparent',
              color: tab === key ? 'var(--cream)' : 'var(--muted)', borderBottom: tab === key ? '2px solid var(--rose-gold)' : '2px solid transparent', transition: 'all 0.15s'
            }}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Tab: Conversa WhatsApp */}
        {tab === 'conversa' && (
          <div>
            {uazapiAtivo && lead.whatsapp && (
              <div style={{ marginBottom: 12 }}>
                <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={puxarConversa} disabled={puxando}>
                  {puxando ? 'Puxando conversa...' : '⚡ Puxar via UAZAPI automaticamente'}
                </button>
              </div>
            )}
            <label className="label">Cole o histórico da conversa do WhatsApp</label>
            <textarea className="input" rows={12} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
              placeholder={`[10/05/2026 14:32] Lead: Oi, vi seu trabalho no Instagram e quero saber mais sobre gestão de redes...\n[10/05/2026 14:45] Você: Olá! Claro, me conta um pouco sobre seu negócio...`}
              value={ctx.conversa || ''} onChange={e => setCtx(p => ({ ...p, conversa: e.target.value }))} />
          </div>
        )}

        {/* Tab: Ata de Reunião */}
        {tab === 'reuniao' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => reuniaoRef.current?.click()}>
                <FileText size={13} /> Subir arquivo (PDF, DOCX, TXT)
              </button>
              <input ref={reuniaoRef} type="file" accept=".pdf,.docx,.txt,.doc" style={{ display: 'none' }} onChange={handleUploadArquivo} />
            </div>
            <label className="label">Ou cole a ata diretamente</label>
            <textarea className="input" rows={12} placeholder="Cole aqui a ata da reunião ou transcrição da call..."
              value={ctx.reuniao || ''} onChange={e => setCtx(p => ({ ...p, reuniao: e.target.value }))} />
          </div>
        )}

        {/* Tab: Áudio Transcrito */}
        {tab === 'audio' && (
          <div>
            <div className="card" style={{ background: 'var(--surface2)', marginBottom: 16, padding: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                {uazapiAtivo
                  ? '✓ UAZAPI ativo — áudios do WhatsApp são transcritos automaticamente ao puxar a conversa.'
                  : 'Para transcrição automática de áudios do WhatsApp, configure o UAZAPI no .env.'}
              </p>
            </div>
            <label className="label">Cole aqui a transcrição do áudio</label>
            <textarea className="input" rows={10} placeholder="Transcrição do áudio do lead..."
              value={ctx.audio_transcrito || ''} onChange={e => setCtx(p => ({ ...p, audio_transcrito: e.target.value }))} />
          </div>
        )}

        {/* Tab: Notas Extras */}
        {tab === 'notas' && (
          <div>
            <label className="label">Observações adicionais</label>
            <textarea className="input" rows={10} placeholder="Qualquer informação relevante sobre o lead: objeções levantadas, concorrentes mencionados, urgência, orçamento estimado..."
              value={ctx.notas_extras || ''} onChange={e => setCtx(p => ({ ...p, notas_extras: e.target.value }))} />
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={salvarContexto} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar contexto'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

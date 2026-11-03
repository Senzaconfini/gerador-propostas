'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { type Lead, type Proposta } from '@/lib/supabase'
import { ArrowLeft, Printer, Send, RefreshCw, CheckCircle, Sparkles, ChevronDown, ChevronUp, Download } from 'lucide-react'
import Link from 'next/link'

export default function PropostaPage() {
  const { id } = useParams<{ id: string }>()
  const [lead, setLead] = useState<Lead | null>(null)
  const [proposta, setProposta] = useState<Proposta | null>(null)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [uazapiAtivo, setUazapiAtivo] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [instrucao, setInstrucao] = useState('')
  const [refinando, setRefinando] = useState(false)
  const [painelAberto, setPainelAberto] = useState(false)

  useEffect(() => {
    fetch(`/api/leads/${id}/proposta`)
      .then(r => r.json())
      .then(({ lead: l, proposta: p }) => {
        if (l) setLead(l)
        if (p) setProposta(p)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    fetch('/api/uazapi/fetch', { method: 'HEAD' }).then(r => setUazapiAtivo(r.ok))
  }, [id])

  async function enviarWhatsApp() {
    setEnviando(true)
    setErroEnvio('')
    const res = await fetch(`/api/leads/${id}/enviar`, { method: 'POST' })
    const data = await res.json()
    setEnviando(false)
    if (data.ok) { setEnviado(true) }
    else { setErroEnvio(data.error || 'Erro ao enviar') }
  }

  async function refinarProposta() {
    if (!instrucao.trim()) return
    setRefinando(true)
    try {
      const res = await fetch('/api/leads/refinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id, instrucao }),
      })
      const data = await res.json().catch(() => ({ error: 'O refino demorou demais e foi interrompido. Tente novamente.' }))
      if (data.ok) {
        // Recarrega proposta atualizada
        const { proposta: p } = await fetch(`/api/leads/${id}/proposta`).then(r => r.json())
        if (p) setProposta(p)
        setInstrucao('')
        setPainelAberto(false)
      } else {
        alert(data.error || 'Erro ao refinar a proposta.')
      }
    } catch {
      alert('Não foi possível refinar (tempo esgotado ou conexão). Tente novamente.')
    } finally {
      setRefinando(false)
    }
  }

  if (loading) return <div style={{ color: 'var(--muted)', paddingTop: 40 }}>Carregando proposta...</div>
  if (!proposta) return (
    <div style={{ maxWidth: 600 }}>
      <Link href={`/leads/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}>
        <ArrowLeft size={14} /> Voltar
      </Link>
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ color: 'var(--muted)' }}>Nenhuma proposta gerada ainda.</p>
        <Link href={`/leads/${id}`}><button className="btn btn-primary" style={{ marginTop: 20 }}>Gerar proposta</button></Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Barra de ações */}
      <div className="no-print" style={{
        position: 'fixed', top: 0, left: 220, right: 0, zIndex: 100,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href={`/leads/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> {lead?.nome}
          </Link>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Gerada em {new Date(proposta.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href={`/leads/${id}`}>
            <button className="btn btn-ghost" style={{ fontSize: 13 }}>
              <RefreshCw size={13} /> Regerar do zero
            </button>
          </Link>
          <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => setPainelAberto(v => !v)}>
            <Sparkles size={13} /> Refinar
            {painelAberto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => window.print()}>
            <Printer size={13} /> Salvar PDF
          </button>
          <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => {
            const blob = new Blob([proposta?.html ?? ''], { type: 'text/html;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `proposta-${lead?.empresa || lead?.nome || 'lead'}.html`
            a.click()
            URL.revokeObjectURL(url)
          }}>
            <Download size={13} /> Baixar HTML
          </button>
          {uazapiAtivo ? (
            enviado ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80', fontSize: 13 }}>
                <CheckCircle size={14} /> Enviado!
              </div>
            ) : (
              <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={enviarWhatsApp} disabled={enviando}>
                {enviando ? 'Enviando...' : <><Send size={13} /> Enviar WhatsApp</>}
              </button>
            )
          ) : null}
        </div>
        {erroEnvio && <div style={{ position: 'absolute', bottom: -32, right: 48, fontSize: 12, color: '#f87171' }}>{erroEnvio}</div>}
      </div>

      {/* Painel de refinamento */}
      {painelAberto && (
        <div className="no-print" style={{
          position: 'fixed', top: 53, left: 220, right: 0, zIndex: 99,
          background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
          padding: '16px 48px', display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1 }}>
            <label className="label" style={{ marginBottom: 6 }}>O que você quer mudar na proposta?</label>
            <textarea
              className="input"
              rows={2}
              style={{ minHeight: 'unset', resize: 'none', fontSize: 13 }}
              placeholder='Ex: "Mude o valor do serviço de gestão para R$ 2.000" ou "Adicione uma seção de depoimentos" ou "Troque o tom para mais informal"'
              value={instrucao}
              onChange={e => setInstrucao(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 22, whiteSpace: 'nowrap' }}
            onClick={refinarProposta}
            disabled={refinando || !instrucao.trim()}
          >
            {refinando ? (
              <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Refinando...</>
            ) : (
              <><Sparkles size={14} /> Aplicar alteração</>
            )}
          </button>
        </div>
      )}

      {/* Proposta */}
      <div style={{ paddingTop: painelAberto ? 140 : 64 }}>
        <div
          id="proposta-html"
          dangerouslySetInnerHTML={{ __html: proposta.html }}
          style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          .no-print { display: none !important; }
          aside { display: none !important; }
          main { margin-left: 0 !important; padding: 0 !important; }
          #proposta-html { box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>
    </>
  )
}

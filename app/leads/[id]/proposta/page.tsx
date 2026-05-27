'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, type Lead, type Proposta } from '@/lib/supabase'
import { ArrowLeft, Printer, Send, RefreshCw, CheckCircle } from 'lucide-react'
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

  useEffect(() => {
    Promise.all([
      supabase.from('leads').select('*').eq('id', id).single(),
      supabase.from('propostas').select('*').eq('lead_id', id).order('created_at', { ascending: false }).limit(1).single(),
    ]).then(([{ data: l }, { data: p }]) => {
      if (l) setLead(l)
      if (p) setProposta(p)
      setLoading(false)
    })
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

  function imprimir() {
    window.print()
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
      {/* Barra de ações — só aparece na tela, não no print */}
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
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Proposta gerada em {new Date(proposta.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href={`/leads/${id}`}>
            <button className="btn btn-ghost" style={{ fontSize: 13, gap: 6 }}>
              <RefreshCw size={13} /> Regerar
            </button>
          </Link>
          <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={imprimir}>
            <Printer size={13} /> Imprimir / Salvar PDF
          </button>
          {uazapiAtivo ? (
            enviado ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80', fontSize: 13 }}>
                <CheckCircle size={14} /> Enviado!
              </div>
            ) : (
              <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={enviarWhatsApp} disabled={enviando}>
                {enviando ? 'Enviando...' : <><Send size={13} /> Enviar via WhatsApp</>}
              </button>
            )
          ) : (
            <div style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 200, textAlign: 'right', lineHeight: 1.4 }}>
              Configure UAZAPI no .env para envio automático
            </div>
          )}
        </div>
        {erroEnvio && <div style={{ position: 'absolute', bottom: -32, right: 48, fontSize: 12, color: '#f87171' }}>{erroEnvio}</div>}
      </div>

      {/* Proposta — preview + versão de impressão */}
      <div style={{ paddingTop: 64 }}>
        <div
          id="proposta-html"
          dangerouslySetInnerHTML={{ __html: proposta.html }}
          style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
        />
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          aside { display: none !important; }
          main { margin-left: 0 !important; padding: 0 !important; }
          #proposta-html { box-shadow: none !important; border-radius: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
    </>
  )
}

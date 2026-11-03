'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { type Lead } from '@/lib/supabase'
import { Plus, FileText, Send, Clock, ChevronRight } from 'lucide-react'

const statusLabel: Record<string, { label: string; badge: string }> = {
  novo:              { label: 'Sem proposta',     badge: 'badge-pending'   },
  proposta_gerada:   { label: 'Proposta gerada',  badge: 'badge-generated' },
  proposta_enviada:  { label: 'Proposta enviada', badge: 'badge-sent'      },
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.json())
      .then(({ leads }) => { setLeads(leads || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const counts = {
    total:   leads.length,
    geradas: leads.filter(l => l.status === 'proposta_gerada').length,
    enviadas: leads.filter(l => l.status === 'proposta_enviada').length,
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div className="section-label">Visão geral</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--cream)', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>
          Gerencie seus leads e propostas geradas com IA.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Total de leads',      value: counts.total,   icon: FileText },
          { label: 'Propostas geradas',   value: counts.geradas,  icon: Clock    },
          { label: 'Propostas enviadas',  value: counts.enviadas, icon: Send     },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(196,144,142,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color="var(--rose-gold)" />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--cream)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Leads list */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-label" style={{ marginBottom: 0 }}>Leads recentes</div>
        <Link href="/leads/novo">
          <button className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
            <Plus size={14} /> Novo Lead
          </button>
        </Link>
      </div>

      {loading ? (
        <div style={{ color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>Carregando...</div>
      ) : leads.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <FileText size={32} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Nenhum lead ainda. Comece adicionando o primeiro.</p>
          <Link href="/leads/novo">
            <button className="btn btn-primary"><Plus size={14} /> Adicionar lead</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {leads.map(lead => {
            const st = statusLabel[lead.status] || statusLabel.novo
            return (
              <Link key={lead.id} href={`/leads/${lead.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--rose-gold)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--espresso)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--blush)', flexShrink: 0 }}>
                      {lead.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--cream)', fontSize: 14 }}>{lead.nome}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                        {lead.empresa && `${lead.empresa} · `}{lead.nicho || 'Nicho não informado'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`badge ${st.badge}`}>{st.label}</span>
                    <ChevronRight size={16} color="var(--muted)" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

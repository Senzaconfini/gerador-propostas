'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NovoLeadPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: '', empresa: '', whatsapp: '', nicho: '' })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  async function criar() {
    if (!form.nome.trim()) { setErro('Nome é obrigatório'); return }
    setSaving(true)
    const { data, error } = await supabase
      .from('leads')
      .insert({ ...form, status: 'novo' })
      .select()
      .single()
    if (error || !data) { setErro('Erro ao criar lead. Tente novamente.'); setSaving(false); return }

    // Cria contexto vazio para o lead
    await supabase.from('lead_contexto').insert({ lead_id: data.id, conversa: '', reuniao: '', audio_transcrito: '', notas_extras: '' })
    router.push(`/leads/${data.id}`)
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}>
        <ArrowLeft size={14} /> Voltar
      </Link>

      <div style={{ marginBottom: 36 }}>
        <div className="section-label">Leads</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--cream)' }}>Novo Lead</h1>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <label className="label">Nome *</label>
          <input className="input" placeholder="Nome do lead" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="label">Empresa</label>
          <input className="input" placeholder="Nome da empresa (opcional)" value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="label">WhatsApp</label>
          <input className="input" placeholder="5511999999999 (com DDI e DDD)" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label className="label">Nicho / Segmento</label>
          <input className="input" placeholder="Ex: Clínica de estética, e-commerce de moda, restaurante..." value={form.nicho} onChange={e => setForm(p => ({ ...p, nicho: e.target.value }))} />
        </div>

        {erro && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{erro}</div>}

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }} onClick={criar} disabled={saving}>
          {saving ? 'Criando...' : 'Criar lead e adicionar contexto →'}
        </button>
      </div>
    </div>
  )
}

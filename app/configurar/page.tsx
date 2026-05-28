'use client'
import { useEffect, useState } from 'react'
import { supabase, type Config, type Servico } from '@/lib/supabase'
import { Plus, Trash2, Save, CheckCircle } from 'lucide-react'

export default function ConfigurarPage() {
  const [config, setConfig] = useState<Partial<Config>>({
    agencia_nome: '', agencia_descricao: '', agencia_diferenciais: '', tom_de_voz: '', mensagem_padrao: ''
  })
  const [servicos, setServicos] = useState<Partial<Servico>[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('config').select('*').single(),
      supabase.from('servicos').select('*').order('ordem'),
    ]).then(([{ data: c }, { data: s }]) => {
      if (c) setConfig(c)
      setServicos(s || [])
      setLoading(false)
    })
  }, [])

  async function salvar() {
    setSaving(true)
    const { data: existing } = await supabase.from('config').select('id').single()
    if (existing?.id) {
      await supabase.from('config').update({ ...config, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('config').insert(config)
    }
    // Salvar serviços: deletar todos e reinserir
    await supabase.from('servicos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    const servicosParaSalvar = servicos
      .filter(s => s.nome)
      .map((s, i) => ({ nome: s.nome!, descricao: s.descricao || '', preco: s.preco || '0', unidade: s.unidade || 'mês', ordem: i, ativo: true }))
    if (servicosParaSalvar.length > 0) {
      await supabase.from('servicos').insert(servicosParaSalvar)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function addServico() {
    setServicos(prev => [...prev, { nome: '', descricao: '', preco: '', unidade: 'mês', ativo: true }])
  }

  function removeServico(i: number) {
    setServicos(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateServico(i: number, field: string, value: string) {
    setServicos(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  if (loading) return <div style={{ color: 'var(--muted)', paddingTop: 40 }}>Carregando configurações...</div>

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: 36 }}>
        <div className="section-label">Base de conhecimento</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: 'var(--cream)', marginBottom: 8 }}>Configurar</h1>
        <p style={{ color: 'var(--muted)' }}>Essas informações são usadas pelo Claude para gerar propostas personalizadas.</p>
      </div>

      {/* Empresa */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-label">Dados da empresa</div>

        <div style={{ marginBottom: 16 }}>
          <label className="label">Nome da empresa *</label>
          <input className="input" placeholder="Ex: Furtacor, Studio Silva, Consultoria XYZ..." value={config.agencia_nome || ''} onChange={e => setConfig(p => ({ ...p, agencia_nome: e.target.value }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label">Descrição (o que você faz)</label>
          <textarea className="input" rows={3} placeholder="Ex: Especializada em social media e tráfego pago para negócios locais..." value={config.agencia_descricao || ''} onChange={e => setConfig(p => ({ ...p, agencia_descricao: e.target.value }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="label">Diferenciais</label>
          <textarea className="input" rows={3} placeholder="Ex: Atendimento personalizado, relatórios semanais, equipe especializada em cada nicho..." value={config.agencia_diferenciais || ''} onChange={e => setConfig(p => ({ ...p, agencia_diferenciais: e.target.value }))} />
        </div>

        <div>
          <label className="label">Tom de voz</label>
          <input className="input" placeholder="Ex: Profissional, direto e acolhedor. Sem termos técnicos desnecessários." value={config.tom_de_voz || ''} onChange={e => setConfig(p => ({ ...p, tom_de_voz: e.target.value }))} />
        </div>
      </div>

      {/* Serviços */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 0 }}>Serviços e preços</div>
          <button className="btn btn-secondary" style={{ fontSize: 13, padding: '7px 14px' }} onClick={addServico}>
            <Plus size={14} /> Adicionar
          </button>
        </div>

        {servicos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 14 }}>
            Nenhum serviço ainda. Clique em "Adicionar" para começar.
          </div>
        )}

        {servicos.map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 90px 36px', gap: 10, marginBottom: 12, alignItems: 'start' }}>
            <div>
              {i === 0 && <label className="label">Serviço *</label>}
              <input className="input" placeholder="Gestão de Redes Sociais" value={s.nome || ''} onChange={e => updateServico(i, 'nome', e.target.value)} />
            </div>
            <div>
              {i === 0 && <label className="label">Descrição</label>}
              <input className="input" placeholder="O que inclui..." value={s.descricao || ''} onChange={e => updateServico(i, 'descricao', e.target.value)} />
            </div>
            <div>
              {i === 0 && <label className="label">Preço (R$)</label>}
              <input className="input" placeholder="1.500" value={s.preco || ''} onChange={e => updateServico(i, 'preco', e.target.value)} />
            </div>
            <div>
              {i === 0 && <label className="label">Por</label>}
              <select className="input" value={s.unidade || 'mês'} onChange={e => updateServico(i, 'unidade', e.target.value)} style={{ cursor: 'pointer' }}>
                <option value="mês">mês</option>
                <option value="projeto">projeto</option>
                <option value="hora">hora</option>
                <option value="semana">semana</option>
              </select>
            </div>
            <div style={{ paddingTop: i === 0 ? 22 : 0 }}>
              <button className="btn btn-ghost" style={{ padding: '10px 10px', color: 'var(--berry)' }} onClick={() => removeServico(i)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem padrão */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div className="section-label">Mensagem padrão WhatsApp</div>
        <label className="label">Texto enviado junto com a proposta</label>
        <textarea className="input" rows={4} placeholder={`Olá, [nome]! Preparei uma proposta personalizada para você. Segue em anexo. Fico à disposição para tirar dúvidas! 🌟`} value={config.mensagem_padrao || ''} onChange={e => setConfig(p => ({ ...p, mensagem_padrao: e.target.value }))} />
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Use <code style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>[nome]</code> para inserir o nome do lead automaticamente.
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }} onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : <><Save size={15} /> Salvar configurações</>}
        </button>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80', fontSize: 14 }}>
            <CheckCircle size={15} /> Salvo com sucesso!
          </div>
        )}
      </div>
    </div>
  )
}

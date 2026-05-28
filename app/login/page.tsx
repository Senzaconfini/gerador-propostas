'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    })
    if (res.ok) {
      router.push(params.get('from') || '/')
    } else {
      setErro('Senha incorreta')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div className="card" style={{ width: 360, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, color: 'var(--rose-gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Clube Divos da IA
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: 'var(--cream)', marginBottom: 8 }}>
          Gerador de Propostas
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 28 }}>
          Digite a senha para acessar
        </p>
        <form onSubmit={entrar}>
          <input
            className="input"
            type="password"
            placeholder="Senha de acesso"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            autoFocus
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            style={{ marginBottom: 12, textAlign: 'center', letterSpacing: '0.2em' }}
          />
          {erro && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{erro}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Settings, Plus, FileText, LayoutDashboard } from 'lucide-react'

const nav = [
  { href: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads/novo', icon: Plus,            label: 'Novo Lead'  },
  { href: '/configurar', icon: Settings,         label: 'Configurar' },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: 'var(--blush)', fontStyle: 'italic', marginBottom: 2 }}>
          Clube Divos da IA
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--cream)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Gerador de Propostas
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--cream)' : 'var(--muted)',
              background: active ? 'rgba(196,144,142,0.12)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
              marginBottom: 2,
            }}>
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
          Powered by Claude API
        </div>
      </div>
    </aside>
  )
}

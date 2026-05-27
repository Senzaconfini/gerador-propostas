import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Gerador de Propostas — Clube Divos da IA',
  description: 'Gere propostas personalizadas com IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Sidebar />
        <main style={{ marginLeft: 220, minHeight: '100vh', padding: '40px 48px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}

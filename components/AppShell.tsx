'use client'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const isLogin = path === '/login'

  return (
    <>
      {!isLogin && <Sidebar />}
      <main style={isLogin ? {} : { marginLeft: 220, minHeight: '100vh', padding: '40px 48px' }}>
        {children}
      </main>
    </>
  )
}

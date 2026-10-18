import type { ReactNode } from 'react'
import Navbar from './Navbar'
import { useLocation } from 'react-router-dom'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const desktop = location.pathname === '/desktop' || '__TAURI__' in window || '__TAURI_INTERNALS__' in window
  return (
    <div className={`app-shell ${desktop ? '' : 'focus-web'}`}>
      <Navbar />
      <main className="page-shell">{children}</main>
    </div>
  )
}

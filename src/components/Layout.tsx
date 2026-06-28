import type { ReactNode } from 'react'
import Navbar from './Navbar'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-shell">{children}</main>
    </div>
  )
}

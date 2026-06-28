import { Activity, BarChart3, BrainCircuit, Gamepad2, LibraryBig, MonitorUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import PwaInstallButton from './PwaInstallButton'

const links = [
  { to: '/', label: '首页', icon: BrainCircuit },
  { to: '/launcher', label: '启动器', icon: MonitorUp },
  { to: '/methods', label: '核心训练', icon: LibraryBig },
  { to: '/training/number-path-memory', label: '今日训练', icon: Activity },
  { to: '/games', label: '小游戏', icon: Gamepad2 },
  { to: '/records', label: '记录', icon: BarChart3 },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand" aria-label="Focus Lab 首页">
        <span className="brand-mark">FL</span>
        <span>
          <strong>Focus Lab</strong>
          <small>专注力训练工具箱</small>
        </span>
      </NavLink>
      <div className="nav-cluster">
        <nav className="nav-links" aria-label="主导航">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <PwaInstallButton />
      </div>
    </header>
  )
}

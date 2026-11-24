
import {
  Building2,
  ClipboardCheck,
  Heart,
  House,
  PawPrint,
  UserRound,
} from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { InstallAppButton } from './InstallAppButton'
import './SiteLayout.css'

const navigation = [
  { to: '/', label: 'Beranda', icon: House, end: true },
  { to: '/pets', label: 'Hewan', icon: PawPrint },
  { to: '/shelters', label: 'Shelter', icon: Building2 },
  { to: '/favorites', label: 'Favorite', icon: Heart },
  { to: '/applications', label: 'Riwayat', icon: ClipboardCheck },
  { to: '/about', label: 'Profil', icon: UserRound },
]

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="PawLoka, ke beranda">
      <img
        className="brand-logo-image"
        src="/pawloka-192.png"
        alt=""
        aria-hidden="true"
      />
      <span>PawLoka</span>
    </Link>
  )
}

export function SiteLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Brand />
        <InstallAppButton />
      </header>

      <main>
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Navigasi utama">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
import { Link, useLocation } from 'react-router-dom'
import './BottomNav.css'

export default function BottomNav() {
  const location = useLocation()

  const links = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/doctor-visit', label: 'Doctor', icon: '🏥' },
    { path: '/add-medicine', label: 'Add', icon: '➕' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <nav className="bottom-nav">
      {links.map(({ path, label, icon }) => (
        <Link
          key={path}
          to={path}
          className={`bottom-nav-item ${location.pathname === path ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{icon}</span>
          <span className="bottom-nav-label">{label}</span>
        </Link>
      ))}
    </nav>
  )
}

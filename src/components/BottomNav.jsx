import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/qibla', label: 'Qibla', icon: '◌' },
  { to: '/prayer-times', label: 'Prayer Times', icon: '◔' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`
          }
        >
          <span className="bottom-nav__icon" aria-hidden="true">{icon}</span>
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

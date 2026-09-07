import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🌙' },
  { to: '/prayer-times', label: 'Prayers', icon: '🕌' },
  { to: '/zikr', label: 'Tasbih', icon: '📿' },
  { to: '/qibla', label: 'Qibla', icon: '🧭' },
]

export default function BottomNav() {
  return (
    <motion.nav
      className="bottom-nav"
      aria-label="Main Navigation"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 24, stiffness: 260, delay: 0.15 }}
    >
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <div key={to} className="bottom-nav__item">
          <NavLink
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `bottom-nav__link ${isActive ? 'bottom-nav__link--active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <motion.span
                  className="bottom-nav__icon"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  aria-hidden="true"
                >
                  {icon}
                </motion.span>
                <span className="bottom-nav__label">{label}</span>

                {isActive && (
                  <motion.div
                    className="bottom-nav__active-bg"
                    layoutId="activeNavPill"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
              </>
            )}
          </NavLink>
        </div>
      ))}
    </motion.nav>
  )
}

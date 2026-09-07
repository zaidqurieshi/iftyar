import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { HomeIcon, PrayerIcon, TasbihIcon, CompassIcon } from './Icons'

const NAV_ITEMS = [
  { to: '/', label: 'Home', Icon: HomeIcon },
  { to: '/prayer-times', label: 'Prayers', Icon: PrayerIcon },
  { to: '/zikr', label: 'Tasbih', Icon: TasbihIcon },
  { to: '/qibla', label: 'Qibla', Icon: CompassIcon },
]

export default function BottomNav() {
  return (
    <motion.nav
      className="bottom-nav"
      aria-label="Main Navigation"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 280, delay: 0.1 }}
    >
      {NAV_ITEMS.map(({ to, label, Icon }) => (
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
                  whileHover={{ scale: 1.15, y: -1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                  aria-hidden="true"
                >
                  <Icon size={20} />
                </motion.span>
                <span className="bottom-nav__label">{label}</span>

                {isActive && (
                  <motion.div
                    className="bottom-nav__active-bg"
                    layoutId="activeNavPill"
                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
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

import { motion, AnimatePresence } from 'motion/react'
import { useLocation, useOutlet, Link } from 'react-router-dom'
import BottomNav from './BottomNav'

const topbarVariants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 22, stiffness: 240 },
  },
}

const footerVariants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.3 },
  },
}

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 280,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.99,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export default function AppShell() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div className="app-shell">
      {/* Ambient Floating Motion Glow Orbs */}
      <div className="ambient-bg" aria-hidden="true">
        <motion.div
          className="ambient-orb ambient-orb--emerald"
          animate={{
            x: [0, 30, -25, 0],
            y: [0, -35, 20, 0],
            scale: [1, 1.12, 0.95, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="ambient-orb ambient-orb--gold"
          animate={{
            x: [0, -35, 20, 0],
            y: [0, 30, -25, 0],
            scale: [1, 0.92, 1.15, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="ambient-orb ambient-orb--sapphire"
          animate={{
            x: [0, 25, -30, 0],
            y: [0, 25, -20, 0],
            scale: [1, 1.08, 0.92, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="app-shell__inner">
        {/* Topbar Header */}
        <motion.header
          className="topbar"
          aria-label="Iftyar Navigation Header"
          variants={topbarVariants}
          initial="initial"
          animate="animate"
        >
          <Link to="/" className="brand-block" aria-label="Iftyar Home">
            <motion.span
              className="brand-block__mark"
              whileHover={{ scale: 1.08, rotate: 4 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            >
              ☽
            </motion.span>
            <div className="brand-title-wrap">
              <h1 className="brand-title">Iftyar</h1>
              <span className="brand-subtitle">Ramadan & Prayer</span>
            </div>
          </Link>

          <div className="topbar-actions">
            <Link to="/prayer-times" className="location-pill">
              <span className="location-pill__dot" />
              <span>Live Times</span>
            </Link>
          </div>
        </motion.header>

        {/* Main Content Viewport with Spring Page Transitions */}
        <main className="main-content">
          <AnimatePresence mode="wait">
            {outlet && (
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                {outlet}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <motion.footer
          className="app-footer"
          variants={footerVariants}
          initial="initial"
          animate="animate"
        >
          <span>✦ Made by Sentinel ✦</span>
          <span>•</span>
          <a
            href="https://iftyar.com"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            Iftyar.com
          </a>
        </motion.footer>
      </div>

      {/* Floating Bottom Nav Bar */}
      <BottomNav />
    </div>
  )
}

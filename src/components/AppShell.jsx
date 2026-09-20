import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useLocation, useOutlet } from 'react-router-dom'
import BottomNav from './BottomNav'

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

  // Scroll to top instantly on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="app-shell">
      {/* Ambient Floating Motion Glow Orbs (hidden via CSS for agency look) */}
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
        </motion.footer>
      </div>

      {/* Floating Bottom Nav Bar */}
      <BottomNav />
    </div>
  )
}

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'

function pad(n) {
  return String(Math.max(0, n || 0)).padStart(2, '0')
}

export default function CircularTimer({
  hours = 0,
  minutes = 0,
  seconds = 0,
  totalSeconds = 0,
  currentSeconds = 0,
  label = '',
}) {
  // Calculate percentage of fasting elapsed
  const progress = useMemo(() => {
    if (!totalSeconds || totalSeconds <= 0) return 0.5
    const val = currentSeconds / totalSeconds
    return Math.min(1, Math.max(0.01, val))
  }, [totalSeconds, currentSeconds])

  const percentComplete = Math.round(progress * 100)
  const isIftarTarget = label.toLowerCase().includes('iftar')

  return (
    <div className="digital-countdown-wrap">
      {/* Big Crisp Countdown Clock */}
      <div className="countdown-digits" style={{ justifyContent: 'center', margin: '0.85rem 0' }}>
        <div className="countdown-unit">
          <span className="countdown-digit-box">{pad(hours)}</span>
          <span className="countdown-unit-label">Hours</span>
        </div>

        <span className="countdown-separator">:</span>

        <div className="countdown-unit">
          <span className="countdown-digit-box">{pad(minutes)}</span>
          <span className="countdown-unit-label">Minutes</span>
        </div>

        <span className="countdown-separator">:</span>

        <div className="countdown-unit">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={pad(seconds)}
              className="countdown-digit-box"
              initial={{ y: -6, opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {pad(seconds)}
            </motion.span>
          </AnimatePresence>
          <span className="countdown-unit-label">Seconds</span>
        </div>
      </div>

      {/* Clean Linear Progress Bar (No Ring) */}
      <div className="linear-progress-block">
        <div className="linear-progress-bar-track">
          <motion.div
            className="linear-progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentComplete}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <div className="linear-progress-meta">
          <span>{isIftarTarget ? `${percentComplete}% of Fast Elapsed` : 'Counting Down'}</span>
          <span>{label}</span>
        </div>
      </div>
    </div>
  )
}

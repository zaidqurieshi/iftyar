import { motion, AnimatePresence } from 'motion/react'

function pad(n) {
  return String(Math.max(0, n || 0)).padStart(2, '0')
}

export default function CircularTimer({
  hours = 0,
  minutes = 0,
  seconds = 0,
  remainingPercent = 0,
  label = '',
}) {
  // Clamp remaining percentage between 0 and 100
  const clampedPercent = Math.max(0, Math.min(100, Math.round(remainingPercent)))

  return (
    <div className="digital-countdown-wrap">
      {/* Big Crisp Countdown Clock */}
      <div className="countdown-digits" aria-label={`Countdown: ${pad(hours)} hours, ${pad(minutes)} minutes, ${pad(seconds)} seconds`}>
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
              transition={{ duration: 0.18 }}
            >
              {pad(seconds)}
            </motion.span>
          </AnimatePresence>
          <span className="countdown-unit-label">Seconds</span>
        </div>
      </div>

      {/* Clean Linear Progress Bar Showing Remaining Percentage (No Ring) */}
      <div className="linear-progress-block">
        <div
          className="linear-progress-bar-track"
          role="progressbar"
          aria-valuenow={clampedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="linear-progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${clampedPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        <div className="linear-progress-meta">
          <span style={{ fontWeight: 600, color: 'var(--gold)' }}>
            ✦ {clampedPercent}% Remaining
          </span>
          <span>{label}</span>
        </div>
      </div>
    </div>
  )
}

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
  const radius = 105
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius

  // Calculate percentage of fasting elapsed
  const progress = useMemo(() => {
    if (!totalSeconds || totalSeconds <= 0) return 0.65
    const val = currentSeconds / totalSeconds
    return Math.min(1, Math.max(0.02, val))
  }, [totalSeconds, currentSeconds])

  const strokeDashoffset = circumference - progress * circumference
  const percentComplete = Math.round(progress * 100)

  // Fasting or Night phase indicator
  const isIftarTarget = label.toLowerCase().includes('iftar')

  return (
    <div className="circular-timer-container">
      <div className="circular-timer__svg-wrap">
        <svg
          className="circular-timer__svg"
          viewBox="0 0 260 260"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="timerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f6d268" />
            </linearGradient>
            <filter id="timerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="transparent"
            stroke="rgba(52, 211, 153, 0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Accent Guide Ring */}
          <circle
            cx="130"
            cy="130"
            r={radius - 12}
            fill="transparent"
            stroke="rgba(246, 210, 104, 0.05)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Animated Progress Circle */}
          <motion.circle
            cx="130"
            cy="130"
            r={radius}
            fill="transparent"
            stroke="url(#timerRingGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            filter="url(#timerGlow)"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="circular-timer__center-content">
          <div className="countdown-digits">
            <div className="countdown-unit">
              <span className="countdown-digit-box">{pad(hours)}</span>
              <span className="countdown-unit-label">Hours</span>
            </div>

            <span className="countdown-separator">:</span>

            <div className="countdown-unit">
              <span className="countdown-digit-box">{pad(minutes)}</span>
              <span className="countdown-unit-label">Mins</span>
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
              <span className="countdown-unit-label">Secs</span>
            </div>
          </div>

          <div className="circular-timer__progress-label">
            {isIftarTarget ? (
              <span>✦ {percentComplete}% Fast Completed ✦</span>
            ) : (
              <span>✦ Counting Down ✦</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



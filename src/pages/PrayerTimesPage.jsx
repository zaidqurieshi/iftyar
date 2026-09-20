import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import GlassCard from '../components/GlassCard'
import MethodSelector from '../components/MethodSelector'
import {
  formatPrayerTime,
  getCurrentPrayer,
  getNextPrayer,
  getPrayerSchedule,
} from '../services/prayerService'
import { useMethodState } from '../hooks/useMethodState'
import { getTimeZoneForCoordinates, formatHijri } from '../services/dateService'
import {
  DawnIcon,
  SunriseIcon,
  SunIcon,
  CloudSunIcon,
  SunsetIcon,
  MoonIcon,
  PrayerIcon,
} from '../components/Icons'

const PRAYER_ICONS = {
  fajr: DawnIcon,
  sunrise: SunriseIcon,
  dhuhr: SunIcon,
  asr: CloudSunIcon,
  maghrib: SunsetIcon,
  isha: MoonIcon,
}

const listContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function PrayerTimesPage({ location }) {
  const [now, setNow] = useState(() => new Date())
  const [selectedMethod, setSelectedMethod] = useMethodState(location)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const schedule = useMemo(
    () => getPrayerSchedule(location.lat, location.lng, now, selectedMethod),
    [location.lat, location.lng, now, selectedMethod]
  )
  const nextPrayer = useMemo(
    () => getNextPrayer(location.lat, location.lng, now, selectedMethod),
    [location.lat, location.lng, now, selectedMethod]
  )
  const currentPrayer = useMemo(
    () => getCurrentPrayer(location.lat, location.lng, now, selectedMethod),
    [location.lat, location.lng, now, selectedMethod]
  )
  const locationTimeZone = useMemo(
    () => location?.timeZone || getTimeZoneForCoordinates(location.lat, location.lng),
    [location.lat, location.lng, location.timeZone]
  )

  const remainingMs = Math.max(0, nextPrayer.time.getTime() - now.getTime())
  const remainingSeconds = Math.floor(remainingMs / 1000)
  const countdownHours = Math.floor(remainingSeconds / 3600)
  const countdownMinutes = Math.floor((remainingSeconds % 3600) / 60)
  const countdownSeconds = remainingSeconds % 60

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: locationTimeZone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="page-stack">
      {/* Modern Agency Hero Section (Unboxed, clean hierarchy) */}
      <section className="hero-section">
        <div className="hero-section__header">
          <div className="hero-section__title-wrap">
            <div className="hero-section__badge-row">
              <span className="chip chip--slate">
                <span className="location-pill__dot" />
                Daily Schedule
              </span>
            </div>
            <h1 className="hero-section__title">Prayer Times</h1>
          </div>
          <span className="chip chip--gold">{dateFormatter.format(now)}</span>
        </div>

        {/* Unboxed Date Bar with delicate divider */}
        <div className="hero-dates-bar">
          <div className="hero-date-cell">
            <span className="eyebrow eyebrow--slate">Gregorian Date</span>
            <span className="hero-date-value">{dateFormatter.format(now)}</span>
          </div>
          <div className="hero-date-divider" />
          <div className="hero-date-cell" style={{ textAlign: 'right' }}>
            <span className="eyebrow eyebrow--slate">Hijri Date</span>
            <span className="hero-date-value" style={{ color: 'var(--color-emerald-light)' }}>
              {formatHijri(now, locationTimeZone)}
            </span>
          </div>
        </div>

        {/* Standalone Next Prayer Spotlight Card */}
        <div className="next-prayer-spotlight">
          <div className="next-prayer-info">
            <span className="eyebrow eyebrow--emerald">Up Next</span>
            <h3 className="next-prayer-title">{nextPrayer.name}</h3>
            <span className="next-prayer-time-sub">
              {formatPrayerTime(nextPrayer.time, nextPrayer.displayTimeZone || locationTimeZone)}
            </span>
          </div>

          <div className="next-prayer-countdown-wrap">
            <span className="eyebrow eyebrow--slate" style={{ textAlign: 'right' }}>Countdown</span>
            <div className="next-prayer-countdown">
              <span>{String(countdownHours).padStart(2, '0')}</span>
              <span style={{ opacity: 0.6 }}>:</span>
              <span>{String(countdownMinutes).padStart(2, '0')}</span>
              <span style={{ opacity: 0.6 }}>:</span>
              <span>{String(countdownSeconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Calculation Method Selector */}
      <MethodSelector selectedMethod={selectedMethod} onMethodChange={setSelectedMethod} />

      {/* Prayer Schedule Timeline List */}
      <GlassCard className="panel-card" static>
        <div className="hero-card__header" style={{ marginBottom: '0.25rem' }}>
          <div>
            <span className="eyebrow eyebrow--emerald">Today's Timeline</span>
            <h2 style={{ fontSize: '1.4rem' }}>All Five Prayers</h2>
          </div>
          <span className="chip">
            Active: {currentPrayer.name}
          </span>
        </div>

        <motion.div
          className="prayer-timeline-list"
          variants={listContainerVariants}
          initial="initial"
          animate="animate"
        >
          {schedule.map((item) => {
            const isNext = item.key === nextPrayer.key
            const isCurrent = item.key === currentPrayer.key
            const IconComponent = PRAYER_ICONS[item.key] || PrayerIcon

            return (
              <motion.div
                key={item.key}
                variants={itemVariants}
                className={`prayer-card-item ${isNext ? 'prayer-card-item--next' : ''} ${
                  isCurrent ? 'prayer-card-item--current' : ''
                }`}
              >
                <div className="prayer-card-left">
                  <div className="prayer-icon-box">
                    <IconComponent size={20} />
                  </div>
                  <div className="prayer-card-names">
                    <span className="prayer-card-name">{item.name}</span>
                    {isNext && <span className="prayer-card-status-badge">Next Prayer ✦</span>}
                    {isCurrent && !isNext && <span className="prayer-card-status-badge">Current Window ✦</span>}
                  </div>
                </div>

                <span className="prayer-card-time">
                  {formatPrayerTime(item.time, item.displayTimeZone || locationTimeZone)}
                </span>
              </motion.div>
            )
          })}
        </motion.div>
      </GlassCard>
    </div>
  )
}
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
import { getPlaceLabelFromCoordinates } from '../services/locationService'
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
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 260 } },
}

export default function PrayerTimesPage({ location }) {
  const [now, setNow] = useState(() => new Date())
  const [locationLabel, setLocationLabel] = useState(location?.label || '')
  const [selectedMethod, setSelectedMethod] = useMethodState()

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (location.lat !== undefined && location.lng !== undefined) {
      getPlaceLabelFromCoordinates(location.lat, location.lng).then(setLocationLabel)
    }
  }, [location.lat, location.lng])

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
    () => getTimeZoneForCoordinates(location.lat, location.lng),
    [location.lat, location.lng]
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
      {/* Header Spotlight Card */}
      <GlassCard className="hero-card" static>
        <div className="hero-card__header">
          <div>
            <span className="eyebrow eyebrow--gold">Daily Prayer Schedule</span>
            <h2 className="hero-card__title">{locationLabel || location.label || 'Prayer Times'}</h2>
          </div>
          <span className="chip chip--gold">{dateFormatter.format(now)}</span>
        </div>

        <div className="hero-card__meta">
          <div className="meta-box">
            <span className="eyebrow">Gregorian Date</span>
            <span className="meta-value">{dateFormatter.format(now)}</span>
          </div>
          <div className="meta-box">
            <span className="eyebrow">Hijri Date</span>
            <span className="meta-value">{formatHijri(now, locationTimeZone)}</span>
          </div>
        </div>

        {/* Next Prayer Spotlight */}
        <div className="next-prayer-spotlight" style={{ marginTop: '1.25rem' }}>
          <div className="next-prayer-info">
            <span className="eyebrow eyebrow--emerald">Up Next</span>
            <h3 className="next-prayer-title">{nextPrayer.name}</h3>
            <span className="next-prayer-time-sub">
              {formatPrayerTime(nextPrayer.time, nextPrayer.displayTimeZone || locationTimeZone)}
            </span>
          </div>

          <div className="next-prayer-countdown-wrap">
            <span className="eyebrow" style={{ textAlign: 'right' }}>Countdown</span>
            <div className="next-prayer-countdown">
              <span>{String(countdownHours).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(countdownMinutes).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(countdownSeconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </GlassCard>

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
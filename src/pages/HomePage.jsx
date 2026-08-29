import { useEffect, useMemo, useState } from 'react'
import GlassCard from '../components/GlassCard'
import DuaCard from '../components/DuaCard'
import CircularTimer from '../components/CircularTimer'
import MethodSelector from '../components/MethodSelector'
import {
  formatPrayerTime,
  getIftarSehriPlaceholder,
  getNextPrayer,
  getPrayerSchedule,
  getPrayerSourceNote,
} from '../services/prayerService'
import { describeLocation } from '../services/locationService'

function HomePage({ location }) {
  const [now, setNow] = useState(new Date())
  const [selectedMethod, setSelectedMethod] = useState('muslimWorldLeague')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const schedule = useMemo(() => getPrayerSchedule(location.lat, location.lng, now, selectedMethod), [location.lat, location.lng, now, selectedMethod])
  const nextPrayer = useMemo(() => getNextPrayer(location.lat, location.lng, now, selectedMethod), [location.lat, location.lng, now, selectedMethod])
  const iftarSehri = useMemo(() => getIftarSehriPlaceholder(location.lat, location.lng, now, selectedMethod), [location.lat, location.lng, now, selectedMethod])

  const remainingMs = Math.max(0, nextPrayer.time.getTime() - now.getTime())
  const remainingSeconds = Math.floor(remainingMs / 1000)
  const countdownHours = Math.floor(remainingSeconds / 3600)
  const countdownMinutes = Math.floor((remainingSeconds % 3600) / 60)
  const countdownSeconds = remainingSeconds % 60

  const isSehriCountdown = now < iftarSehri.sehriTime
  const activeFastingTarget = isSehriCountdown ? iftarSehri.sehriTime : iftarSehri.iftarTime
  const activeFastingLabel = isSehriCountdown
    ? `Sehri - ${iftarSehri.sehriLabel}`
    : `Iftar - ${iftarSehri.iftarLabel}`
  const activeCountdownMs = Math.max(0, activeFastingTarget.getTime() - now.getTime())
  const activeCountdownSeconds = Math.floor(activeCountdownMs / 1000)
  const activeCountdownHours = Math.floor(activeCountdownSeconds / 3600)
  const activeCountdownMinutes = Math.floor((activeCountdownSeconds % 3600) / 60)
  const activeCountdownSecondsOnly = activeCountdownSeconds % 60

  const locationLabel = location.label || describeLocation(location.lat, location.lng)
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="page-stack">
      <GlassCard className="hero-card">
        <div className="hero-card__header">
          <div>
            <p className="eyebrow">Location</p>
            <h2>{locationLabel}</h2>
          </div>
          <span className="chip">{dateFormatter.format(now)}</span>
        </div>

        <div className="hero-card__meta">
          <div>
            <p className="eyebrow">Gregorian</p>
            <p className="meta-value">{dateFormatter.format(now)}</p>
          </div>
          <div>
            <p className="eyebrow">Hijri</p>
            <p className="meta-value">1447 AH</p>
          </div>
        </div>

        <div className="next-prayer">
          <p className="eyebrow">Next prayer</p>
          <div className="next-prayer__row">
            <div>
              <h3>{nextPrayer.name}</h3>
              <p>{formatPrayerTime(nextPrayer.time)}</p>
            </div>
            <div className="countdown" aria-live="polite">
              <span>{String(countdownHours).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(countdownMinutes).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(countdownSeconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </GlassCard>
      <MethodSelector selectedMethod={selectedMethod} onMethodChange={setSelectedMethod} />

      <GlassCard className="panel-card">
        <div className="section-head">
          <h3>{activeFastingLabel}</h3>
        </div>

        <div className="ramadan-timer-wrap">
          <CircularTimer
            label={activeFastingLabel}
            hours={activeCountdownHours}
            minutes={activeCountdownMinutes}
            seconds={activeCountdownSecondsOnly}
            totalSeconds={24 * 60 * 60}
            currentSeconds={Math.max(0, activeCountdownSeconds)}
          />

          <div className="ramadan-timer__details">
            <div>
              <span>Iftar</span>
              <strong>{iftarSehri.iftarLabel}</strong>
            </div>
            <div>
              <span>Sehri</span>
              <strong>{iftarSehri.sehriLabel}</strong>
            </div>
          </div>
        </div>

        <p className="supporting-copy">{iftarSehri.message}</p>
      </GlassCard>

      <DuaCard />

      <div className="home-grid">
        <GlassCard className="mini-card">
          <p className="eyebrow">Qibla</p>
          <h3>Quick direction</h3>
          <p className="supporting-copy">Find the Kaaba with a precise compass-ready signal.</p>
        </GlassCard>
      </div>

      <GlassCard className="panel-card panel-card--subtle">
        <p className="eyebrow">Calculation source</p>
        <p className="supporting-copy">{getPrayerSourceNote()}</p>
      </GlassCard>
    </div>
  )
}

export default HomePage

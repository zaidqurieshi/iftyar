import { useEffect, useMemo, useState } from 'react'
import GlassCard from '../components/GlassCard'
import { formatPrayerTime, getCurrentPrayer, getNextPrayer, getPrayerSchedule } from '../services/prayerService'
import { getPlaceLabelFromCoordinates } from '../services/locationService'
import MethodSelector from '../components/MethodSelector'

function PrayerTimesPage({ location }) {
  // Use current date/time (updates automatically)
  const [now, setNow] = useState(new Date())
  const [locationLabel, setLocationLabel] = useState(location?.label || '')
  const [selectedMethod, setSelectedMethod] = useState('muslimWorldLeague')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (location.lat !== undefined && location.lng !== undefined) {
      getPlaceLabelFromCoordinates(location.lat, location.lng).then(setLocationLabel)
    }
  }, [location.lat, location.lng])

  const schedule = useMemo(() => getPrayerSchedule(location.lat, location.lng, now, selectedMethod), [location.lat, location.lng, now, selectedMethod])
  const nextPrayer = useMemo(() => getNextPrayer(location.lat, location.lng, now, selectedMethod), [location.lat, location.lng, now, selectedMethod])
  const currentPrayer = useMemo(() => getCurrentPrayer(location.lat, location.lng, now, selectedMethod), [location.lat, location.lng, now, selectedMethod])

  const remainingMs = Math.max(0, nextPrayer.time.getTime() - now.getTime())
  const remainingSeconds = Math.floor(remainingMs / 1000)
  const countdownHours = Math.floor(remainingSeconds / 3600)
  const countdownMinutes = Math.floor((remainingSeconds % 3600) / 60)
  const countdownSeconds = remainingSeconds % 60

  return (
    <div className="page-stack">
      <GlassCard className="panel-card prayer-times-card">
        <div className="prayer-times-header">
          <div className="prayer-times-title">
            <span className="eyebrow">Next Prayer</span>
            <h2>{nextPrayer.name}</h2>
          </div>

          <div className="prayer-times-countdown" aria-live="polite">
            <span>{String(countdownHours).padStart(2, '0')}</span>
            <span className="prayer-times-separator">:</span>
            <span>{String(countdownMinutes).padStart(2, '0')}</span>
            <span className="prayer-times-separator">:</span>
            <span>{String(countdownSeconds).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="section-head prayer-times-subhead">
          <span className="section-pill">{currentPrayer.name}</span>
        </div>

        {/* Location label */}
        <div className="prayer-times-location">
          <p className="eyebrow">Location</p>
          <p className="meta-value">{locationLabel || 'Loading…'}</p>
        </div>
        <MethodSelector selectedMethod={selectedMethod} onMethodChange={setSelectedMethod} />

        <div className="prayer-list prayer-list--full">
          {schedule.map((item) => (
            <div
              key={item.key}
              className={`prayer-row ${item.key === nextPrayer.key ? 'prayer-row--next' : ''} ${item.key === currentPrayer.key ? 'prayer-row--current' : ''}`}
            >
              <span className="prayer-name">{item.name}</span>
              <span className="prayer-time">{formatPrayerTime(item.time)}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

export default PrayerTimesPage
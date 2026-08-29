import { useMemo } from 'react'
import GlassCard from '../components/GlassCard'
import { formatPrayerTime, getCurrentPrayer, getNextPrayer, getPrayerSchedule } from '../services/prayerService'

function PrayerTimesPage({ location }) {
  const schedule = useMemo(() => getPrayerSchedule(location.lat, location.lng, new Date()), [location.lat, location.lng])
  const nextPrayer = useMemo(() => getNextPrayer(location.lat, location.lng, new Date()), [location.lat, location.lng])
  const currentPrayer = useMemo(() => getCurrentPrayer(location.lat, location.lng, new Date()), [location.lat, location.lng])

  return (
    <div className="page-stack">
      <GlassCard className="panel-card">
        <div className="section-head">
          <h2>Prayer times</h2>
          <span className="section-pill">{currentPrayer.name}</span>
        </div>

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

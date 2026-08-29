import { useEffect, useMemo, useState } from 'react'
import GlassCard from '../components/GlassCard'
import DuaCard from '../components/DuaCard'
import CircularTimer from '../components/CircularTimer'
import MethodSelector from '../components/MethodSelector'
import {
  buildGoogleCalendarUrl,
  buildRamadanCalendarIcs,
  formatPrayerTime,
  generateRamadanCalendarEntries,
  getIftarSehriPlaceholder,
  getNextPrayer,
  getPrayerSchedule,
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
  const calendarEntries = useMemo(
    () => generateRamadanCalendarEntries(location.lat, location.lng, now, selectedMethod, 30),
    [location.lat, location.lng, now, selectedMethod],
  )
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const handlePrintCalendar = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=900')
    if (!printWindow) {
      return
    }

    const rows = calendarEntries
      .map(
        (entry) => `
          <tr>
            <td>${entry.dayLabel} ${entry.day}</td>
            <td>${entry.monthLabel}</td>
            <td>${entry.sehri}</td>
            <td>${entry.iftar}</td>
          </tr>`,
      )
      .join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Ramadan Calendar</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f2f2f2; }
            h1 { margin-bottom: 0; }
            .subtitle { color: #555; margin-bottom: 18px; }
          </style>
        </head>
        <body>
          <h1>Ramadan Calendar</h1>
          <div class="subtitle">${locationLabel}</div>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Month</th>
                <th>Sehri</th>
                <th>Iftar</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const handleDownloadIcs = () => {
    const calendarText = buildRamadanCalendarIcs(calendarEntries, `Ramadan Calendar - ${locationLabel}`)
    const blob = new Blob([calendarText], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ramadan-calendar.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadPdf = () => {
    handlePrintCalendar()
  }

  const handleGoogleCalendar = () => {
    const googleUrl = buildGoogleCalendarUrl(calendarEntries, `Ramadan Calendar - ${locationLabel}`)
    window.open(googleUrl, '_blank', 'noopener,noreferrer')
  }

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

      <GlassCard className="panel-card">
        <div className="section-head">
          <h3>Ramadan Calendar</h3>
        </div>

        <div className="calendar-actions">
          <button type="button" className="action-button" onClick={handlePrintCalendar}>
            Print / Save as PDF
          </button>
          <button type="button" className="action-button action-button--secondary" onClick={handleDownloadPdf}>
            Download PDF
          </button>
          <button type="button" className="action-button action-button--secondary" onClick={handleDownloadIcs}>
            Download .ics
          </button>
          <button type="button" className="action-button action-button--secondary" onClick={handleGoogleCalendar}>
            Open Google Calendar
          </button>
        </div>

        <div className="calendar-grid">
          {calendarEntries.slice(0, 10).map((entry) => (
            <div key={entry.day} className="calendar-row">
              <span>{entry.dayLabel} {entry.day}</span>
              <strong>{entry.sehri}</strong>
              <strong>{entry.iftar}</strong>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

export default HomePage

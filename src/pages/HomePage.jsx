import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import GlassCard from '../components/GlassCard'
import HadithCard from '../components/HadithCard'
import DuaCard from '../components/DuaCard'
import CircularTimer from '../components/CircularTimerNew'
import MethodSelector from '../components/MethodSelector'
import {
  buildRamadanCalendarIcs,
  buildGoogleCalendarUrl,
  formatPrayerTime,
  generateRamadanCalendarEntries,
  getIftarSehriPlaceholder,
  getNextPrayer,
  CALENDAR_SOURCES,
} from '../services/prayerService'
import { useMethodState } from '../hooks/useMethodState'
import { formatHijri, getTimeZoneForCoordinates } from '../services/dateService'
import { SunriseIcon, SunsetIcon } from '../components/Icons'

export default function HomePage({ location }) {
  const [now, setNow] = useState(() => new Date())
  const [selectedMethod, setSelectedMethod] = useMethodState(location)
  const [calendarSource, setCalendarSource] = useState(CALENDAR_SOURCES[0].name)
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false)

  const locationTimeZone = useMemo(
    () => location?.timeZone || getTimeZoneForCoordinates(location.lat, location.lng),
    [location.lat, location.lng, location.timeZone]
  )

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const nextPrayer = useMemo(
    () => getNextPrayer(location.lat, location.lng, now, selectedMethod),
    [location.lat, location.lng, now, selectedMethod]
  )
  const iftarSehri = useMemo(
    () => getIftarSehriPlaceholder(location.lat, location.lng, now, selectedMethod, locationTimeZone),
    [location.lat, location.lng, now, selectedMethod, locationTimeZone]
  )

  // Next Prayer countdown
  const prayerRemainingMs = Math.max(0, nextPrayer.time.getTime() - now.getTime())
  const prayerRemainingSecs = Math.floor(prayerRemainingMs / 1000)
  const prayerHours = Math.floor(prayerRemainingSecs / 3600)
  const prayerMins = Math.floor((prayerRemainingSecs % 3600) / 60)
  const prayerSecs = prayerRemainingSecs % 60

  // Determine active fasting target & remaining percentage
  let activeFastingTarget, activeFastingLabel, remainingPercent, isFastingNow
  if (now < iftarSehri.sehriTime) {
    // Early morning before Sehri: countdown to today's Sehri
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayIftarSehri = getIftarSehriPlaceholder(
      location.lat,
      location.lng,
      yesterday,
      selectedMethod,
      locationTimeZone
    )
    activeFastingTarget = iftarSehri.sehriTime
    activeFastingLabel = `Sehri — ${iftarSehri.sehriLabel}`
    const totalMs = iftarSehri.sehriTime.getTime() - yesterdayIftarSehri.iftarTime.getTime()
    const remainingMs = Math.max(0, iftarSehri.sehriTime.getTime() - now.getTime())
    remainingPercent = totalMs > 0 ? (remainingMs / totalMs) * 100 : 0
    isFastingNow = false
  } else if (now < iftarSehri.iftarTime) {
    // Between Sehri and Iftar: currently fasting! Countdown to Iftar
    activeFastingTarget = iftarSehri.iftarTime
    activeFastingLabel = `Iftar — ${iftarSehri.iftarLabel}`
    const totalMs = iftarSehri.iftarTime.getTime() - iftarSehri.sehriTime.getTime()
    const remainingMs = Math.max(0, iftarSehri.iftarTime.getTime() - now.getTime())
    remainingPercent = totalMs > 0 ? (remainingMs / totalMs) * 100 : 0
    isFastingNow = true
  } else {
    // Evening after Iftar: countdown to tomorrow's Sehri
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowSehri = getIftarSehriPlaceholder(
      location.lat,
      location.lng,
      tomorrow,
      selectedMethod,
      locationTimeZone
    )
    activeFastingTarget = tomorrowSehri.sehriTime
    activeFastingLabel = `Sehri — ${tomorrowSehri.sehriLabel}`
    const totalMs = tomorrowSehri.sehriTime.getTime() - iftarSehri.iftarTime.getTime()
    const remainingMs = Math.max(0, tomorrowSehri.sehriTime.getTime() - now.getTime())
    remainingPercent = totalMs > 0 ? (remainingMs / totalMs) * 100 : 0
    isFastingNow = false
  }

  const activeCountdownMs = Math.max(0, activeFastingTarget.getTime() - now.getTime())
  const activeCountdownSeconds = Math.floor(activeCountdownMs / 1000)
  const activeHours = Math.floor(activeCountdownSeconds / 3600)
  const activeMins = Math.floor((activeCountdownSeconds % 3600) / 60)
  const activeSecs = activeCountdownSeconds % 60

  const selectedCalendarSource =
    CALENDAR_SOURCES.find((source) => source.name === calendarSource) || CALENDAR_SOURCES[0]

  const calendarEntries = useMemo(
    () =>
      generateRamadanCalendarEntries(
        location.lat,
        location.lng,
        now,
        selectedCalendarSource.methodId,
        30,
        locationTimeZone
      ),
    [location.lat, location.lng, now, selectedCalendarSource.methodId, locationTimeZone]
  )

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: locationTimeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const isAppleDevice =
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|Mac/i.test(navigator.userAgent) &&
    !/Windows/i.test(navigator.userAgent)

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=900')
    if (!printWindow) return

    const rows = calendarEntries
      .map(
        (entry) => `
          <tr>
            <td>${entry.dayLabel} ${entry.day}</td>
            <td>${entry.monthLabel}</td>
            <td><strong>${entry.sehri}</strong></td>
            <td><strong>${entry.iftar}</strong></td>
          </tr>`
      )
      .join('')

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Ramadan Calendar 1447 AH</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #0f2329; background: #fff; }
            h1 { margin: 0 0 4px; font-size: 26px; color: #092e26; }
            .subtitle { color: #4e6b63; margin-bottom: 24px; font-size: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #d0deda; padding: 10px 14px; text-align: left; font-size: 14px; }
            th { background: #eaf5f0; color: #0d4638; font-weight: 600; }
            tr:nth-child(even) td { background: #fbfdfc; }
            .footer { margin-top: 30px; text-align: center; font-size: 13px; color: #739088; }
          </style>
        </head>
        <body>
          <h1>Ramadan Timetable</h1>
          <div class="subtitle">Ramadan Calendar 1447 AH • Source: ${selectedCalendarSource.name}</div>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Sehri (Ends)</th>
                <th>Iftar (Begins)</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">Generated by Iftyar</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 250)
    setCalendarMenuOpen(false)
  }

  const handleAddToCalendar = () => {
    const title = 'Ramadan Calendar 1447 AH'
    const calendarText = buildRamadanCalendarIcs(calendarEntries, title)

    if (isAppleDevice) {
      const blob = new Blob([calendarText], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'ramadan-calendar.ics'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      const calendarUrl = buildGoogleCalendarUrl(calendarEntries, title)
      window.open(calendarUrl, '_blank', 'noopener,noreferrer')
    }

    setCalendarMenuOpen(false)
  }

  return (
    <div className="page-stack">
      {/* Hero Header & Date Banner */}
      <GlassCard className="hero-card" static>
        <div className="hero-card__header">
          <div>
            <h2 className="hero-card__title">Sehri & Iftar Schedule</h2>
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
            <span className="eyebrow eyebrow--emerald">Next Prayer</span>
            <h3 className="next-prayer-title">{nextPrayer.name}</h3>
            <span className="next-prayer-time-sub">
              {formatPrayerTime(nextPrayer.time, nextPrayer.displayTimeZone || locationTimeZone)}
            </span>
          </div>

          <div className="next-prayer-countdown-wrap">
            <span className="eyebrow" style={{ textAlign: 'right' }}>Starts In</span>
            <div className="next-prayer-countdown">
              <span>{String(prayerHours).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(prayerMins).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(prayerSecs).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Fasting Countdown Centerpiece Card */}
      <GlassCard className="panel-card fasting-hero-card" static>
        <div
          className={`fasting-phase-badge ${
            isFastingNow ? 'fasting-phase-badge--fasting' : 'fasting-phase-badge--night'
          }`}
        >
          <span className="pulse-indicator" />
          <span>{isFastingNow ? 'Fasting in Progress' : 'Night Rest & Sehri Countdown'}</span>
        </div>

        <CircularTimer
          hours={activeHours}
          minutes={activeMins}
          seconds={activeSecs}
          remainingPercent={remainingPercent}
          label={activeFastingLabel}
        />

        {/* Sehri & Iftar Glances */}
        <div className="fasting-meta-grid">
          <div className={`fasting-meta-card ${!isFastingNow ? 'fasting-meta-card--highlight' : ''}`}>
            <div className="fasting-meta-icon fasting-meta-icon--gold">
              <SunriseIcon size={20} />
            </div>
            <div className="fasting-meta-info">
              <span className="eyebrow">Sehri Ends</span>
              <strong className="fasting-meta-time">{iftarSehri.sehriLabel}</strong>
            </div>
          </div>

          <div className={`fasting-meta-card ${isFastingNow ? 'fasting-meta-card--highlight' : ''}`}>
            <div className="fasting-meta-icon">
              <SunsetIcon size={20} />
            </div>
            <div className="fasting-meta-info">
              <span className="eyebrow">Iftar Begins</span>
              <strong className="fasting-meta-time">{iftarSehri.iftarLabel}</strong>
            </div>
          </div>
        </div>

        {iftarSehri.message && (
          <div className="fasting-message-banner">
            <span>✦ {iftarSehri.message} ✦</span>
          </div>
        )}
      </GlassCard>

      {/* Calculation Method Selector */}
      <MethodSelector selectedMethod={selectedMethod} onMethodChange={setSelectedMethod} />

      {/* Daily Ramadan Supplications */}
      <DuaCard />

      {/* Daily Prophetic Hadith Wisdom */}
      <HadithCard />

      {/* Ramadan Timetable Download & Calendar Sync */}
      <GlassCard className="panel-card" static>
        <div className="hero-card__header" style={{ marginBottom: '1rem' }}>
          <div>
            <span className="eyebrow eyebrow--gold">30-Day Timetable</span>
            <h2 style={{ fontSize: '1.4rem' }}>Ramadan Calendar</h2>
          </div>
          <span className="chip">Export & Sync</span>
        </div>

        <div className="calendar-export-wrap">
          <label className="calendar-select-label">
            <span className="eyebrow">Select Timetable Source</span>
            <select
              className="calendar-select"
              value={calendarSource}
              onChange={(e) => setCalendarSource(e.target.value)}
            >
              {CALENDAR_SOURCES.map((source) => (
                <option key={source.name} value={source.name}>
                  {source.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="calendar-action-btn"
            onClick={() => setCalendarMenuOpen((open) => !open)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>Get Ramadan Timetable</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              {calendarMenuOpen ? '▲' : '▼'}
            </span>
          </button>

          <AnimatePresence>
            {calendarMenuOpen && (
              <motion.div
                className="calendar-dropdown-menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  className="calendar-menu-item"
                  onClick={handleDownloadPdf}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span>Print or Download PDF Timetable</span>
                </button>

                <button
                  type="button"
                  className="calendar-menu-item"
                  onClick={handleAddToCalendar}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                    <circle cx="12" cy="15" r="2" />
                  </svg>
                  <span>{isAppleDevice ? 'Download Apple Calendar (.ics)' : 'Add to Google Calendar'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  )
}

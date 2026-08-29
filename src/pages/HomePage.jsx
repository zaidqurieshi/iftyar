import { useEffect, useMemo, useState } from 'react'
import GlassCard from '../components/GlassCard'
import DuaCard from '../components/DuaCard'
import CircularTimer from '../components/CircularTimer'
import MethodSelector from '../components/MethodSelector'
import {
  buildRamadanCalendarIcs,
  formatPrayerTime,
  generateRamadanCalendarEntries,
  getIftarSehriPlaceholder,
  getNextPrayer,
  getPrayerSchedule,
} from '../services/prayerService'
import { describeLocation } from '../services/locationService'
import { formatHijri } from '../services/dateService'

function HomePage({ location }) {
  const [now, setNow] = useState(new Date())
  const [selectedMethod, setSelectedMethod] = useState('muslimWorldLeague')
  const [calendarSource, setCalendarSource] = useState('Dar-ul-uloom Raheemiya')
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false)

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

  const isAppleDevice = /iPhone|iPad|Mac/i.test(navigator.userAgent) && !/Windows/i.test(navigator.userAgent)

  const handleDownloadPdf = () => {
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

    // Include footer with Iftyar.com
    const footerHtml = `<div style="margin-top: 30px; text-align: center; font-size: 0.9rem; color: #555;">Iftyar.com</div>`

    printWindow.document.write(`
      <html>
        <head>
          <title>Ramadan Calendar</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #dadde2; padding: 10px; text-align: left; }
            th { background: #eff6ef; }
            h1 { margin: 0 0 8px; }
            .subtitle { color: #4a4a4a; margin-bottom: 18px; }
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
          ${footerHtml}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 250)
    setCalendarMenuOpen(false)
  }

  // Share PDF via WhatsApp (using Web Share API if available)
  const handleShareWhatsApp = async () => {
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
    const footerHtml = `<div style="margin-top: 30px; text-align: center; font-size: 0.9rem; color: #555;">Iftyar.com</div>`
    const html = `
      <html>
        <head>
          <title>Ramadan Calendar</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #dadde2; padding: 10px; text-align: left; }
            th { background: #eff6ef; }
            h1 { margin: 0 0 8px; }
            .subtitle { color: #4a4a4a; margin-bottom: 18px; }
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
          ${footerHtml}
        </body>
      </html>`
    // Convert HTML to Blob as PDF using Blob of type application/pdf is not directly a PDF, but we can share the HTML file.
    const blob = new Blob([html], { type: 'text/html' })
    const file = new File([blob], 'ramadan-calendar.pdf', { type: 'application/pdf' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Ramadan Calendar',
          text: 'Ramadan Calendar PDF',
        })
      } catch (e) {
        console.error('Share failed', e)
      }
    } else {
      // Fallback: open WhatsApp with a message and a link (cannot attach file)
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Here is the Ramadan Calendar PDF:')}`
      window.open(whatsappUrl, '_blank')
    }
    setCalendarMenuOpen(false)
  }

  const handleAddToCalendar = () => {
    const title = `Ramadan Calendar - ${locationLabel}`
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
            <p className="meta-value">{formatHijri(now)}</p>
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
        <div className="ramadan-calendar">
          <label className="ramadan-calendar__selector-wrap">
            <span className="ramadan-calendar__label">Calendar source</span>
            <select
              className="ramadan-calendar__selector"
              value={calendarSource}
              onChange={(event) => setCalendarSource(event.target.value)}
            >
              {[
                'Dar-ul-uloom Raheemiya',
                'Educational Trust Kashmir',
                'Jamiat Ahle Hadees J&K',
                'Soutul Awliya Trust, J&K',
                'All J&K Shia Association',
                'Bangalore - Jamiat Ulama-I-Karnataka',
                'Mumbai - Jamiatul Abrar Siddique Educational Trust',
                'Faridabad, Haryana',
              ].map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>

          <div className="ramadan-calendar__action-wrap">
            <button
              type="button"
              className="ramadan-calendar__button"
              onClick={() => setCalendarMenuOpen((open) => !open)}
            >
              <span className="ramadan-calendar__icon" aria-hidden="true">📅</span>
              <span>Get Ramadan Calendar</span>
            </button>

            <div className={`ramadan-calendar__menu ${calendarMenuOpen ? 'ramadan-calendar__menu--open' : ''}`}>
              <button type="button" className="ramadan-calendar__menu-item" onClick={handleDownloadPdf}>
                Download PDF
              </button>
              <button type="button" className="ramadan-calendar__menu-item" onClick={handleAddToCalendar}>
                Add to Calendar
              </button>
               <button type="button" className="ramadan-calendar__menu-item" onClick={handleShareWhatsApp}>
                 Share via WhatsApp
               </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export default HomePage

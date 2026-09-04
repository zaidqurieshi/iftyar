import { useEffect, useMemo, useState } from 'react'
import GlassCard from '../components/GlassCard'
import DuaCard from '../components/DuaCard'
import CircularTimer from '../components/CircularTimerNew'
import MethodSelector from '../components/MethodSelector'
import {
  buildRamadanCalendarIcs,
  formatPrayerTime,
  generateRamadanCalendarEntries,
  getIftarSehriPlaceholder,
  getNextPrayer,
  getPrayerSchedule,
  DEFAULT_METHOD_ID,
} from '../services/prayerService'
import { describeLocation } from '../services/locationService'
import { formatHijri, getTimeZoneForCoordinates } from '../services/dateService'

function HomePage({ location }) {
  const [now, setNow] = useState(() => new Date())
  const [selectedMethod, setSelectedMethod] = useState(DEFAULT_METHOD_ID)
  const [calendarSource, setCalendarSource] = useState('Dar-ul-uloom Raheemiya')
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false)
  const locationTimeZone = useMemo(
    () => getTimeZoneForCoordinates(location.lat, location.lng),
    [location.lat, location.lng],
  )

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const schedule = useMemo(() => getPrayerSchedule(location.lat, location.lng, now, selectedMethod), [location.lat, location.lng, now, selectedMethod])
  const nextPrayer = useMemo(() => getNextPrayer(location.lat, location.lng, now, selectedMethod), [location.lat, location.lng, now, selectedMethod])
  const iftarSehri = useMemo(() => getIftarSehriPlaceholder(location.lat, location.lng, now, selectedMethod, locationTimeZone), [location.lat, location.lng, now, selectedMethod, locationTimeZone])

  const remainingMs = Math.max(0, nextPrayer.time.getTime() - now.getTime())
  const remainingSeconds = Math.floor(remainingMs / 1000)
  const countdownHours = Math.floor(remainingSeconds / 3600)
  const countdownMinutes = Math.floor((remainingSeconds % 3600) / 60)
  const countdownSeconds = remainingSeconds % 60

  // Determine the current phase and appropriate target times
  let activeFastingTarget, activeFastingLabel, fastingTotalSeconds, fastingElapsedSeconds;
  if (now < iftarSehri.sehriTime) {
    // Before Sehri
    activeFastingTarget = iftarSehri.sehriTime;
    activeFastingLabel = `Sehri - ${iftarSehri.sehriLabel}`;
    fastingTotalSeconds = Math.max(0, Math.floor((iftarSehri.iftarTime - iftarSehri.sehriTime) / 1000));
    fastingElapsedSeconds = 0;
  } else if (now < iftarSehri.iftarTime) {
    // Between Sehri and Iftar
    activeFastingTarget = iftarSehri.iftarTime;
    activeFastingLabel = `Iftar - ${iftarSehri.iftarLabel}`;
    fastingTotalSeconds = Math.max(0, Math.floor((iftarSehri.iftarTime - iftarSehri.sehriTime) / 1000));
    fastingElapsedSeconds = Math.max(0, Math.floor((now - iftarSehri.sehriTime) / 1000));
  } else {
    // After Iftar - start counting to next day's Sehri
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowSehri = getIftarSehriPlaceholder(location.lat, location.lng, tomorrow, selectedMethod, locationTimeZone);
    activeFastingTarget = tomorrowSehri.sehriTime;
    activeFastingLabel = `Sehri - ${tomorrowSehri.sehriLabel}`;
    fastingTotalSeconds = Math.max(0, Math.floor((tomorrowSehri.iftarTime - tomorrowSehri.sehriTime) / 1000));
    fastingElapsedSeconds = 0;
  }
  const activeCountdownMs = Math.max(0, activeFastingTarget.getTime() - now.getTime());
  const activeCountdownSeconds = Math.floor(activeCountdownMs / 1000);
  const activeCountdownHours = Math.floor(activeCountdownSeconds / 3600);
  const activeCountdownMinutes = Math.floor((activeCountdownSeconds % 3600) / 60);
  const activeCountdownSecondsOnly = activeCountdownSeconds % 60;

  const locationLabel = location.label || describeLocation(location.lat, location.lng)
  const calendarEntries = useMemo(
    () => generateRamadanCalendarEntries(location.lat, location.lng, now, selectedMethod, 30),
    [location.lat, location.lng, now, selectedMethod],
  )
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: locationTimeZone,
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
  // Helper to create a minimal PDF with plain text content
  const buildMinimalPdf = (entries) => {
    // Simple PDF structure (very basic, enough for most viewers)
    const header = `%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj\n4 0 obj << /Length 0 >> stream\nBT\n/F1 12 Tf\n100 750 Td (Ramadan Calendar) Tj\nET\n`;
    const lines = entries.map((e, i) => `(${i + 1}) ${e.dayLabel} ${e.day} ${e.monthLabel} Sehri:${e.sehri} Iftar:${e.iftar}`).join(' ');
    const content = `BT /F1 10 Tf 100 730 Td (${lines}) Tj ET\n`;
    const footer = `\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000110 00000 n \n0000000220 00000 n \ntrailer << /Size 5 /Root 1 0 R >>\nstartxref\n330\n%%EOF`;
    const pdfString = header + content + footer;
    return new Blob([pdfString], { type: 'application/pdf' });
  };



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
            <p className="meta-value">{formatHijri(now, locationTimeZone)}</p>
          </div>
        </div>

        <div className="next-prayer">
          <p className="eyebrow">Next prayer</p>
          <div className="next-prayer__row">
            <div>
              <h3>{nextPrayer.name}</h3>
              <p>{formatPrayerTime(nextPrayer.time, locationTimeZone)}</p>
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
          
        </div>

        <div className="ramadan-timer-wrap">
          <CircularTimer
            
            hours={activeCountdownHours}
            minutes={activeCountdownMinutes}
            seconds={activeCountdownSecondsOnly}
            totalSeconds={fastingTotalSeconds}
            currentSeconds={fastingElapsedSeconds}
            label={activeFastingLabel}
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
                {/* Begin removed WhatsApp share block
               <button type="button" className="ramadan-calendar__menu-item" onClick={handleShareWhatsApp}>
                 Share via WhatsApp
               </button>
                */}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export default HomePage

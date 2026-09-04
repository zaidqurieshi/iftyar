import { CalculationMethod, Coordinates, PrayerTimes, Madhab } from 'adhan'
import iftarkarTimetables from '../data/iftarkar-timetables.json'

export const DEFAULT_METHOD_ID = 'raheemiya'

export const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

export const PRAYER_LABELS = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

const REFERENCE_OFFSETS = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 1,
  asr: 2,
  maghrib: 0,
  isha: 0,
}

// Iftarkar.com does not compute prayer times astronomically. It serves
// published daily timetables (keyed as "MMDD") for each organisation. Every
// timetable is published for a city in India, so the wall-clock times in the
// tables are Indian Standard Time (UTC+5:30, no DST).
const TABLE_TIME_ZONE = 'Asia/Kolkata'

const ADHAN_METHOD_FACTORIES = {
  muslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  egyptian: CalculationMethod.Egyptian,
  karachi: CalculationMethod.Karachi,
  ummAlQura: CalculationMethod.UmmAlQura,
  dubai: CalculationMethod.Dubai,
  northAmerica: CalculationMethod.NorthAmerica,
  tehran: CalculationMethod.Tehran,
}

// Fiqah / fallback configuration for every organisation timetable published
// on iftarkar.com. The `fallback*` fields are only used when a requested date
// is not covered by the published table (the four Ramadan-only calendars).
const TABLE_METHOD_DEFS = {
  raheemiya: {
    school: 'Fiqah Hanafiya',
    region: 'Jammu & Kashmir — Srinagar',
    fallbackAdhanMethod: 'karachi',
    fallbackMadhab: Madhab.Hanafi,
  },
  etk: {
    school: 'Fiqah Jaffaria',
    region: 'Jammu & Kashmir — Srinagar',
    fallbackAdhanMethod: 'tehran',
  },
  ahlehadees: {
    school: 'Fiqah Ahle Hadees',
    region: 'Jammu & Kashmir — Srinagar',
    fallbackAdhanMethod: 'muslimWorldLeague',
  },
  tsajk: {
    school: 'Fiqah Hanafiya',
    region: 'Jammu & Kashmir — Anantnag',
    fallbackAdhanMethod: 'karachi',
    fallbackMadhab: Madhab.Hanafi,
  },
  ajksa: {
    school: 'Fiqah Jaffaria',
    region: 'Jammu & Kashmir — Ramadan calendar',
    fallbackAdhanMethod: 'tehran',
  },
  blr_juk: {
    school: 'Fiqah Hanafi',
    region: 'Bangalore, Karnataka — Ramadan calendar',
    fallbackAdhanMethod: 'karachi',
    fallbackMadhab: Madhab.Hanafi,
  },
  mumbai_jaset: {
    school: 'Fiqah Hanafi',
    region: 'Mumbai, Maharashtra — Ramadan calendar',
    fallbackAdhanMethod: 'karachi',
    fallbackMadhab: Madhab.Hanafi,
  },
  faridabad_haryana: {
    school: 'Fiqah Hanafi',
    region: 'Faridabad, Haryana — Ramadan calendar',
    fallbackAdhanMethod: 'karachi',
    fallbackMadhab: Madhab.Hanafi,
  },
}

// The four Ramadan-only tables don't ship a `header` column list — derive one
// from the first published row, ordered chronologically by wall-clock time.
function deriveHeader(timings) {
  const firstEntry = Object.values(timings)[0]
  return Object.keys(firstEntry)
    .map((key) => ({
      key,
      label: PRAYER_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1),
    }))
    .sort((a, b) => {
      const aClock = parseWallClock(firstEntry[a.key])
      const bClock = parseWallClock(firstEntry[b.key])
      return aClock.hours * 60 + aClock.minutes - (bClock.hours * 60 + bClock.minutes)
    })
}

const TABLE_METHODS = Object.keys(TABLE_METHOD_DEFS).map((id) => {
  const data = iftarkarTimetables[id]
  const def = TABLE_METHOD_DEFS[id]

  return {
    id,
    name: data.name,
    school: def.school,
    region: def.region,
    description: data.description,
    source: 'iftarkar-table',
    header: data.header || deriveHeader(data.timings),
    timings: data.timings,
    regionOffsets: data.offsets || [],
    fallbackAdhanMethod: def.fallbackAdhanMethod,
    fallbackMadhab: def.fallbackMadhab,
  }
})

const STANDARD_METHODS = [
  {
    id: 'muslimWorldLeague',
    name: 'Muslim World League',
    school: 'Fiqah Shafii',
    region: 'Europe, Far East, parts of US',
  },
  {
    id: 'egyptian',
    name: 'Egyptian General Authority',
    school: 'Fiqah Shafii',
    region: 'Egypt, Africa, Syria, Iraq, Lebanon',
  },
  {
    id: 'karachi',
    name: 'University of Islamic Sciences',
    school: 'Fiqah Hanafi',
    region: 'Karachi, Pakistan & India',
  },
  {
    id: 'uummAlQura',
    name: 'Umm Al-Qura University',
    school: 'Fiqah Hanbali',
    region: 'Makkah, Saudi Arabia',
  },
  {
    id: 'dubai',
    name: 'Dubai Method',
    school: 'Fiqah Maliki',
    region: 'Dubai, UAE',
  },
  {
    id: 'northAmerica',
    name: 'Islamic Society of North America',
    school: 'Fiqah Hanafi',
    region: 'North America',
  },
].map((method) => ({
  ...method,
  description: `${method.name} — computed astronomically with the Adhan library.`,
  source: 'adhan',
  adhanMethodId: method.id,
}))

// All calculation methods: the eight organisation timetables published on
// iftarkar.com, followed by the standard astronomical methods.
export const CALCULATION_METHODS = [...TABLE_METHODS, ...STANDARD_METHODS]

export const CALENDAR_SOURCES = TABLE_METHODS.map((method) => ({
  name: method.name,
  methodId: method.id,
}))

// ---------------------------------------------------------------------------
// Time zone helpers
// ---------------------------------------------------------------------------

function getZoneParts(timeZone, date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const parts = {}
  formatter.formatToParts(date).forEach(({ type, value }) => {
    parts[type] = value
  })

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  }
}

function getTimeZoneOffsetMs(timeZone, date) {
  const parts = getZoneParts(timeZone, date)
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0)
  return asUtc - Math.floor(date.getTime() / 1000) * 1000
}

function parseWallClock(value) {
  const [hours, minutes] = String(value).split(':').map((part) => Number(part))
  return { hours, minutes }
}

/**
 * Convert a wall-clock time (e.g. "6:08" from a timetable) into a real Date
 * instant for the given time zone, so countdowns and "next prayer" logic work
 * correctly regardless of the user's device time zone.
 */
function createInstantFromWallClock(year, month, day, wallClock, timeZone) {
  const { hours, minutes } = parseWallClock(wallClock)
  const naiveUtc = Date.UTC(year, month - 1, day, hours, minutes, 0, 0)
  const offset = getTimeZoneOffsetMs(timeZone, new Date(naiveUtc))
  return new Date(naiveUtc - offset)
}

// ---------------------------------------------------------------------------
// Schedule builders
// ---------------------------------------------------------------------------

function createAdhanParameters(adhanMethodId, madhab, applyOffsets = false) {
  const factory = ADHAN_METHOD_FACTORIES[adhanMethodId] || CalculationMethod.MuslimWorldLeague
  const params = factory()

  if (applyOffsets) {
    params.methodAdjustments = {
      ...params.methodAdjustments,
      ...REFERENCE_OFFSETS,
    }
  }

  if (madhab) {
    params.madhab = madhab
  }

  return params
}

function buildAdhanSchedule(lat, lng, date, adhanMethodId, madhab, applyOffsets = false) {
  const coordinates = new Coordinates(lat, lng)
  const params = createAdhanParameters(adhanMethodId, madhab, applyOffsets)
  const prayerTimes = new PrayerTimes(coordinates, date, params)

  return PRAYER_ORDER.map((key) => ({
    key,
    name: PRAYER_LABELS[key],
    time: new Date(prayerTimes[key]),
  }))
}

function getTableEntry(timings, day, month) {
  // iftarkar.com keys its timetable rows as "DDMM" (day of month + month),
  // e.g. "0509" = 5 September, "2902" = 29 February on leap-year tables.
  const key = `${String(day).padStart(2, '0')}${String(month).padStart(2, '0')}`
  if (timings[key]) {
    return timings[key]
  }

  // 365-day tables (e.g. Educational Trust Kashmir) miss 29 February —
  // reuse the 28 February row on leap days so the app never breaks.
  if (month === 2 && day === 29) {
    return timings['2802'] || null
  }

  return null
}

function buildTableSchedule(method, lat, lng, date) {
  const { year, month, day } = getZoneParts(TABLE_TIME_ZONE, date)
  const entry = getTableEntry(method.timings, day, month)

  if (!entry) {
    // Date not covered by the published table (the four Ramadan-only
    // calendars) — fall back to the closest astronomical approximation.
    return buildAdhanSchedule(
      lat,
      lng,
      date,
      method.fallbackAdhanMethod,
      method.fallbackMadhab,
      false,
    )
  }

  return method.header
    .filter((column) => Boolean(entry[column.key]))
    .map((column) => ({
      key: column.key,
      name: column.label,
      time: createInstantFromWallClock(year, month, day, entry[column.key], TABLE_TIME_ZONE),
      displayTimeZone: TABLE_TIME_ZONE,
    }))
}

// ---------------------------------------------------------------------------
// Public API — every function below keeps the same signature it had before,
// but dispatches between iftarkar.com timetables and Adhan-based methods.
// ---------------------------------------------------------------------------

export function getPrayerSchedule(lat, lng, selectedDate = new Date(), methodId = DEFAULT_METHOD_ID) {
  const method = getCalculationMethodInfo(methodId)

  if (method.source === 'iftarkar-table') {
    return buildTableSchedule(method, lat, lng, selectedDate)
  }

  return buildAdhanSchedule(lat, lng, selectedDate, method.adhanMethodId, null, true)
}

export function getNextPrayer(lat, lng, now = new Date(), methodId = DEFAULT_METHOD_ID) {
  const schedule = getPrayerSchedule(lat, lng, now, methodId)
  const next = schedule.find((item) => item.time > now)

  if (next) {
    return next
  }

  const nextDay = new Date(now)
  nextDay.setDate(nextDay.getDate() + 1)
  const nextDaySchedule = getPrayerSchedule(lat, lng, nextDay, methodId)

  return nextDaySchedule[0]
}

export function getCurrentPrayer(lat, lng, now = new Date(), methodId = DEFAULT_METHOD_ID) {
  const schedule = getPrayerSchedule(lat, lng, now, methodId)
  const previousPrayer = [...schedule].reverse().find((item) => item.time <= now)

  return previousPrayer || schedule[0]
}

export function getPrayerCountdownText(lat, lng, now = new Date(), methodId = DEFAULT_METHOD_ID) {
  const next = getNextPrayer(lat, lng, now, methodId)

  if (!next) {
    return 'Calculating...'
  }

  const remainingMs = next.time.getTime() - now.getTime()

  if (remainingMs <= 0) {
    return 'Now'
  }

  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function formatPrayerTime(dateValue, timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(dateValue)
}

export function formatCountdownToText(dateValue, now = new Date()) {
  const diffMs = dateValue.getTime() - now.getTime()

  if (diffMs <= 0) {
    return 'Completed'
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function getHijriPlaceholder() {
  return '1447 AH • placeholder'
}

export function getPrayerStateLabel(lat, lng, now = new Date(), methodId = DEFAULT_METHOD_ID) {
  const current = getCurrentPrayer(lat, lng, now, methodId)
  const next = getNextPrayer(lat, lng, now, methodId)

  return {
    current,
    next,
  }
}

export function compilePrayerSummary(lat, lng, now = new Date(), methodId = DEFAULT_METHOD_ID) {
  const schedule = getPrayerSchedule(lat, lng, now, methodId)
  const current = getCurrentPrayer(lat, lng, now, methodId)
  const next = getNextPrayer(lat, lng, now, methodId)

  return {
    schedule,
    current,
    next,
    countdown: formatCountdownToText(next.time, now),
  }
}

export function getPrayerByKey(lat, lng, key, date = new Date(), methodId = DEFAULT_METHOD_ID) {
  const query = key.toLowerCase()
  const schedule = getPrayerSchedule(lat, lng, date, methodId)
  return schedule.find((entry) => entry.key.toLowerCase() === query)
}

export const prayerTimeNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export function getNextPrayerInfo(lat, lng, now = new Date(), methodId = DEFAULT_METHOD_ID) {
  const next = getNextPrayer(lat, lng, now, methodId)
  return {
    ...next,
    timeLabel: formatPrayerTime(next.time, next.displayTimeZone),
    countdown: formatCountdownToText(next.time, now),
  }
}

export function isRamadanContext() {
  return false
}

export function getIftarSehriPlaceholder(lat, lng, now = new Date(), methodId = DEFAULT_METHOD_ID, timeZone) {
  const schedule = getPrayerSchedule(lat, lng, now, methodId)
  const fajr = schedule.find((entry) => entry.key === 'fajr')
  const maghrib = schedule.find((entry) => entry.key === 'maghrib')

  const sehriTime = fajr
    ? fajr.time // Use Fajr time directly as Sehri to match iftarkar.com
    : new Date(now.getTime() + (60 * 60 * 1000 + 60 * 1000))

  const iftarTime = maghrib ? maghrib.time : new Date(now.getTime() + 2 * 60 * 60 * 1000)

  // Organisation timetables are published in IST — format their wall-clock
  // times in the table's own zone so they always match the printed calendar.
  const labelTimeZone = fajr?.displayTimeZone || maghrib?.displayTimeZone || timeZone

  const iftarCountdown = formatCountdownToText(iftarTime, now)
  const sehriCountdown = formatCountdownToText(sehriTime, now)

  const method = getCalculationMethodInfo(methodId)

  return {
    label: 'Iftar / Sehri',
    status: 'Fasting Schedule',
    iftarTime,
    sehriTime,
    iftarCountdown,
    sehriCountdown,
    sehriLabel: formatPrayerTime(sehriTime, labelTimeZone),
    iftarLabel: formatPrayerTime(iftarTime, labelTimeZone),
    iftarStatus: `Time remaining of Iftar: ${iftarCountdown}`,
    sehriStatus: `Time remaining for Sehri: ${sehriCountdown}`,
    message: method.source === 'iftarkar-table'
      ? `Sehri and Iftar follow the official ${method.name} timetable (as published on iftarkar.com).`
      : 'Fasting times calculated using your selected prayer calculation method.',
  }
}

export function getPrayerSourceNote() {
  return 'Organisation timetables are taken from iftarkar.com; other methods are computed with the Adhan library.'
}

export function generateRamadanCalendarEntries(lat, lng, baseDate = new Date(), methodId = DEFAULT_METHOD_ID, days = 30, timeZone) {
  const entries = []

  for (let index = 0; index < days; index += 1) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), index + 1)
    const schedule = getPrayerSchedule(lat, lng, date, methodId)
    const fajr = schedule.find((entry) => entry.key === 'fajr')
    const maghrib = schedule.find((entry) => entry.key === 'maghrib')

    if (!fajr || !maghrib) {
      continue
    }

    entries.push({
      date,
      day: date.getDate(),
      dayLabel: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      monthLabel: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
      sehri: formatPrayerTime(fajr.time, fajr.displayTimeZone || timeZone),
      iftar: formatPrayerTime(maghrib.time, maghrib.displayTimeZone || timeZone),
    })
  }

  return entries
}

export function buildRamadanCalendarIcs(entries, title = 'Ramadan Calendar') {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Iftyar//Ramadan Calendar//EN',
    'CALSCALE:GREGORIAN',
  ]

  entries.forEach((entry) => {
    const startDate = new Date(entry.date)
    const endDate = new Date(entry.date)
    endDate.setHours(23, 59, 59)

    const formatIcsDate = (date) => {
      const pad = (value) => String(value).padStart(2, '0')
      return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
    }

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:ramadan-${entry.day}-${startDate.getTime()}@iftyar`)
    lines.push(`DTSTAMP:${formatIcsDate(new Date())}`)
    lines.push(`DTSTART:${formatIcsDate(startDate)}`)
    lines.push(`DTEND:${formatIcsDate(endDate)}`)
    lines.push(`SUMMARY:${title}`)
    lines.push(`DESCRIPTION:Sehri ${entry.sehri} | Iftar ${entry.iftar}`)
    lines.push('END:VEVENT')
  })

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function buildGoogleCalendarUrl(entries, title = 'Ramadan Calendar') {
  const eventText = `${title} - ${entries[0]?.sehri || 'Sehri'} / ${entries[0]?.iftar || 'Iftar'}`
  const firstEvent = entries[0]
  if (!firstEvent) {
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Ramadan+Calendar'
  }

  const start = new Date(firstEvent.date)
  start.setHours(18, 0, 0, 0)
  const end = new Date(firstEvent.date)
  end.setHours(19, 0, 0, 0)

  const formatGoogleDate = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventText)}&details=${encodeURIComponent('Sehri and Iftar timings for Ramadan')}&location=${encodeURIComponent('Local Ramadan schedule')}&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}`
}

export function getCalculationMethodInfo(methodId = DEFAULT_METHOD_ID) {
  const method = CALCULATION_METHODS.find((m) => m.id === methodId)
  return method || CALCULATION_METHODS[0]
}

export function getCurrentPrayerByNow(lat, lng, now = new Date(), methodId = DEFAULT_METHOD_ID) {
  const schedule = getPrayerSchedule(lat, lng, now, methodId)

  let current = schedule[0]
  for (const item of schedule) {
    if (item.time <= now) {
      current = item
    }
  }

  return current
}

export function getCurrentPrayerName(lat, lng, now = new Date()) {
  return getCurrentPrayerByNow(lat, lng, now).name
}

export function getPrayerTimeEntry(lat, lng, key, date = new Date()) {
  return getPrayerByKey(lat, lng, key, date)
}

export function getPlannedSchedule(lat, lng, now = new Date()) {
  return getPrayerSchedule(lat, lng, now)
}

export function calculatePrayerCountdownSeconds(lat, lng, now = new Date(), methodId = DEFAULT_METHOD_ID) {
  const next = getNextPrayer(lat, lng, now, methodId)
  return Math.max(0, Math.round((next.time.getTime() - now.getTime()) / 1000))
}

export function getPrayerItem(lat, lng, key, date = new Date()) {
  return getPrayerByKey(lat, lng, key, date)
}


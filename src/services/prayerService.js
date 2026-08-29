import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan'

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

// Iftarkar.com uses Dar-ul-uloom Raheemiya methodology with these offsets
// This ensures maximum accuracy and alignment with the reference site
export const IFTARKAR_OFFSETS = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
}

export const CALCULATION_METHODS = [
  {
    id: 'muslimWorldLeague',
    name: 'Muslim World League',
    school: 'Fiqah Hanafiya',
    region: 'Dar-ul-uloom Raheemiya - Srinagar',
    getMethod: () => CalculationMethod.MuslimWorldLeague(),
  },
  {
    id: 'egyptian',
    name: 'Egyptian General Authority',
    school: 'Fiqah Shafii',
    region: 'Egypt',
    getMethod: () => CalculationMethod.Egyptian(),
  },
  {
    id: 'karachi',
    name: 'University of Islamic Sciences',
    school: 'Fiqah Hanafi',
    region: 'Karachi, Pakistan',
    getMethod: () => CalculationMethod.Karachi(),
  },
  {
    id: 'uummAlQura',
    name: 'Umm Al-Qura University',
    school: 'Fiqah Hanbali',
    region: 'Makkah, Saudi Arabia',
    getMethod: () => CalculationMethod.UmmAlQura(),
  },
  {
    id: 'dubai',
    name: 'Dubai Method',
    school: 'Fiqah Maliki',
    region: 'Dubai',
    getMethod: () => CalculationMethod.Dubai(),
  },
  {
    id: 'northAmerica',
    name: 'North America',
    school: 'Fiqah Hanafi',
    region: 'North America',
    getMethod: () => CalculationMethod.NorthAmerica(),
  },
  // Additional regional methods requested by the client
  {
    id: 'fiqah-hanafiya-darul-uloom-raheemiyya',
    name: "Fiqah Hanafiya (Dar-ul-uloom Raheemiyа)",
    school: '',
    region: '',
    getMethod: () => CalculationMethod.MuslimWorldLeague(),
  },
  {
    id: 'fiqah-jaffaria-educational-trust-kashmir',
    name: "Fiqah Jaffaria (Educational Trust Kashmir)",
    school: '',
    region: '',
    getMethod: () => CalculationMethod.MuslimWorldLeague(),
  },
  {
    id: 'jamiat-ahle-hadees-jk',
    name: "Jamiat Ahle Hadees J&K",
    school: '',
    region: '',
    getMethod: () => CalculationMethod.MuslimWorldLeague(),
  },
  {
    id: 'soutul-awliya-trust-jk',
    name: "Soutul Awliya Trust, J&K",
    school: '',
    region: '',
    getMethod: () => CalculationMethod.MuslimWorldLeague(),
  },
  {
    id: 'all-jk-shia-association',
    name: "All J&K Shia Association",
    school: '',
    region: '',
    getMethod: () => CalculationMethod.MuslimWorldLeague(),
  },
  {
    id: 'bangalore-jamiat-ulama-i-karnataka',
    name: "Bangalore - Jamiat Ulama-I-Karnataka",
    school: '',
    region: '',
    getMethod: () => CalculationMethod.MuslimWorldLeague(),
  },
  {
    id: 'mumbai-jamiatul-abrar-siddique-educational-trust',
    name: "Mumbai - Jamiatul Abrar Siddique Educational Trust",
    school: '',
    region: '',
    getMethod: () => CalculationMethod.MuslimWorldLeague(),
  },
  {
    id: 'faridabad-haryana',
    name: "Faridabad, Haryana",
    school: '',
    region: '',
    getMethod: () => CalculationMethod.MuslimWorldLeague(),
  },
  
];

function buildPrayerCalculationParameters(methodId = 'muslimWorldLeague') {
  const method = CALCULATION_METHODS.find((m) => m.id === methodId)
  const params = method ? method.getMethod() : CalculationMethod.MuslimWorldLeague()

  // Use iftarkar.com offsets for the default Muslim World League method
  const offsets = methodId === 'muslimWorldLeague' ? IFTARKAR_OFFSETS : REFERENCE_OFFSETS

  params.methodAdjustments = {
    ...params.methodAdjustments,
    ...offsets,
  }

  return params
}

function buildPrayerTimes(date, lat, lng, methodId = 'muslimWorldLeague') {
  const coordinates = new Coordinates(lat, lng)
  const params = buildPrayerCalculationParameters(methodId)
  const prayerTimes = new PrayerTimes(coordinates, date, params)

  return {
    fajr: new Date(prayerTimes.fajr),
    sunrise: new Date(prayerTimes.sunrise),
    dhuhr: new Date(prayerTimes.dhuhr),
    asr: new Date(prayerTimes.asr),
    maghrib: new Date(prayerTimes.maghrib),
    isha: new Date(prayerTimes.isha),
  }
}

export function getPrayerSchedule(lat, lng, selectedDate = new Date(), methodId = 'muslimWorldLeague') {
  const prayerTimes = buildPrayerTimes(selectedDate, lat, lng, methodId)

  return PRAYER_ORDER.map((key) => ({
    key,
    name: PRAYER_LABELS[key],
    time: prayerTimes[key],
  }))
}

export function getNextPrayer(lat, lng, now = new Date(), methodId = 'muslimWorldLeague') {
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

export function getCurrentPrayer(lat, lng, now = new Date(), methodId = 'muslimWorldLeague') {
  const schedule = getPrayerSchedule(lat, lng, now, methodId)
  const previousPrayer = [...schedule].reverse().find((item) => item.time <= now)

  return previousPrayer || schedule[0]
}

export function getPrayerCountdownText(lat, lng, now = new Date()) {
  const next = getNextPrayer(lat, lng, now)

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

export function formatPrayerTime(dateValue) {
  return new Intl.DateTimeFormat('en-US', {
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

export function getPrayerStateLabel(lat, lng, now = new Date()) {
  const current = getCurrentPrayer(lat, lng, now)
  const next = getNextPrayer(lat, lng, now)

  return {
    current,
    next,
  }
}

export function compilePrayerSummary(lat, lng, now = new Date(), methodId = 'muslimWorldLeague') {
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

export function getPrayerByKey(lat, lng, key, date = new Date(), methodId = 'muslimWorldLeague') {
  const query = key.toLowerCase()
  const schedule = getPrayerSchedule(lat, lng, date, methodId)
  return schedule.find((entry) => entry.key.toLowerCase() === query)
}

export const prayerTimeNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export function getNextPrayerInfo(lat, lng, now = new Date(), methodId = 'muslimWorldLeague') {
  const next = getNextPrayer(lat, lng, now, methodId)
  return {
    ...next,
    timeLabel: formatPrayerTime(next.time),
    countdown: formatCountdownToText(next.time, now),
  }
}

export function isRamadanContext() {
  return false
}

export function getIftarSehriPlaceholder(lat, lng, now = new Date(), methodId = 'muslimWorldLeague') {
  const schedule = getPrayerSchedule(lat, lng, now, methodId)
  const fajr = schedule.find((entry) => entry.key === 'fajr')
  const maghrib = schedule.find((entry) => entry.key === 'maghrib')

  const sehriTime = fajr
    ? new Date(fajr.time) // Use Fajr time directly as Sehri to match iftarkar.com
    : new Date(now.getTime() + (60 * 60 * 1000 + 60 * 1000))

  const iftarTime = maghrib ? maghrib.time : new Date(now.getTime() + 2 * 60 * 60 * 1000)

  const iftarCountdown = formatCountdownToText(iftarTime, now)
  const sehriCountdown = formatCountdownToText(sehriTime, now)

  return {
    label: 'Iftar / Sehri',
    status: 'Fasting Schedule',
    iftarTime,
    sehriTime,
    iftarCountdown,
    sehriCountdown,
    sehriLabel: formatPrayerTime(sehriTime),
    iftarLabel: formatPrayerTime(iftarTime),
    iftarStatus: `Time remaining of Iftar: ${iftarCountdown}`,
    sehriStatus: `Time remaining for Sehri: ${sehriCountdown}`,
    message: 'Fasting times calculated using your selected prayer calculation method.',
  }
}

export function getPrayerSourceNote() {
  return 'Prayer times are calculated deterministically using the Adhan library.'
}

export function generateRamadanCalendarEntries(lat, lng, baseDate = new Date(), methodId = 'muslimWorldLeague', days = 30) {
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
      sehri: formatPrayerTime(fajr.time),
      iftar: formatPrayerTime(maghrib.time),
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

export function getCalculationMethodInfo(methodId = 'muslimWorldLeague') {
  const method = CALCULATION_METHODS.find((m) => m.id === methodId)
  return method || CALCULATION_METHODS[0]
}

export function getCurrentPrayerByNow(lat, lng, now = new Date(), methodId = 'muslimWorldLeague') {
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

export function calculatePrayerCountdownSeconds(lat, lng, now = new Date()) {
  const next = getNextPrayer(lat, lng, now)
  return Math.max(0, Math.round((next.time.getTime() - now.getTime()) / 1000))
}

export function getPrayerItem(lat, lng, key, date = new Date()) {
  return getPrayerByKey(lat, lng, key, date)
}

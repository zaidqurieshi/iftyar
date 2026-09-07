import tzlookup from 'tz-lookup'

export function getTimeZoneForCoordinates(lat, lng) {
  try {
    return tzlookup(Number(lat), Number(lng))
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

/**
 * Formats the given date into the Hijri calendar.
 * Regional moon sightings (e.g. South Asia / Kashmir) typically lag the astronomical
 * Umm al-Qura calculation by 2 days, so an offset is applied by default (-2 days).
 */
export function formatHijri(date, timeZone, offsetDays = -2) {
  const adjusted = new Date(date)
  adjusted.setDate(adjusted.getDate() + offsetDays)

  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const parts = formatter.formatToParts(adjusted)
  const day = parts.find((p) => p.type === 'day')?.value || ''
  const month = parts.find((p) => p.type === 'month')?.value || ''
  const year = parts.find((p) => p.type === 'year')?.value || ''
  return `${day} ${month} ${year} AH`
}


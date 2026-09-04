import tzlookup from 'tz-lookup'

export function getTimeZoneForCoordinates(lat, lng) {
  try {
    return tzlookup(Number(lat), Number(lng))
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

export function formatHijri(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const day = parts.find((p) => p.type === 'day')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';
  const year = parts.find((p) => p.type === 'year')?.value || '';
  return `${day} ${month} ${year} AH`;
}

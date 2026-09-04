import assert from 'node:assert'
import rawTimetable from './src/data/iftarkar-timetables.json' with { type: 'json' }
import {
  CALCULATION_METHODS,
  CALENDAR_SOURCES,
  DEFAULT_METHOD_ID,
  getIftarSehriPlaceholder,
  getNextPrayer,
  getPrayerSchedule,
  formatPrayerTime,
  generateRamadanCalendarEntries,
} from './src/services/prayerService.js'

const SRINAGAR = { lat: 34.0837, lng: 74.7973 }
const fmt = (row) => formatPrayerTime(row.time, row.displayTimeZone)

// Convert a timetable wall clock ("19:01") to the en-US format used by formatPrayerTime
function toAmPm(wallClock) {
  const [hours, minutes] = wallClock.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 === 0 ? 12 : hours % 12
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`
}

// 1. Method inventory: 8 iftarkar.com timetables + 6 standard methods
assert.equal(CALCULATION_METHODS.length, 14, 'expected 14 calculation methods')
assert.equal(CALENDAR_SOURCES.length, 8, 'expected 8 calendar sources')
assert.equal(DEFAULT_METHOD_ID, 'raheemiya')
console.log('1. method inventory OK:', CALCULATION_METHODS.map((m) => m.id).join(', '))

// 2. raheemiya on Jan 1 must match iftarkar.com's published row:
//    fajr 6:08, zuhr 12:35, asr 15:55, maghrib 17:36, isha 19:01 (IST wall clock)
const jan1 = new Date(2026, 0, 1, 12, 0, 0)
const raheemiya = getPrayerSchedule(SRINAGAR.lat, SRINAGAR.lng, jan1, 'raheemiya')
assert.equal(raheemiya.length, 5, 'table has no sunrise column')
assert.equal(fmt(raheemiya[0]), '6:08 AM', 'fajr should match iftarkar.com table')
assert.equal(fmt(raheemiya[1]), '12:35 PM', 'zuhr should match iftarkar.com table')
assert.equal(fmt(raheemiya[2]), '3:55 PM', 'asr should match iftarkar.com table')
assert.equal(fmt(raheemiya[3]), '5:36 PM', 'maghrib should match iftarkar.com table')
assert.equal(fmt(raheemiya[4]), '7:01 PM', 'isha should match iftarkar.com table')
console.log('2. raheemiya Jan 1 matches iftarkar.com:', raheemiya.map((r) => `${r.name} ${fmt(r)}`).join(' | '))

// 2b. Data-driven check on asymmetric dates (guards against DDMM/MMDD mixups):
//     for each sampled date, the schedule must equal the raw published row.
const samples = [[1, 1], [15, 3], [20, 7], [5, 9], [25, 12]]
for (const [day, month] of samples) {
  const date = new Date(2026, month - 1, day, 12, 0, 0)
  const schedule = getPrayerSchedule(SRINAGAR.lat, SRINAGAR.lng, date, 'raheemiya')
  const row = rawTimetable.raheemiya.timings[`${String(day).padStart(2, '0')}${String(month).padStart(2, '0')}`]
  for (const column of rawTimetable.raheemiya.header) {
    const cell = schedule.find((r) => r.key === column.key)
    const expected = toAmPm(row[column.key])
    assert.equal(fmt(cell), expected, `raheemiya ${day}/${month} ${column.key} should be ${expected}`)
  }
}
console.log('2b. sampled dates (1/1, 15/3, 20/7, 5/9, 25/12) all match raw table rows')

// 3. IST wall clock is stored as the correct absolute instant (6:08 IST = 00:38 UTC)
assert.equal(raheemiya[0].time.toISOString(), '2026-01-01T00:38:00.000Z')
console.log('3. IST instant conversion OK')

// 4. Switching methods must change the prayer times
const etk = getPrayerSchedule(SRINAGAR.lat, SRINAGAR.lng, jan1, 'etk')
assert.equal(etk.length, 3, 'etk publishes fajr/zuhrain/maghribain only')
assert.equal(etk[1].name, 'Zuhrain')
assert.ok(raheemiya[0].time.getTime() !== etk[0].time.getTime(), 'fajr differs between orgs (6:08 vs 6:17)')

const ahlehadees = getPrayerSchedule(SRINAGAR.lat, SRINAGAR.lng, jan1, 'ahlehadees')
assert.ok(
  ahlehadees.find((r) => r.key === 'asr').time.getTime() !== raheemiya.find((r) => r.key === 'asr').time.getTime(),
  'asr differs between raheemiya and ahlehadees tables',
)

const mwl = getPrayerSchedule(SRINAGAR.lat, SRINAGAR.lng, jan1, 'muslimWorldLeague')
const isna = getPrayerSchedule(SRINAGAR.lat, SRINAGAR.lng, jan1, 'northAmerica')
assert.equal(mwl.length, 6, 'adhan methods include sunrise')
assert.ok(mwl.find((r) => r.key === 'isha').time.getTime() !== isna.find((r) => r.key === 'isha').time.getTime())
assert.ok(mwl.find((r) => r.key === 'fajr').time.getTime() !== raheemiya.find((r) => r.key === 'fajr').time.getTime())
console.log('4. switching methods changes timings OK')

// 5. Feb 29 works for the 365-day table (etk)
const etkFeb29 = getPrayerSchedule(SRINAGAR.lat, SRINAGAR.lng, new Date(2028, 1, 29, 12, 0), 'etk')
assert.equal(etkFeb29.length, 3)
console.log('5. Feb 29 fallback OK:', etkFeb29.map((r) => fmt(r)).join(' | '))

// 6. Ramadan-only tables: inside window -> table row; outside -> adhan fallback
const ajksaOffSeason = getPrayerSchedule(SRINAGAR.lat, SRINAGAR.lng, jan1, 'ajksa')
assert.equal(ajksaOffSeason.length, 6, 'falls back to full adhan schedule outside Ramadan window')
const ajksaRamadan = getPrayerSchedule(SRINAGAR.lat, SRINAGAR.lng, new Date(2026, 2, 1, 12, 0), 'ajksa')
assert.equal(ajksaRamadan.length, 2, 'ajksa table publishes fajr + maghrib only')
assert.equal(fmt(ajksaRamadan[0]), '5:38 AM', 'ajksa Mar 1 fajr matches published calendar')
console.log('6. Ramadan-only table + fallback OK')

// 7. next-prayer and sehri/iftar flows work for table methods
const now = new Date()
const next = getNextPrayer(SRINAGAR.lat, SRINAGAR.lng, now, 'raheemiya')
assert.ok(next && next.time.getTime() > now.getTime())
const iftarSehri = getIftarSehriPlaceholder(SRINAGAR.lat, SRINAGAR.lng, now, 'raheemiya', 'Asia/Kolkata')
assert.ok(iftarSehri.message.includes('iftarkar.com'))
console.log('7. next prayer:', next.name, fmt(next), '| sehri', iftarSehri.sehriLabel, '| iftar', iftarSehri.iftarLabel)

// 8. Ramadan calendar generation uses the table
const entries = generateRamadanCalendarEntries(SRINAGAR.lat, SRINAGAR.lng, new Date(2026, 0, 1), 'raheemiya', 5, 'Asia/Kolkata')
assert.equal(entries.length, 5)
assert.equal(entries[0].sehri, '6:08 AM')
console.log('8. ramadan calendar entries OK:', entries.map((e) => `${e.dayLabel} ${e.day}: ${e.sehri}-${e.iftar}`).join(' ; '))

console.log('\nALL CHECKS PASSED ✅')

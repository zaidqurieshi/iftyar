import { getTimeZoneForCoordinates } from './dateService.js'

export const defaultLocation = {
  lat: 34.0837,
  lng: 74.7973,
  city: 'Srinagar',
  region: 'Jammu and Kashmir',
  country: 'India',
  countryCode: 'IN',
  label: 'Srinagar, Jammu and Kashmir',
  timeZone: 'Asia/Kolkata',
  source: 'default',
  isVpn: false,
}

// Known VPN, datacenter, and hosting provider keywords
const VPN_KEYWORDS = [
  'vpn',
  'proxy',
  'tor',
  'hosting',
  'datacenter',
  'data center',
  'cloud',
  'm247',
  'datacamp',
  'choopa',
  'leaseweb',
  'digitalocean',
  'ovh',
  'linode',
  'packethub',
  'nord',
  'expressvpn',
  'surfshark',
  'proton',
  'mullvad',
  'warp',
  'cloudflare',
  'wireguard',
  'openvpn',
]

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function describeLocation(lat, lng) {
  const latitudeText = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`
  const longitudeText = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`

  return `${latitudeText} / ${longitudeText}`
}

/**
 * Fetches the user's IP-based geolocation from reliable endpoints.
 * Automatically queries through whatever active network connection / VPN is present.
 */
export async function fetchIpLocation() {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  // 1. Try ipwhois.app (CORS-friendly, rich fields including city, country, lat, lng, org)
  try {
    const res = await fetch('https://ipwhois.app/json/', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      const data = await res.json()
      clearTimeout(timeoutId)
      if (data && data.success !== false && typeof data.latitude === 'number') {
        const city = data.city || ''
        const region = data.region || ''
        const country = data.country || ''
        const parts = [city, region, country].filter(Boolean)
        const label = parts.length > 0 ? parts.join(', ') : describeLocation(data.latitude, data.longitude)

        return {
          ip: data.ip,
          lat: data.latitude,
          lng: data.longitude,
          city,
          region,
          country,
          countryCode: data.country_code || '',
          label,
          timeZone: data.timezone || getTimeZoneForCoordinates(data.latitude, data.longitude),
          isProxy: Boolean(data.security?.vpn || data.security?.proxy || data.security?.tor),
          org: data.org || data.isp || '',
          source: 'ip',
        }
      }
    }
  } catch {
    // Continue to next provider
  }

  // 2. Try freeipapi.com (Fast, provides isProxy flag)
  try {
    const res = await fetch('https://freeipapi.com/api/json', {
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      const data = await res.json()
      clearTimeout(timeoutId)
      if (data && typeof data.latitude === 'number') {
        const city = data.cityName || ''
        const region = data.regionName || ''
        const country = data.countryName || ''
        const parts = [city, region, country].filter(Boolean)
        const label = parts.length > 0 ? parts.join(', ') : describeLocation(data.latitude, data.longitude)
        const tz = Array.isArray(data.timeZones) && data.timeZones.length > 0 ? data.timeZones[0] : null

        return {
          ip: data.ipAddress,
          lat: data.latitude,
          lng: data.longitude,
          city,
          region,
          country,
          countryCode: data.countryCode || '',
          label,
          timeZone: tz || getTimeZoneForCoordinates(data.latitude, data.longitude),
          isProxy: Boolean(data.isProxy),
          org: data.asnOrganization || '',
          source: 'ip',
        }
      }
    }
  } catch {
    // Continue to next provider
  }

  // 3. Try ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' },
    })
    if (res.ok) {
      const data = await res.json()
      clearTimeout(timeoutId)
      if (data && typeof data.latitude === 'number') {
        const city = data.city || ''
        const region = data.region || ''
        const country = data.country_name || ''
        const parts = [city, region, country].filter(Boolean)
        const label = parts.length > 0 ? parts.join(', ') : describeLocation(data.latitude, data.longitude)

        return {
          ip: data.ip,
          lat: data.latitude,
          lng: data.longitude,
          city,
          region,
          country,
          countryCode: data.country_code || '',
          label,
          timeZone: data.timezone || getTimeZoneForCoordinates(data.latitude, data.longitude),
          isProxy: false,
          org: data.org || '',
          source: 'ip',
        }
      }
    }
  } catch {
    // All IP providers exhausted
  }

  clearTimeout(timeoutId)
  return null
}

/**
 * Fetches hardware GPS coordinates from navigator.geolocation if allowed.
 * Returns null if not supported, denied, or timed out.
 */
export function fetchDeviceGpsLocation(timeoutMs = 12000) {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    let resolved = false

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve(null)
      }
    }, timeoutMs)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timer)
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            source: 'device',
          })
        }
      },
      () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timer)
          resolve(null)
        }
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0, // Request fresh, real-time hardware location
      },
    )
  })
}

/**
 * Evaluates whether an active VPN connection is detected on the network IP.
 */
export function detectVpn(ipData) {
  if (!ipData) return { isVpn: false }

  // 1. Explicit proxy / VPN flag from IP intelligence API
  if (ipData.isProxy) {
    return { isVpn: true, reason: 'proxy-flag' }
  }

  // 2. Organization / ISP name matches known VPN / hosting datacenter
  const orgLower = (ipData.org || '').toLowerCase()
  if (VPN_KEYWORDS.some((kw) => orgLower.includes(kw))) {
    return { isVpn: true, reason: 'datacenter-asn' }
  }

  return { isVpn: false }
}

/**
 * Reverse geocodes coordinates to a pinpoint locality, city, and region name.
 * Uses BigDataCloud Client Reverse Geocode API (high precision, fast, client-CORS friendly,
 * returns Google Maps Plus Code) with OpenStreetMap Nominatim as backup.
 */
export async function reverseGeocodePinpoint(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return {
      city: 'Your Location',
      locality: '',
      region: '',
      country: '',
      countryCode: '',
      label: describeLocation(lat, lng),
    }
  }

  // 1. Primary: BigDataCloud Client API (fast, pinpoint locality, no API key needed)
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      },
    )
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      const locality = (data.locality || '').trim()
      const city = (data.city || '').trim()
      const region = (data.principalSubdivision || '').trim()
      const country = (data.countryName || '').trim()
      const countryCode = (data.countryCode || '').trim()

      const bestCity = city || locality || region
      const parts = []
      if (locality && locality !== city) parts.push(locality)
      if (city) parts.push(city)
      if (region && region !== city && region !== locality) parts.push(region)

      const label = parts.length > 0 ? parts.join(', ') : describeLocation(lat, lng)

      return {
        city: bestCity || 'Your Location',
        locality,
        region,
        country,
        countryCode,
        label,
        plusCode: data.plusCode || '',
      }
    }
  } catch {
    // Continue to fallback
  }

  // 2. Secondary: OpenStreetMap Nominatim
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      },
    )
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      const addr = data.address || {}
      const locality = addr.suburb || addr.neighbourhood || addr.village || ''
      const city = addr.city || addr.town || addr.municipality || addr.county || ''
      const region = addr.state || addr.state_district || ''
      const country = addr.country || ''
      const countryCode = (addr.country_code || '').toUpperCase()

      const bestCity = city || locality || region
      const parts = [locality && locality !== city ? locality : null, city, region].filter(Boolean)
      const label = parts.length > 0 ? parts.join(', ') : (data.display_name?.split(',').slice(0, 2).join(', ') || describeLocation(lat, lng))

      return {
        city: bestCity || 'Your Location',
        locality,
        region,
        country,
        countryCode,
        label,
      }
    }
  } catch {
    // Fallback
  }

  return {
    city: 'Your Location',
    locality: '',
    region: '',
    country: '',
    countryCode: '',
    label: describeLocation(lat, lng),
  }
}

/**
 * Detects the user's location automatically:
 * - Prioritizes the phone's or computer's actual hardware GPS location to the exact pinpoint.
 * - Reverse geocodes the pinpoint coordinates into human-readable locality and city names.
 * - If device GPS is unavailable or denied, falls back to network IP / VPN geolocation.
 */
export async function detectUserLocation() {
  // 1. Kick off GPS and IP queries concurrently
  const gpsPromise = fetchDeviceGpsLocation(12000).catch(() => null)
  const ipPromise = fetchIpLocation().catch(() => null)

  // 2. Hardware GPS is primary and authoritative
  const gpsData = await gpsPromise
  if (gpsData && typeof gpsData.lat === 'number' && typeof gpsData.lng === 'number') {
    const geo = await reverseGeocodePinpoint(gpsData.lat, gpsData.lng)
    const timeZone = getTimeZoneForCoordinates(gpsData.lat, gpsData.lng)

    return {
      lat: gpsData.lat,
      lng: gpsData.lng,
      city: geo.city || geo.locality || 'Your Location',
      locality: geo.locality || '',
      region: geo.region || '',
      country: geo.country || '',
      countryCode: geo.countryCode || '',
      label: geo.label || describeLocation(gpsData.lat, gpsData.lng),
      timeZone,
      source: 'device',
      accuracy: gpsData.accuracy,
      plusCode: geo.plusCode || '',
      isVpn: false,
    }
  }

  // 3. If hardware GPS is unavailable or blocked, fall back to IP/VPN detection
  const ipData = await ipPromise
  if (ipData) {
    const { isVpn } = detectVpn(ipData)
    let city = ipData.city
    let label = ipData.label

    if (!city || city === 'Your Location') {
      const geo = await reverseGeocodePinpoint(ipData.lat, ipData.lng)
      if (geo.city && geo.city !== 'Your Location') {
        city = geo.city
        label = geo.label
      }
    }

    return {
      lat: ipData.lat,
      lng: ipData.lng,
      city: city || 'Your Location',
      region: ipData.region || '',
      country: ipData.country || '',
      countryCode: ipData.countryCode || '',
      label: label || describeLocation(ipData.lat, ipData.lng),
      timeZone: ipData.timeZone || getTimeZoneForCoordinates(ipData.lat, ipData.lng),
      source: isVpn ? 'vpn' : 'network',
      isVpn,
    }
  }

  // 4. Default fallback if offline or completely unreachable
  return defaultLocation
}

export function normalizeLocation(loc) {
  const safeLat = Number(loc?.lat ?? defaultLocation.lat)
  const safeLng = Number(loc?.lng ?? defaultLocation.lng)

  return {
    lat: Number.isFinite(safeLat) ? safeLat : defaultLocation.lat,
    lng: Number.isFinite(safeLng) ? safeLng : defaultLocation.lng,
    city: loc?.city || '',
    locality: loc?.locality || '',
    region: loc?.region || '',
    country: loc?.country || '',
    countryCode: loc?.countryCode || '',
    label: loc?.label || describeLocation(safeLat, safeLng),
    timeZone: loc?.timeZone || getTimeZoneForCoordinates(safeLat, safeLng),
    source: loc?.source || 'default',
    accuracy: loc?.accuracy || null,
    plusCode: loc?.plusCode || '',
    isVpn: Boolean(loc?.isVpn),
  }
}

export async function getPlaceLabelFromCoordinates(lat, lng) {
  const geo = await reverseGeocodePinpoint(lat, lng)
  return geo.label || describeLocation(lat, lng)
}

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
export function fetchDeviceGpsLocation(timeoutMs = 6000) {
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
            source: 'gps',
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
        maximumAge: 120000,
      },
    )
  })
}

/**
 * Evaluates whether an active VPN connection is detected.
 */
export function detectVpn(ipData, gpsData) {
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

  // 3. Significant geographic distance between hardware GPS and IP location
  if (gpsData && typeof gpsData.lat === 'number' && typeof gpsData.lng === 'number') {
    const distKm = calculateDistanceKm(ipData.lat, ipData.lng, gpsData.lat, gpsData.lng)
    // If device physical GPS is > 75km away from the network IP address, a VPN/tunnel is active
    if (distKm > 75) {
      return { isVpn: true, reason: 'gps-ip-mismatch', distKm }
    }
  }

  return { isVpn: false }
}

/**
 * Detects the user's location automatically:
 * - If a VPN is active, the location from the VPN is selected.
 * - If no VPN is active, the physical device location is selected.
 */
export async function detectUserLocation() {
  // Query both IP geolocation and device GPS in parallel
  const [ipData, gpsData] = await Promise.all([
    fetchIpLocation().catch(() => null),
    fetchDeviceGpsLocation().catch(() => null),
  ])

  // Case 1: IP data retrieved
  if (ipData) {
    const { isVpn } = detectVpn(ipData, gpsData)

    if (isVpn) {
      // User is on a VPN -> select location from VPN as requested!
      return {
        lat: ipData.lat,
        lng: ipData.lng,
        city: ipData.city || 'VPN Location',
        region: ipData.region || '',
        country: ipData.country || '',
        countryCode: ipData.countryCode || '',
        label: ipData.label || describeLocation(ipData.lat, ipData.lng),
        timeZone: ipData.timeZone || getTimeZoneForCoordinates(ipData.lat, ipData.lng),
        source: 'vpn',
        isVpn: true,
      }
    }

    // No VPN detected:
    // If device GPS is available, use precise GPS coordinates with reverse-geocoded city
    if (gpsData) {
      const timeZone = getTimeZoneForCoordinates(gpsData.lat, gpsData.lng)
      return {
        lat: gpsData.lat,
        lng: gpsData.lng,
        city: ipData.city || 'Device Location',
        region: ipData.region || '',
        country: ipData.country || '',
        countryCode: ipData.countryCode || '',
        label: ipData.label || describeLocation(gpsData.lat, gpsData.lng),
        timeZone,
        source: 'gps',
        isVpn: false,
      }
    }

    // GPS not available: use IP network location as device location
    return {
      lat: ipData.lat,
      lng: ipData.lng,
      city: ipData.city || 'Your Location',
      region: ipData.region || '',
      country: ipData.country || '',
      countryCode: ipData.countryCode || '',
      label: ipData.label || describeLocation(ipData.lat, ipData.lng),
      timeZone: ipData.timeZone || getTimeZoneForCoordinates(ipData.lat, ipData.lng),
      source: 'network',
      isVpn: false,
    }
  }

  // Case 2: IP data failed but GPS succeeded
  if (gpsData) {
    const timeZone = getTimeZoneForCoordinates(gpsData.lat, gpsData.lng)
    return {
      lat: gpsData.lat,
      lng: gpsData.lng,
      city: 'Your Location',
      region: '',
      country: '',
      countryCode: '',
      label: describeLocation(gpsData.lat, gpsData.lng),
      timeZone,
      source: 'gps',
      isVpn: false,
    }
  }

  // Case 3: Offline fallback
  return defaultLocation
}

export function normalizeLocation(loc) {
  const safeLat = Number(loc?.lat ?? defaultLocation.lat)
  const safeLng = Number(loc?.lng ?? defaultLocation.lng)

  return {
    lat: Number.isFinite(safeLat) ? safeLat : defaultLocation.lat,
    lng: Number.isFinite(safeLng) ? safeLng : defaultLocation.lng,
    city: loc?.city || '',
    region: loc?.region || '',
    country: loc?.country || '',
    countryCode: loc?.countryCode || '',
    label: loc?.label || describeLocation(safeLat, safeLng),
    timeZone: loc?.timeZone || getTimeZoneForCoordinates(safeLat, safeLng),
    source: loc?.source || 'default',
    isVpn: Boolean(loc?.isVpn),
  }
}

export async function getPlaceLabelFromCoordinates(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`,
      {
        headers: { Accept: 'application/json' },
      },
    )

    if (response.ok) {
      const json = await response.json()
      const displayName = json?.display_name
      if (displayName) {
        const parts = displayName.split(',').map((p) => p.trim()).filter(Boolean)
        return parts.slice(0, 2).join(', ')
      }
    }
  } catch {
    // Fallback
  }

  return describeLocation(lat, lng)
}

export const defaultLocation = {
  lat: 51.5074,
  lng: -0.1278,
  label: 'Central London',
  source: 'fallback',
}

export function describeLocation(lat, lng) {
  const latitudeText = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`
  const longitudeText = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`

  return `${latitudeText} / ${longitudeText}`
}

export function normalizeLocation(location) {
  const safeLat = Number(location?.lat ?? defaultLocation.lat)
  const safeLng = Number(location?.lng ?? defaultLocation.lng)

  return {
    lat: Number.isFinite(safeLat) ? safeLat : defaultLocation.lat,
    lng: Number.isFinite(safeLng) ? safeLng : defaultLocation.lng,
    label: location?.label || describeLocation(safeLat, safeLng),
    source: location?.source || 'manual',
  }
}

export function requestCurrentLocation() {
  if (!('geolocation' in navigator)) {
    return Promise.reject(new Error('Geolocation is not supported in this browser.'))
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        resolve({
          lat,
          lng,
          label: 'Current location',
          source: 'browser',
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  })
}

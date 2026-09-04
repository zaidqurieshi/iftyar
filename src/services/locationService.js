export const defaultLocation = {
  lat: 34.0837,
  lng: 74.7973,
  label: 'Srinagar, Jammu and Kashmir',
  source: 'fallback',
}

export function describeLocation(lat, lng) {
  const latitudeText = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`
  const longitudeText = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`

  return `${latitudeText} / ${longitudeText}`
}

export async function getPlaceLabelFromCoordinates(lat, lng) {
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (googleApiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`,
      )

      if (!response.ok) {
        throw new Error('Google geocoding request failed.')
      }

      const json = await response.json()
      const result = json?.results?.[0]

      if (result?.formatted_address) {
        const addressParts = result.formatted_address.split(',')
        return addressParts.slice(0, 2).join(',').trim() || result.formatted_address
      }
    } catch {
      // Fall through to Nominatim below.
    }
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error('Reverse geocoding failed.')
    }

    const json = await response.json()
    const displayName = json?.display_name

    if (displayName) {
      const parts = displayName.split(',').map((part) => part.trim()).filter(Boolean)
      return parts.slice(0, 2).join(', ')
    }
  } catch {
    // Final fallback below.
  }

  return describeLocation(lat, lng)
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
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const label = await getPlaceLabelFromCoordinates(lat, lng)

        resolve({
          lat,
          lng,
          label,
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

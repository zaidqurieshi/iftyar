import { useEffect, useState } from 'react'
import {
  defaultLocation,
  normalizeLocation,
  requestCurrentLocation,
} from '../services/locationService'

const STORAGE_KEY = 'iftyar.location'

export function useLocationState() {
  const [location, setLocation] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultLocation
    }

    const saved = window.localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return defaultLocation
    }

    try {
      return normalizeLocation(JSON.parse(saved))
    } catch {
      return defaultLocation
    }
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location))
    }
  }, [location])

  useEffect(() => {
    let active = true

    const initializeLocation = async () => {
      setStatus('loading')
      setError('')

      try {
        const result = await requestCurrentLocation()
        if (!active) return

        const normalized = normalizeLocation(result)
        setLocation(normalized)
        setStatus('ready')
      } catch (geoError) {
        if (!active) return

        const fallback = normalizeLocation(defaultLocation)
        setLocation(fallback)
        setStatus('manual')
        setError(geoError?.message || 'Location permission was unavailable.')
      }
    }

    initializeLocation()

    return () => {
      active = false
    }
  }, [])

  const requestBrowserLocation = async () => {
    setStatus('loading')
    setError('')

    try {
      const result = await requestCurrentLocation()
      const normalized = normalizeLocation(result)
      setLocation(normalized)
      setStatus('ready')
      return normalized
    } catch (geoError) {
      const fallback = normalizeLocation(defaultLocation)
      setLocation(fallback)
      setStatus('manual')
      setError(geoError?.message || 'Location permission was unavailable.')
      return fallback
    }
  }

  const setManualLocation = ({ lat, lng, label }) => {
    const nextLocation = normalizeLocation({
      lat,
      lng,
      label,
      source: 'manual',
    })

    setLocation(nextLocation)
    setStatus('manual')
    setError('')
    return nextLocation
  }

  return {
    location,
    status,
    error,
    requestBrowserLocation,
    setManualLocation,
  }
}

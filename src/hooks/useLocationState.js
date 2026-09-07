import { useEffect, useState, useCallback, useRef } from 'react'
import {
  defaultLocation,
  normalizeLocation,
  detectUserLocation,
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

  const [status, setStatus] = useState('idle') // 'idle' | 'detecting' | 'ready' | 'error'
  const isFetchingRef = useRef(false)

  const refreshLocation = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setStatus('detecting')

    try {
      const detected = await detectUserLocation()
      const normalized = normalizeLocation(detected)
      setLocation(normalized)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
      }
      setStatus('ready')
      return normalized
    } catch {
      setStatus('error')
      return location
    } finally {
      isFetchingRef.current = false
    }
  }, [location])

  // Automatically fetch location on mount
  useEffect(() => {
    refreshLocation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Automatically refresh location when network status changes or window regains focus (e.g. VPN toggled)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnlineOrFocus = () => {
      // Debounce slightly to allow VPN tunnel to initialize
      setTimeout(() => {
        refreshLocation()
      }, 500)
    }

    window.addEventListener('online', handleOnlineOrFocus)
    window.addEventListener('focus', handleOnlineOrFocus)

    return () => {
      window.removeEventListener('online', handleOnlineOrFocus)
      window.removeEventListener('focus', handleOnlineOrFocus)
    }
  }, [refreshLocation])

  return {
    location,
    status,
    isDetecting: status === 'detecting',
    refreshLocation,
  }
}

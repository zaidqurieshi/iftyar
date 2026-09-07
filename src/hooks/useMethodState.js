import { useEffect, useState, useCallback } from 'react'
import {
  CALCULATION_METHODS,
  DEFAULT_METHOD_ID,
  getDefaultMethodForCoordinates,
} from '../services/prayerService'

const STORAGE_KEY = 'iftyar.calculationMethod'
const MANUAL_KEY = 'iftyar.calculationMethodManual'

function readStoredMethodId() {
  if (typeof window === 'undefined') {
    return DEFAULT_METHOD_ID
  }

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved && CALCULATION_METHODS.some((method) => method.id === saved)) {
    return saved
  }

  return DEFAULT_METHOD_ID
}

/**
 * Shared, persisted calculation-method selection.
 * Automatically aligns to the user's location (including VPN) if not manually locked,
 * and updates recomputed prayer times immediately.
 */
export function useMethodState(location = null) {
  const [methodId, setMethodIdState] = useState(readStoredMethodId)

  useEffect(() => {
    if (!location || typeof window === 'undefined') return

    const isManual = window.localStorage.getItem(MANUAL_KEY) === 'true'
    if (!isManual && typeof location.lat === 'number' && typeof location.lng === 'number') {
      const recommended = getDefaultMethodForCoordinates(location.lat, location.lng, location.countryCode)
      if (recommended && recommended !== methodId) {
        setMethodIdState(recommended)
        window.localStorage.setItem(STORAGE_KEY, recommended)
      }
    }
  }, [location?.lat, location?.lng, location?.countryCode]) // eslint-disable-line react-hooks/exhaustive-deps

  const setMethodId = useCallback((newId) => {
    setMethodIdState(newId)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, newId)
      window.localStorage.setItem(MANUAL_KEY, 'true')
    }
  }, [])

  return [methodId, setMethodId]
}

import { useEffect, useState } from 'react'
import { CALCULATION_METHODS, DEFAULT_METHOD_ID } from '../services/prayerService'

const STORAGE_KEY = 'iftyar.calculationMethod'

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
 * Changing the returned id immediately recomputes every prayer schedule that
 * depends on it (via useMemo dependencies) and survives reloads/navigation.
 */
export function useMethodState() {
  const [methodId, setMethodId] = useState(readStoredMethodId)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, methodId)
    }
  }, [methodId])

  return [methodId, setMethodId]
}

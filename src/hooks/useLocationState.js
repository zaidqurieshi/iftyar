import { defaultLocation } from '../services/locationService'

export function useLocationState() {
  return {
    location: defaultLocation,
    status: 'ready',
    isDetecting: false,
    refreshLocation: () => Promise.resolve(defaultLocation),
  }
}


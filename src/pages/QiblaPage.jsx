import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import GlassCard from '../components/GlassCard'
import { getQiblaDisplay } from '../services/qiblaService'
import { KaabaIcon, LocationIcon } from '../components/Icons'

function SensoryKaabaIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Central dome with minarets matching reference */}
      <path d="M12 3c-2.2 2-3 4.2-3 6h6c0-1.8-.8-4-3-6Z" fill="currentColor" />
      <path d="M9 9v11h6V9" />
      <path d="M6 10v10" />
      <path d="M18 10v10" />
      <path d="M5 10h2" />
      <path d="M17 10h2" />
      <path d="M11 20v-3a1 1 0 0 1 2 0v3" />
    </svg>
  )
}

export default function QiblaPage({ location }) {
  const [deviceHeading, setDeviceHeading] = useState(null)
  const [, setHasSensorActive] = useState(false)
  const [simulatedAligned, setSimulatedAligned] = useState(false)
  const [permissionState, setPermissionState] = useState(() => {
    if (typeof window === 'undefined') return 'unknown'
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      return 'prompt'
    }
    return 'unknown'
  })
  const [errorMessage, setErrorMessage] = useState('')
  const lastVibratedRef = useRef(0)

  const lat = location?.lat ?? 34.0837
  const lng = location?.lng ?? 74.7973
  const qibla = getQiblaDisplay(lat, lng, deviceHeading)

  const handleOrientation = useCallback((event) => {
    let heading = null

    // iOS Safari provides webkitCompassHeading (0 = Magnetic North, clockwise)
    if (typeof event.webkitCompassHeading === 'number' && !Number.isNaN(event.webkitCompassHeading)) {
      heading = event.webkitCompassHeading
    } else if (event.alpha !== null && typeof event.alpha === 'number' && !Number.isNaN(event.alpha)) {
      // Android: alpha is rotation around z-axis (0 to 360 counter-clockwise)
      heading = (360 - event.alpha) % 360
    }

    if (heading !== null) {
      setDeviceHeading(Math.round(heading))
      setHasSensorActive(true)
      setPermissionState('granted')
    }
  }, [])

  // Check orientation capability on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      return
    }

    if ('ondeviceorientationabsolute' in window || 'ondeviceorientation' in window) {
      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true)
      }
      window.addEventListener('deviceorientation', handleOrientation, true)

      return () => {
        if ('ondeviceorientationabsolute' in window) {
          window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
        }
        window.removeEventListener('deviceorientation', handleOrientation, true)
      }
    }
  }, [handleOrientation])

  const requestCompassPermission = async () => {
    setErrorMessage('')
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        const response = await DeviceOrientationEvent.requestPermission()
        if (response === 'granted') {
          setPermissionState('granted')
          window.addEventListener('deviceorientation', handleOrientation, true)
          return true
        } else {
          setPermissionState('denied')
          setErrorMessage('Compass permission denied. Motion access needed.')
          return false
        }
      } else {
        if ('ondeviceorientationabsolute' in window) {
          window.addEventListener('deviceorientationabsolute', handleOrientation, true)
        }
        window.addEventListener('deviceorientation', handleOrientation, true)
        setPermissionState('granted')
        return true
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to initialize device compass.')
      setPermissionState('denied')
      return false
    }
  }

  // Calculate whether facing Kaaba (within ±5 degrees or simulated)
  const isFacingKaaba =
    simulatedAligned ||
    (deviceHeading !== null &&
      (qibla.relativeHeading <= 5 || qibla.relativeHeading >= 355))

  // Trigger gentle haptic when aligned
  useEffect(() => {
    if (isFacingKaaba) {
      const now = Date.now()
      if (now - lastVibratedRef.current > 3000) {
        lastVibratedRef.current = now
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 60, 40])
        }
      }
    }
  }, [isFacingKaaba])

  const handleAlignClick = async () => {
    if (permissionState === 'prompt') {
      const granted = await requestCompassPermission()
      if (!granted) {
        setSimulatedAligned((prev) => !prev)
      }
    } else {
      setSimulatedAligned((prev) => !prev)
    }
  }

  // Needles and dials rotation
  const dialRotation = simulatedAligned
    ? -qibla.bearing
    : deviceHeading !== null
      ? -deviceHeading
      : 0

  const needleRotation = simulatedAligned
    ? 0
    : deviceHeading !== null
      ? qibla.relativeHeading
      : qibla.bearing

  // Distance to Mecca in km
  const meccaLat = 21.422487
  const meccaLng = 39.826206
  const toRad = (v) => (v * Math.PI) / 180
  const dLat = toRad(meccaLat - lat)
  const dLng = toRad(meccaLng - lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat)) * Math.cos(toRad(meccaLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanceKm = Math.round(6371 * c)

  return (
    <div className="page-stack">
      <GlassCard className="panel-card qibla-card" static>
        {/* Sensory Compass Header (matching reference image) */}
        <div className="qibla-header">
          <span className="qibla-eyebrow">QIBLA</span>
          <h2 className="qibla-title">Sensory Compass</h2>
        </div>

        {/* Compass Dial Wrap */}
        <div className="compass-dial-wrap">
          <div className="compass-outer-rim" />

          {/* Compass Dial Degree Ring (Rotates so N aligns with physical North) */}
          <motion.svg
            width="270"
            height="270"
            viewBox="0 0 270 270"
            style={{ position: 'absolute', inset: 0 }}
            animate={{ rotate: dialRotation }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <circle cx="135" cy="135" r="122" fill="none" stroke="rgba(34, 197, 94, 0.22)" strokeWidth="1" />
            <circle cx="135" cy="135" r="98" fill="none" stroke="rgba(34, 197, 94, 0.16)" strokeWidth="1" strokeDasharray="3 4" />

            {/* Cardinal Markers */}
            <text x="135" y="28" textAnchor="middle" fill="#22c55e" fontSize="13" fontWeight="700">N</text>
            <text x="246" y="139" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">E</text>
            <text x="135" y="250" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">S</text>
            <text x="24" y="139" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">W</text>
          </motion.svg>

          {/* Compass Needle (Rotates to Qibla Pointer) */}
          <motion.div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
            animate={{ rotate: needleRotation }}
            transition={{ type: 'spring', damping: 22, stiffness: 120 }}
          >
            <svg width="270" height="270" viewBox="0 0 270 270">
              <defs>
                <linearGradient id="emeraldBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                <linearGradient id="tailBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(34, 197, 94, 0.35)" />
                  <stop offset="100%" stopColor="rgba(10, 25, 15, 0.05)" />
                </linearGradient>
                <filter id="emeraldGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Glowing Emerald North/Qibla Pointer Beam */}
              <rect
                x="131"
                y="36"
                width="8"
                height="99"
                rx="4"
                fill="url(#emeraldBeamGrad)"
                filter="url(#emeraldGlow)"
              />

              {/* Dark Translucent Counter-weight Tail */}
              <rect
                x="131"
                y="135"
                width="8"
                height="72"
                rx="4"
                fill="url(#tailBeamGrad)"
              />
            </svg>
          </motion.div>

          {/* Center Amber/Gold Badge with Kaaba/Mosque Icon (ALWAYS visible, illuminates when matched) */}
          <motion.div
            className={`qibla-center-badge ${isFacingKaaba ? 'qibla-center-badge--matched' : ''}`}
            animate={{
              scale: isFacingKaaba ? [1, 1.1, 1] : 1,
            }}
            transition={{
              repeat: isFacingKaaba ? Infinity : 0,
              duration: 1.6,
              ease: 'easeInOut',
            }}
          >
            <SensoryKaabaIcon size={19} />
          </motion.div>
        </div>

        {/* Alignment Action / Status Button */}
        <button
          type="button"
          className={`qibla-status-btn ${isFacingKaaba ? 'qibla-status-btn--aligned' : ''}`}
          onClick={handleAlignClick}
        >
          {isFacingKaaba ? 'FACING KAABA' : 'TURN TO ALIGN'}
        </button>

        {/* Footnote */}
        <p className="qibla-footnote">
          Simulates the magnetometer. Vibrates gently on your phone when perfectly aligned.
        </p>

        {errorMessage && (
          <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: '0.5rem' }}>
            {errorMessage}
          </p>
        )}

        {/* Informational Readouts */}
        <div className="fasting-meta-grid" style={{ marginTop: '2rem', width: '100%' }}>
          <div className="fasting-meta-card">
            <div className="fasting-meta-icon fasting-meta-icon--gold">
              <KaabaIcon size={22} />
            </div>
            <div className="fasting-meta-info">
              <span className="eyebrow">Destination</span>
              <strong className="fasting-meta-time" style={{ fontSize: '0.95rem' }}>Makkah Al-Mukarramah</strong>
            </div>
          </div>

          <div className="fasting-meta-card">
            <div className="fasting-meta-icon">
              <LocationIcon size={20} />
            </div>
            <div className="fasting-meta-info">
              <span className="eyebrow">Distance &amp; Bearing</span>
              <strong className="fasting-meta-time" style={{ fontSize: '0.95rem' }}>
                {distanceKm.toLocaleString()} km • {Math.round(qibla.bearing)}° ({qibla.direction})
              </strong>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

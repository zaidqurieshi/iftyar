import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import GlassCard from '../components/GlassCard'
import { getQiblaDisplay } from '../services/qiblaService'
import { KaabaIcon, LocationIcon, CompassIcon } from '../components/Icons'

export default function QiblaPage({ location }) {
  const [deviceHeading, setDeviceHeading] = useState(null)
  const [hasSensorActive, setHasSensorActive] = useState(false)
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

    // On iOS 13+, orientation requires user gesture via requestCompassPermission
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
        } else {
          setPermissionState('denied')
          setErrorMessage('Compass permission was denied. Please allow motion & orientation access in your device settings.')
        }
      } else {
        // Fallback or Android manual trigger
        if ('ondeviceorientationabsolute' in window) {
          window.addEventListener('deviceorientationabsolute', handleOrientation, true)
        }
        window.addEventListener('deviceorientation', handleOrientation, true)
        setPermissionState('granted')
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to initialize device compass.')
      setPermissionState('denied')
    }
  }

  // Calculate whether currently facing Kaaba (within ±5 degrees)
  const isFacingKaaba =
    deviceHeading !== null &&
    (qibla.relativeHeading <= 5 || qibla.relativeHeading >= 355)

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

  // Needles and dials rotation
  // Outer compass rose rotates with -deviceHeading so 'N' points towards physical North
  const dialRotation = deviceHeading !== null ? -deviceHeading : 0
  // Needle points towards Kaaba: relativeHeading on live compass, or bearing if static
  const needleRotation = deviceHeading !== null ? qibla.relativeHeading : qibla.bearing

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
      <GlassCard className="panel-card qibla-card">
        <div className="hero-card__header" style={{ width: '100%', marginBottom: '0.5rem' }}>
          <div>
            <span className="eyebrow eyebrow--gold">Kaaba Finder</span>
            <h2 style={{ fontSize: '1.6rem' }}>Qibla Direction</h2>
          </div>
          <span className="chip chip--gold">
            Makkah: {distanceKm.toLocaleString()} km
          </span>
        </div>

        <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', margin: '0.5rem 0 1rem' }}>
          {hasSensorActive
            ? 'Rotate your phone until the golden arrow points straight up.'
            : `Face ${qibla.direction} (${Math.round(qibla.bearing)}°) towards Makkah al-Mukarramah.`}
        </p>

        {/* Alignment Status Banner */}
        <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            {isFacingKaaba ? (
              <motion.div
                key="aligned"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="chip chip--emerald"
                style={{
                  padding: '0.35rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  boxShadow: '0 0 16px rgba(52, 211, 153, 0.4)',
                }}
              >
                ✦ Facing Kaaba ✦
              </motion.div>
            ) : hasSensorActive ? (
              <motion.span
                key="heading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}
              >
                Device Heading: {deviceHeading}° ({qibla.direction})
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Animated Compass Dial */}
        <div className="compass-dial-wrap">
          <div className="compass-outer-rim" />

          {/* Compass Dial Degree Ring (Rotates so N aligns with physical North) */}
          <motion.svg
            width="260"
            height="260"
            viewBox="0 0 260 260"
            style={{ position: 'absolute', inset: 0 }}
            animate={{ rotate: dialRotation }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <defs>
              <linearGradient id="qiblaRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f6d268" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            <circle cx="130" cy="130" r="115" fill="none" stroke="url(#qiblaRingGrad)" strokeWidth="1" />
            <circle cx="130" cy="130" r="95" fill="none" stroke="rgba(52, 211, 153, 0.08)" strokeWidth="1" strokeDasharray="3 5" />

            {/* Cardinal Markers */}
            <text x="130" y="28" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="700" letterSpacing="0.1em">N</text>
            <text x="238" y="134" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontWeight="600">E</text>
            <text x="130" y="244" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontWeight="600">S</text>
            <text x="22" y="134" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontWeight="600">W</text>
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
            }}
            animate={{ rotate: needleRotation }}
            transition={{ type: 'spring', damping: 22, stiffness: 120 }}
          >
            {/* Pointer to Kaaba */}
            <svg width="260" height="260" viewBox="0 0 260 260">
              {/* North / Kaaba Arrow (Golden) */}
              <polygon
                points="130,22 140,120 130,110 120,120"
                fill="url(#goldGradNeedle)"
                filter={isFacingKaaba ? 'drop-shadow(0 0 14px rgba(246, 210, 104, 0.9))' : 'drop-shadow(0 0 8px rgba(246, 210, 104, 0.6))'}
              />
              {/* South Counter-weight (Dark Emerald) */}
              <polygon
                points="130,238 138,140 130,150 122,140"
                fill="rgba(52, 211, 153, 0.35)"
              />
              <defs>
                <linearGradient id="goldGradNeedle" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#faebba" />
                  <stop offset="50%" stopColor="#f6d268" />
                  <stop offset="100%" stopColor="#b8860b" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Center Hub Pin */}
          <div className="compass-center-pin" />
        </div>

        {/* Readout Metrics */}
        <div className="qibla-readout">
          <span className="qibla-bearing-num">{Math.round(qibla.bearing)}°</span>
          <span className="qibla-direction-label">
            Bearing towards Kaaba ({qibla.direction})
          </span>
        </div>

        {/* Activate / Calibrate Button (shown when sensor not yet reading or iOS needs tap) */}
        {!hasSensorActive && (
          <div style={{ marginTop: '1.25rem', width: '100%', maxWidth: '20rem' }}>
            <button
              type="button"
              className="calendar-action-btn"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={requestCompassPermission}
            >
              <CompassIcon size={18} />
              <span>{permissionState === 'prompt' ? 'Enable Live Compass' : 'Calibrate Device Compass'}</span>
            </button>
            {errorMessage && (
              <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: '0.5rem' }}>
                {errorMessage}
              </p>
            )}
          </div>
        )}

        <div className="fasting-meta-grid" style={{ marginTop: '1.5rem' }}>
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
              <span className="eyebrow">Distance</span>
              <strong className="fasting-meta-time" style={{ fontSize: '0.95rem' }}>{distanceKm.toLocaleString()} km</strong>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

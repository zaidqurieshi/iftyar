import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import GlassCard from '../components/GlassCard'
import { getQiblaDisplay } from '../services/qiblaService'
import { KaabaIcon, LocationIcon } from '../components/Icons'

export default function QiblaPage({ location }) {
  const [deviceHeading, setDeviceHeading] = useState(null)
  const [hasCompassSupport, setHasCompassSupport] = useState(false)

  const lat = location?.lat ?? 34.0837
  const lng = location?.lng ?? 74.7973
  const qibla = getQiblaDisplay(lat, lng, deviceHeading)

  useEffect(() => {
    const handleOrientation = (e) => {
      // webkitCompassHeading for iOS Safari, alpha for Android
      let heading = null
      if (e.webkitCompassHeading !== undefined) {
        heading = e.webkitCompassHeading
      } else if (e.alpha !== null) {
        heading = 360 - e.alpha
      }

      if (heading !== null) {
        setDeviceHeading(heading)
        setHasCompassSupport(true)
      }
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true)
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation, true)
      }
    }
  }, [])

  const needleRotation = deviceHeading !== null ? qibla.relativeHeading : qibla.bearing

  // Approximate distance to Mecca in km using Haversine formula
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
            {location?.label || 'Your Location'}
          </span>
        </div>

        <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', margin: '0.5rem 0 1.25rem' }}>
          {hasCompassSupport
            ? 'Align your device with the golden pointer facing the Kaaba.'
            : `Face ${qibla.direction} (${Math.round(qibla.bearing)}°) towards Mecca.`}
        </p>

        {/* Animated Compass Dial */}
        <div className="compass-dial-wrap">
          <div className="compass-outer-rim" />

          {/* Compass Dial Degree Ring */}
          <svg width="260" height="260" viewBox="0 0 260 260" style={{ position: 'absolute', inset: 0 }}>
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
          </svg>

          {/* Compass Needle (Rotates to Qibla Bearing) */}
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
                points="130,24 139,120 130,110 121,120"
                fill="url(#goldGradNeedle)"
                filter="drop-shadow(0 0 8px rgba(246, 210, 104, 0.6))"
              />
              {/* South Counter-weight (Dark Emerald) */}
              <polygon
                points="130,236 137,140 130,150 123,140"
                fill="rgba(52, 211, 153, 0.3)"
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

        <div className="fasting-meta-grid" style={{ marginTop: '1.25rem' }}>
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


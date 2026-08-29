import { useEffect, useMemo, useState } from 'react'
import GlassCard from '../components/GlassCard'
import { calculateQiblaBearing, formatBearingText, getQiblaDisplay } from '../services/qiblaService'

function QiblaPage({ location }) {
  const [heading, setHeading] = useState(null)
  const orientationSupported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window

  useEffect(() => {
    if (!orientationSupported) {
      return undefined
    }

    const onOrientation = (event) => {
      const alpha = event?.webkitCompassHeading ?? event?.alpha
      if (typeof alpha === 'number') {
        setHeading((alpha + 360) % 360)
      }
    }

    const requestPermission = async () => {
      try {
        if (
          typeof DeviceOrientationEvent !== 'undefined' &&
          typeof DeviceOrientationEvent.requestPermission === 'function'
        ) {
          const permission = await DeviceOrientationEvent.requestPermission()
          if (permission !== 'granted') {
            return
          }
        }

        window.addEventListener('deviceorientation', onOrientation)
      } catch {
        // Gracefully fall back when the browser blocks device orientation access.
      }
    }

    requestPermission()

    return () => {
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }, [orientationSupported])

  const qiblaInfo = useMemo(() => getQiblaDisplay(location.lat, location.lng, heading), [location.lat, location.lng, heading])
  const relativeBearing = heading === null ? null : ((qiblaInfo.bearing - heading + 360) % 360)
  const rotateDegrees = relativeBearing === null ? 0 : (360 - relativeBearing)

  return (
    <div className="page-stack">
      <GlassCard className="qibla-card">
        <div className="qibla-card__header">
          <div>
            <p className="eyebrow">Qibla</p>
            <h2>Direction to the Kaaba</h2>
          </div>
        </div>

        <div className="compass-wrap" aria-live="polite">
          <div className="compass" style={{ transform: `rotate(${rotateDegrees}deg)` }}>
            <div className="compass__ring" />
            <div className="compass__needle" aria-hidden="true" />
            <div className="compass__center" aria-hidden="true" />
            <div className="compass__caption">Q</div>
          </div>
        </div>

        <div className="qibla-meta">
          <div>
            <p className="eyebrow">Bearing</p>
            <p className="meta-value">{formatBearingText(qiblaInfo.bearing)}</p>
          </div>
          <div>
            <p className="eyebrow">Device heading</p>
            <p className="meta-value">{heading === null ? 'Unavailable' : `${Math.round(heading)}°`}</p>
          </div>
        </div>

        <p className="supporting-copy">
          {orientationSupported
            ? 'Use your device orientation to align the compass to the Kaaba.'
            : 'Orientation is not available on this device or browser. The bearing below still shows the correct Kaaba direction for manual use.'}
        </p>
      </GlassCard>

      <GlassCard className="panel-card">
        <p className="eyebrow">Calculation</p>
        <p className="supporting-copy">
          Bearing result for your current coordinates: {formatBearingText(calculateQiblaBearing(location.lat, location.lng))}
        </p>
      </GlassCard>
    </div>
  )
}

export default QiblaPage

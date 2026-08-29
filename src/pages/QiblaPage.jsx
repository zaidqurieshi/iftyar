import { useEffect, useMemo, useState } from 'react'
import GlassCard from '../components/GlassCard'
import { calculateQiblaBearing, formatBearingText, getQiblaDisplay } from '../services/qiblaService'

function QiblaPage({ location }) {
  const [heading, setHeading] = useState(null)
  const [compassPermission, setCompassPermission] = useState('checking')
  const orientationSupported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window

  useEffect(() => {
    if (!orientationSupported) {
      setCompassPermission('unsupported')
      return undefined
    }

    const onOrientation = (event) => {
      const alpha = event?.webkitCompassHeading ?? event?.alpha
      if (typeof alpha === 'number') {
        setHeading((alpha + 360) % 360)
      }
    }

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      setCompassPermission('prompt')
      return undefined
    }

    window.addEventListener('deviceorientation', onOrientation, true)
    setCompassPermission('granted')

    return () => {
      window.removeEventListener('deviceorientation', onOrientation, true)
    }
  }, [orientationSupported])

  const enableCompass = async () => {
    if (!orientationSupported) {
      setCompassPermission('unsupported')
      return
    }

    const onOrientation = (event) => {
      const alpha = event?.webkitCompassHeading ?? event?.alpha
      if (typeof alpha === 'number') {
        setHeading((alpha + 360) % 360)
      }
    }

    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission !== 'granted') {
          setCompassPermission('denied')
          return
        }
      }

      window.addEventListener('deviceorientation', onOrientation, true)
      setCompassPermission('granted')
    } catch {
      setCompassPermission('denied')
    }
  }

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
            <p className="meta-value">{heading === null ? 'Waiting…' : `${Math.round(heading)}°`}</p>
          </div>
        </div>

        {orientationSupported && compassPermission !== 'granted' && (
          <button type="button" className="action-button action-button--secondary" onClick={enableCompass}>
            {compassPermission === 'denied' ? 'Allow compass access' : 'Enable compass'}
          </button>
        )}

        <p className="supporting-copy">
          {compassPermission === 'granted'
            ? 'Your compass is active. Hold your phone level and turn until the needle points to the Kaaba.'
            : compassPermission === 'denied'
              ? 'Compass access was blocked. Please allow motion & orientation access to use the live Qibla compass.'
              : orientationSupported
                ? 'Allow access to your phone sensors to use the live Qibla compass.'
                : 'Orientation is not available on this device or browser. The bearing still shows the correct Kaaba direction for manual use.'}
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

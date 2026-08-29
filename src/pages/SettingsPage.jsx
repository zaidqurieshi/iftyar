import { useState } from 'react'
import GlassCard from '../components/GlassCard'

function SettingsPage({ location, onUpdateLocation, locationStatus, onBrowserLocation, locationError }) {
  const [manualLat, setManualLat] = useState(String(location.lat))
  const [manualLng, setManualLng] = useState(String(location.lng))
  const [manualLabel, setManualLabel] = useState(location.label)

  const handleManualSubmit = (event) => {
    event.preventDefault()
    onUpdateLocation({
      lat: Number(manualLat),
      lng: Number(manualLng),
      label: manualLabel || 'Custom location',
    })
  }

  const readableStatus =
    locationStatus === 'ready'
      ? 'Using current device location'
      : locationStatus === 'loading'
        ? 'Requesting current location...'
        : locationStatus === 'manual'
          ? 'Using manual location'
          : 'Location status unknown'

  return (
    <div className="page-stack">
      <GlassCard className="panel-card">
        <div className="section-head">
          <h2>Settings</h2>
          <span className="section-pill">{readableStatus}</span>
        </div>

        <div className="settings-list">
          <button type="button" className="action-button" onClick={onBrowserLocation}>
            Use current location
          </button>
          <p className="supporting-copy">
            {locationError || 'Location is requested from the device and used for prayer calculation.'}
          </p>
        </div>
      </GlassCard>

      <GlassCard className="panel-card">
        <h3>Manual location</h3>
        <form className="manual-form" onSubmit={handleManualSubmit}>
          <label>
            <span>Location name</span>
            <input
              type="text"
              value={manualLabel}
              onChange={(event) => setManualLabel(event.target.value)}
              placeholder="Example: London"
            />
          </label>
          <div className="manual-form__grid">
            <label>
              <span>Latitude</span>
              <input
                type="number"
                step="0.0001"
                value={manualLat}
                onChange={(event) => setManualLat(event.target.value)}
              />
            </label>
            <label>
              <span>Longitude</span>
              <input
                type="number"
                step="0.0001"
                value={manualLng}
                onChange={(event) => setManualLng(event.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="action-button action-button--secondary">
            Save location
          </button>
        </form>
      </GlassCard>
    </div>
  )
}

export default SettingsPage

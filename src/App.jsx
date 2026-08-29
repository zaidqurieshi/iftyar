import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import HomePage from './pages/HomePage'
import QiblaPage from './pages/QiblaPage'
import PrayerTimesPage from './pages/PrayerTimesPage'
import SettingsPage from './pages/SettingsPage'
import { useLocationState } from './hooks/useLocationState'
import './App.css'

function App() {
  const { location, status, error, requestBrowserLocation, setManualLocation } = useLocationState()

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage location={location} />} />
        <Route path="/qibla" element={<QiblaPage location={location} />} />
        <Route path="/prayer-times" element={<PrayerTimesPage location={location} />} />
        <Route
          path="/settings"
          element={
            <SettingsPage
              location={location}
              locationStatus={status}
              locationError={error}
              onBrowserLocation={requestBrowserLocation}
              onUpdateLocation={setManualLocation}
            />
          }
        />
      </Route>
    </Routes>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import HomePage from './pages/HomePage'
import PrayerTimesPage from './pages/PrayerTimesPage'
import ZikrPage from './pages/ZikrPage'
import { useLocationState } from './hooks/useLocationState'
import './App.css'

function App() {
  const { location } = useLocationState()

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage location={location} />} />
        <Route path="/prayer-times" element={<PrayerTimesPage location={location} />} />
<Route path="/zikr" element={<ZikrPage />} />
      </Route>
    </Routes>
  )
}

export default App

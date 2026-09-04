import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  return (
    <div className="app-shell">
      <div className="app-shell__inner">
        <header className="topbar" aria-label="Iftyar header">
          <div className="brand-block">
            <span className="brand-block__mark">I</span>
            <div>
              <h1 className="brand-title">Iftyar</h1>
              <p className="brand-subtitle">A quiet rhythm for every day</p>
            </div>
          </div>
          <div className="topbar__status" aria-label="Current prayer profile">
            <span className="topbar__status-dot" />
            <span>Raheemiya · Srinagar</span>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
<footer className="app-footer">
          Made by Sentinel
        </footer>
      </div>

      <BottomNav />
    </div>
  )
}

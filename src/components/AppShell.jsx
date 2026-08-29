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
            </div>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
<footer className="app-footer">
          Made by Sentinel - Remember Me and My parents in your prayers.
        </footer>
      </div>

      <BottomNav />
    </div>
  )
}

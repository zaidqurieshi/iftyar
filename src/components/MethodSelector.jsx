import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CALCULATION_METHODS } from '../services/prayerService'
import GlassCard from './GlassCard'

export default function MethodSelector({ selectedMethod, onMethodChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const currentMethod = CALCULATION_METHODS.find((method) => method.id === selectedMethod) || CALCULATION_METHODS[0]

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const sourceLabel = (method) =>
    method.source === 'iftarkar-table' ? 'Local Timetable' : 'Astronomical (Adhan)'

  return (
    <GlassCard className="method-selector-card" static>
      <div ref={containerRef}>
        <button
          type="button"
          className="method-selector-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="method-selector-info">
            <span className="eyebrow eyebrow--emerald">Calculation Method & Fiqah</span>
            <span className="method-selector-name">
              {currentMethod.school} ({currentMethod.name})
            </span>
            <span className="method-selector-sub">
              {currentMethod.region} • {sourceLabel(currentMethod)}
            </span>
          </div>

          <motion.div
            className="method-selector-icon-wrap"
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="method-dropdown"
              className="method-dropdown-panel"
              role="listbox"
              aria-label="Calculation method"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {CALCULATION_METHODS.map((method) => {
                const isSelected = method.id === selectedMethod
                return (
                  <button
                    key={method.id}
                    type="button"
                    className={`method-item-option ${isSelected ? 'method-item-option--active' : ''}`}
                    onClick={() => {
                      onMethodChange(method.id)
                      setIsOpen(false)
                    }}
                    role="option"
                    aria-selected={isSelected}
                    title={method.description}
                  >
                    <div className="method-selector-info">
                      <span className="method-selector-name">{method.name}</span>
                      <span className="method-selector-sub">
                        {[method.school, sourceLabel(method)].filter(Boolean).join(' • ')}
                      </span>
                      <span className="eyebrow" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>
                        {method.region}
                      </span>
                    </div>

                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="chip"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                      >
                        Active ✓
                      </motion.span>
                    )}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}

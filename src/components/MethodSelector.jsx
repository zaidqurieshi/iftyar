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
    method.source === 'iftarkar-table' ? 'iftarkar.com timetable' : 'Astronomical (Adhan)'

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
            ⚙️
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

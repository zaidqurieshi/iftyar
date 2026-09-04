import { useEffect, useRef, useState } from 'react'
import { CALCULATION_METHODS } from '../services/prayerService'
import GlassCard from './GlassCard'

export default function MethodSelector({ selectedMethod, onMethodChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const currentMethod = CALCULATION_METHODS.find((method) => method.id === selectedMethod) || CALCULATION_METHODS[0]

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const sourceLabel = (method) => (
    method.source === 'iftarkar-table' ? 'iftarkar.com timetable' : 'Astronomical (Adhan)'
  )

  return (
    <GlassCard className="method-selector-card">
      <div ref={containerRef}>
        <button
          type="button"
          className="method-selector__button"
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="method-selector__label">
            <p className="eyebrow">Calculation Method</p>
            <p className="method-selector__text">
              {currentMethod.school} ({currentMethod.name}) — {currentMethod.region}
            </p>
          </div>
          <span className="method-selector__icon">⚙️</span>
        </button>

        <div id="method-dropdown" className={`method-dropdown ${isOpen ? 'method-dropdown--open' : ''}`}>
          <div className="method-dropdown__list" role="listbox" aria-label="Calculation method">
            {CALCULATION_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                className={`method-dropdown__item ${method.id === selectedMethod ? 'method-dropdown__item--active' : ''}`}
                onClick={() => {
                  onMethodChange(method.id)
                  setIsOpen(false)
                }}
                role="option"
                aria-selected={method.id === selectedMethod}
                title={method.description}
              >
                <div className="method-dropdown__item-content">
                  <p className="method-dropdown__item-name">{method.name}</p>
                  <p className="method-dropdown__item-desc">
                    {[method.school, sourceLabel(method)].filter(Boolean).join(' • ')}
                  </p>
                  <p className="method-dropdown__item-region">{method.region}</p>
                </div>
                {method.id === selectedMethod && <span className="method-dropdown__checkmark">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

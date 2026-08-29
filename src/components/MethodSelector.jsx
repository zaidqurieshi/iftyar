import { CALCULATION_METHODS } from '../services/prayerService'
import GlassCard from './GlassCard'

export default function MethodSelector({ selectedMethod, onMethodChange }) {
  const currentMethod = CALCULATION_METHODS.find((m) => m.id === selectedMethod)

  return (
    <GlassCard className="method-selector-card">
      <button
        className="method-selector__button"
        onClick={() => {
          // Toggle dropdown visibility through parent or inline
          const dropdown = document.getElementById('method-dropdown')
          if (dropdown) {
            dropdown.classList.toggle('method-dropdown--open')
          }
        }}
        aria-haspopup="listbox"
        aria-expanded="false"
      >
        <div className="method-selector__label">
          <p className="eyebrow">Calculation Method</p>
          <p className="method-selector__text">
            {currentMethod?.school} ({currentMethod?.name}) - {currentMethod?.region}
          </p>
        </div>
        <span className="method-selector__icon">⚙️</span>
      </button>

      <div id="method-dropdown" className="method-dropdown">
        <div className="method-dropdown__list" role="listbox">
          {CALCULATION_METHODS.map((method) => (
            <button
              key={method.id}
              className={`method-dropdown__item ${method.id === selectedMethod ? 'method-dropdown__item--active' : ''}`}
              onClick={() => {
                onMethodChange(method.id)
                document.getElementById('method-dropdown')?.classList.remove('method-dropdown--open')
              }}
              role="option"
              aria-selected={method.id === selectedMethod}
            >
              <div className="method-dropdown__item-content">
                <p className="method-dropdown__item-name">{method.school}</p>
                <p className="method-dropdown__item-desc">{method.name}</p>
                <p className="method-dropdown__item-region">{method.region}</p>
              </div>
              {method.id === selectedMethod && <span className="method-dropdown__checkmark">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}

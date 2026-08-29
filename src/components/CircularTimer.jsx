export default function CircularTimer({ hours, minutes, seconds, totalSeconds, currentSeconds, label }) {
  const safeTotalSeconds = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 1
  const safeCurrentSeconds = Number.isFinite(currentSeconds) ? Math.max(0, currentSeconds) : 0
  const progress = Math.max(0, Math.min(100, (safeCurrentSeconds / safeTotalSeconds) * 100))

  return (
    <div className="circular-timer">
      <div className="circular-timer__content">
        {label ? <p className="circular-timer__label">{label}</p> : null}
        <div className="circular-timer__time">
          <span>{String(hours).padStart(2, '0')}</span>
          <span>:</span>
          <span>{String(minutes).padStart(2, '0')}</span>
          <span>:</span>
          <span>{String(seconds).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="circular-timer__bar-wrap">
        <div className="circular-timer__bar-bg">
          <div
            className="circular-timer__bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="circular-timer__percentage">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

export default function CircularTimer({ hours, minutes, seconds, totalSeconds = 1, currentSeconds = 0, label }) {
  // Ensure we always have a positive total to avoid division by zero
  const safeTotal = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 1;
  const safeCurrent = Number.isFinite(currentSeconds) && currentSeconds >= 0 ? currentSeconds : 0;
  const progress = Math.min(100, Math.max(0, (safeCurrent / safeTotal) * 100));

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
  );
}

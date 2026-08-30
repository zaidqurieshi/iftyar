import React from 'react';

/**
 * CircularTimer component replicates the timer UI from iftarkar.com.
 * It displays the remaining time (hours, minutes, seconds) and a circular
 * progress indicator representing the elapsed portion of the fasting period.
 * Props:
 *   - hours, minutes, seconds: current countdown values.
 *   - totalSeconds: total duration of the period (Sehri to Iftar) in seconds.
 *   - currentSeconds: elapsed seconds since Sehri. If not provided, defaults to 0.
 *   - label (optional): a label to show above the timer.
 */
export default function CircularTimer({
  hours,
  minutes,
  seconds,
  label,
}) {
  // Combine time parts into a string
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="circular-timer" style={{ textAlign: 'center', width: '100%' }}>
      {label && <p className="circular-timer__label" style={{ marginBottom: '0.4rem', fontSize: '1rem' }}>{label}</p>}
      <p className="circular-timer__time-text" style={{ fontSize: '3rem', fontWeight: '600', color: '#bcefcf', margin: 0 }}>
        {timeString}
      </p>
    </div>
  );
}


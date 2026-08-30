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
  totalSeconds = 0,
  currentSeconds = 0,
  label,
}) {
  // Guard against division by zero
  const progress = totalSeconds > 0 ? Math.min(Math.max(currentSeconds / totalSeconds, 0), 1) : 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <div className="circular-timer" style={{ width: '120px', height: '120px', position: 'relative' }}>
      {label && <p className="circular-timer__label" style={{ textAlign: 'center', marginBottom: '0.4rem' }}>{label}</p>}
      <svg
        className="circular-timer__svg"
        width="120"
        height="120"
        viewBox="0 0 120 120"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e0e0e0"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="circular-timer__progress-circle"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#76DD99" />
            <stop offset="100%" stopColor="#5CB88A" />
          </linearGradient>
        </defs>
        {/* Time text */}
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dy="0.3em"
          className="circular-timer__time-text"
          style={{ fontSize: '1.2rem', fill: '#bcefcf', fontFamily: 'inherit' }}
        >
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </text>
      </svg>
    </div>
  );
}


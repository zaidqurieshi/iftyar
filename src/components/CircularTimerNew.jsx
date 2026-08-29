import React from 'react';

// Simple timer component – shows only the time text with a larger font.
// The circular SVG bar has been removed as it was not working.
export default function CircularTimer({ hours, minutes, seconds, label }) {
  return (
    <div className="simple-timer">
      {label && <p className="simple-timer__label">{label}</p>}
      <p className="simple-timer__time">
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
    </div>
  );
}

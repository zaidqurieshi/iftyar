/*
export default function CircularTimer({ hours, minutes, seconds, totalSeconds = 1, currentSeconds = 0, label }) {
  // Ensure we always have a positive total to avoid division by zero
  const safeTotal = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 1;
  const safeCurrent = Number.isFinite(currentSeconds) && currentSeconds >= 0 ? currentSeconds : 0;
  const progress = Math.min(100, Math.max(0, (safeCurrent / safeTotal) * 100));

  // SVG circle calculations for a smooth circular progress bar
  const radius = 54; // radius of the circle (half of viewBox minus stroke width)
  const stroke = 4; // stroke width
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="circular-timer">
      {/* optional label above the timer */}
      {label && <p className="circular-timer__label">{label}</p>}

      {/* central SVG with circular progress */}
      <svg
        className="circular-timer__svg"
        height="120"
        width="120"
        viewBox="0 0 120 120"
        aria-label="timer progress"
      >
        {/* background circle */}
        <circle
          stroke="rgba(255,255,255,0.1)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="60"
          cy="60"
        />
        {/* progress circle */}
        <circle
          className="circular-timer__progress-circle"
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx="60"
          cy="60"
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: dashOffset,
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
        {/* gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#76DD99" />
            <stop offset="100%" stopColor="#5CB88A" />
          </linearGradient>
        </defs>
        {/* time text in the centre */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="circular-timer__time-text"
        >
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </text>
      </svg>

      {/* percentage displayed at the bottom right of the circle */}
      <div className="circular-timer__percentage-wrap">
        <span className="circular-timer__percentage">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

  // Ensure we always have a positive total to avoid division by zero
  const safeTotal = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 1;
  const safeCurrent = Number.isFinite(currentSeconds) && currentSeconds >= 0 ? currentSeconds : 0;
  const progress = Math.min(100, Math.max(0, (safeCurrent / safeTotal) * 100));
+
+  // SVG circle calculations for a smooth circular progress bar
+  const radius = 54; // radius of the circle (half of viewBox minus stroke width)
+  const stroke = 4; // stroke width
+  const normalizedRadius = radius - stroke * 2;
+  const circumference = normalizedRadius * 2 * Math.PI;
+  const dashOffset = circumference - (progress / 100) * circumference;
+
+  return (
+    <div className="circular-timer">
+      {/* optional label above the timer */}
+      {label && <p className="circular-timer__label">{label}</p>}
+
+      {/* central SVG with circular progress */}
+      <svg
+        className="circular-timer__svg"
+        height="120"
+        width="120"
+        viewBox="0 0 120 120"
+        aria-label="timer progress"
+      >
+        {/* background circle */}
+        <circle
+          stroke="rgba(255,255,255,0.1)"
+          fill="transparent"
+          strokeWidth={stroke}
+          r={normalizedRadius}
+          cx="60"
+          cy="60"
+        />
+        {/* progress circle */}
+        <circle
+          className="circular-timer__progress-circle"
+          stroke="url(#gradient)"
+          fill="transparent"
+          strokeWidth={stroke}
+          strokeLinecap="round"
+          r={normalizedRadius}
+          cx="60"
+          cy="60"
+          style={{
+            strokeDasharray: `${circumference} ${circumference}`,
+            strokeDashoffset: dashOffset,
+            transition: 'stroke-dashoffset 0.5s ease',
+          }}
+        />
+        {/* gradient definition */}
+        <defs>
+          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
+            <stop offset="0%" stopColor="#76DD99" />
+            <stop offset="100%" stopColor="#5CB88A" />
+          </linearGradient>
+        </defs>
+        {/* time text in the centre */}
+        <text
+          x="50%"
+          y="50%"
+          dominantBaseline="middle"
+          textAnchor="middle"
+          className="circular-timer__time-text"
+        >
+          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
+        </text>
+      </svg>
+
+      {/* percentage displayed at the bottom right of the circle */}
+      <div className="circular-timer__percentage-wrap">
+        <span className="circular-timer__percentage">{Math.round(progress)}%</span>
+      </div>
+    </div>
+  );
+}
*/
export { default } from './CircularTimerNew';


export function HomeIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export function PrayerIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Mosque Dome and Minaret Arch */}
      <path d="M12 2c-3.5 3-4 6.5-4 9v9h8v-9c0-2.5-.5-6-4-9z" />
      <path d="M10 20v-4a2 2 0 1 1 4 0v4" />
      <path d="M4 11v9h4" />
      <path d="M16 20h4v-9" />
      <path d="M6 11c0-2 1.5-3 2-3" />
      <path d="M16 8c.5 0 2 1 2 3" />
    </svg>
  )
}

export function TasbihIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Prayer Beads Loop */}
      <circle cx="12" cy="5" r="1.6" fill="currentColor" />
      <circle cx="16.5" cy="6.8" r="1.6" fill="currentColor" />
      <circle cx="19" cy="10.5" r="1.6" fill="currentColor" />
      <circle cx="18.5" cy="15" r="1.6" fill="currentColor" />
      <circle cx="15.5" cy="18.5" r="1.6" fill="currentColor" />
      <circle cx="12" cy="19.5" r="1.6" fill="currentColor" />
      <circle cx="8.5" cy="18.5" r="1.6" fill="currentColor" />
      <circle cx="5.5" cy="15" r="1.6" fill="currentColor" />
      <circle cx="5" cy="10.5" r="1.6" fill="currentColor" />
      <circle cx="7.5" cy="6.8" r="1.6" fill="currentColor" />
      {/* Tassel */}
      <path d="M12 19.5v3.5" strokeWidth="2" />
    </svg>
  )
}

export function CompassIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.3" />
    </svg>
  )
}

export function SunriseIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2v4" />
      <path d="m4.93 10.93 2.83-2.83" />
      <path d="M2 18h2" />
      <path d="M20 18h2" />
      <path d="m19.07 10.93-2.83-2.83" />
      <path d="M22 22H2" />
      <path d="M8 18a4 4 0 0 1 8 0" />
      <path d="M12 6l-2 2h4l-2-2z" fill="currentColor" />
    </svg>
  )
}

export function SunsetIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 10v4" />
      <path d="m4.93 10.93 2.83-2.83" />
      <path d="M2 18h2" />
      <path d="M20 18h2" />
      <path d="m19.07 10.93-2.83-2.83" />
      <path d="M22 22H2" />
      <path d="M8 18a4 4 0 0 1 8 0" />
      <path d="m9 13 3 3 3-3" />
    </svg>
  )
}

export function SunIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

export function CloudSunIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="M20 12h2" />
      <path d="m19.07 4.93-1.41 1.41" />
      <path d="M15.5 8.5A4 4 0 0 0 8.87 6.4" />
      <path d="M17.5 19H9a5 5 0 0 1-1-9.9 6 6 0 0 1 11.5 2.4A4 4 0 0 1 17.5 19z" />
    </svg>
  )
}

export function MoonIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      <path d="M19 3v4" strokeWidth="1.5" />
      <path d="M21 5h-4" strokeWidth="1.5" />
    </svg>
  )
}

export function DawnIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 20h18" />
      <path d="M12 4v4" />
      <path d="m7.8 7.8 2 2" />
      <path d="m16.2 7.8-2 2" />
      <path d="M6 20a6 6 0 0 1 12 0" />
    </svg>
  )
}

export function LocationIcon({ className = '', size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function KaabaIcon({ className = '', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Kaaba Cube */}
      <path d="M12 2 2 7l10 5 10-5-10-5Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
      <path d="M2 7v10" />
      <path d="M12 12v10" />
      <path d="M22 7v10" />
    </svg>
  )
}

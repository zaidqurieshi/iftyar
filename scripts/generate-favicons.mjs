import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '../public')

// 1. Generate 8-pointed star points
function getEightPointStarPoints(cx, cy, rOuter, rInner) {
  const points = []
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2
    const r = i % 2 === 0 ? rOuter : rInner
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return points.join(' ')
}

const starPoints = getEightPointStarPoints(320, 210, 48, 22)

// 2. Icon SVG for Favicon and App Icons (512x512)
const appIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="38%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#0c2f38" />
      <stop offset="60%" stop-color="#06181e" />
      <stop offset="100%" stop-color="#030c0f" />
    </radialGradient>

    <!-- Gold Foil Gradient for Crescent -->
    <linearGradient id="goldCrescent" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#fff4cc" />
      <stop offset="30%" stop-color="#f6d268" />
      <stop offset="70%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>

    <!-- Emerald Glow Gradient for Star -->
    <linearGradient id="emeraldStar" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a7f3d0" />
      <stop offset="50%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- Outer Gold Border Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f6d268" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#34d399" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.5" />
    </linearGradient>

    <!-- Soft Glow Filter -->
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="emeraldGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Squircle / Circle Dark Base -->
  <rect x="8" y="8" width="496" height="496" rx="128" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="4" />

  <!-- Ambient Light Orbs -->
  <circle cx="230" cy="270" r="140" fill="#10b981" opacity="0.1" filter="blur(40px)" />
  <circle cx="310" cy="220" r="100" fill="#f6d268" opacity="0.12" filter="blur(30px)" />

  <!-- Inner Subtle Accent Ring -->
  <circle cx="256" cy="256" r="215" fill="none" stroke="rgba(52, 211, 153, 0.12)" stroke-width="1.5" stroke-dasharray="4 8" />

  <!-- Crescent Moon (Hilal) -->
  <path
    d="M 276,108 C 362.156,108 432,177.844 432,264 C 432,350.156 362.156,420 276,420 C 197.67,420 132.88,362.24 121.54,286.3 C 145.42,305.86 175.76,317.6 208.8,317.6 C 290.42,317.6 356.6,251.42 356.6,169.8 C 356.6,145.8 350.8,123.1 340.5,103.2 C 320.1,106.3 297.8,108 276,108 Z"
    fill="url(#goldCrescent)"
    filter="url(#goldGlow)"
  />

  <!-- 8-Pointed Star (Khatim / Rub el Hizb) -->
  <polygon
    points="${starPoints}"
    fill="url(#emeraldStar)"
    filter="url(#emeraldGlow)"
  />

  <!-- Center Jewel of Star -->
  <circle cx="320" cy="210" r="10" fill="#fff" opacity="0.95" />
</svg>
`

// 3. OpenGraph Social Share Card (1200x630) for WhatsApp, iMessage, Twitter
const ogCardSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="ogBg" cx="25%" cy="35%" r="85%">
      <stop offset="0%" stop-color="#0e343e" />
      <stop offset="50%" stop-color="#06181e" />
      <stop offset="100%" stop-color="#02090b" />
    </radialGradient>

    <!-- Gold Foil Gradient -->
    <linearGradient id="ogGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff8db" />
      <stop offset="35%" stop-color="#f6d268" />
      <stop offset="70%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>

    <!-- Emerald Gradient -->
    <linearGradient id="ogEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a7f3d0" />
      <stop offset="50%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- Border Linear Gradient -->
    <linearGradient id="ogBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f6d268" stop-opacity="0.5" />
      <stop offset="50%" stop-color="#34d399" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.4" />
    </linearGradient>

    <filter id="ogGlowGold" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="ogGlowEmerald" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Outer Background -->
  <rect width="1200" height="630" fill="url(#ogBg)" />

  <!-- Subtle Pattern Grid / Rings -->
  <circle cx="210" cy="315" r="230" fill="none" stroke="rgba(52, 211, 153, 0.08)" stroke-width="1.5" stroke-dasharray="6 12" />
  <circle cx="210" cy="315" r="275" fill="none" stroke="rgba(246, 210, 104, 0.06)" stroke-width="1" />
  <circle cx="210" cy="315" r="160" fill="#10b981" opacity="0.14" filter="blur(60px)" />
  <circle cx="260" cy="270" r="110" fill="#f6d268" opacity="0.18" filter="blur(40px)" />

  <!-- Inner Border Frame -->
  <rect x="24" y="24" width="1152" height="582" rx="32" fill="none" stroke="url(#ogBorder)" stroke-width="2" />

  <!-- Left Icon Crest: Crescent Moon (Hilal) scaled & centered at cx=210, cy=315 -->
  <g transform="translate(-40, 15) scale(0.9)">
    <path
      d="M 276,108 C 362.156,108 432,177.844 432,264 C 432,350.156 362.156,420 276,420 C 197.67,420 132.88,362.24 121.54,286.3 C 145.42,305.86 175.76,317.6 208.8,317.6 C 290.42,317.6 356.6,251.42 356.6,169.8 C 356.6,145.8 350.8,123.1 340.5,103.2 C 320.1,106.3 297.8,108 276,108 Z"
      fill="url(#ogGold)"
      filter="url(#ogGlowGold)"
    />

    <!-- 8-pointed star in crest -->
    <polygon
      points="${getEightPointStarPoints(320, 210, 48, 22)}"
      fill="url(#ogEmerald)"
      filter="url(#ogGlowEmerald)"
    />
    <circle cx="320" cy="210" r="10" fill="#ffffff" opacity="0.95" />
  </g>

  <!-- Right Typography Section -->
  <!-- Eyebrow Badge -->
  <g transform="translate(480, 140)">
    <rect x="0" y="0" width="280" height="38" rx="19" fill="rgba(52, 211, 153, 0.12)" stroke="rgba(52, 211, 153, 0.35)" stroke-width="1.5" />
    <text x="140" y="24" text-anchor="middle" fill="#34d399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" letter-spacing="0.14em">
      ✦ RAMADAN 1447 AH
    </text>
  </g>

  <!-- Main Headline Title: Iftyar -->
  <text x="480" y="260" fill="url(#ogGold)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="86" font-weight="800" letter-spacing="-0.03em" filter="drop-shadow(0 4px 20px rgba(0,0,0,0.5))">
    Iftyar
  </text>

  <!-- Arabic Calligraphy Sub-word -->
  <text x="750" y="252" fill="rgba(246, 210, 104, 0.6)" font-family="'Amiri', 'Traditional Arabic', serif" font-size="52" font-weight="700">
    إِفْطَار
  </text>

  <!-- Subtitle Tagline -->
  <text x="480" y="325" fill="#e6edf3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="600" letter-spacing="-0.01em">
    Ramadan Countdown &amp; Daily Prayer Times
  </text>

  <text x="480" y="375" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="400" line-height="1.5">
    Live Sehri &amp; Iftar countdown, verified local timetables,
  </text>
  <text x="480" y="405" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="400" line-height="1.5">
    precise Qibla direction, and daily Ramadan supplications.
  </text>

  <!-- Feature Highlights Chips Row -->
  <g transform="translate(480, 460)">
    <!-- Feature 1 -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="180" height="42" rx="10" fill="rgba(15, 35, 41, 0.7)" stroke="rgba(246, 210, 104, 0.25)" stroke-width="1" />
      <text x="90" y="26" text-anchor="middle" fill="#f6d268" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600">
        ⏱️ Live Countdown
      </text>
    </g>

    <!-- Feature 2 -->
    <g transform="translate(195, 0)">
      <rect x="0" y="0" width="180" height="42" rx="10" fill="rgba(15, 35, 41, 0.7)" stroke="rgba(52, 211, 153, 0.25)" stroke-width="1" />
      <text x="90" y="26" text-anchor="middle" fill="#34d399" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600">
        🧭 Qibla Compass
      </text>
    </g>

    <!-- Feature 3 -->
    <g transform="translate(390, 0)">
      <rect x="0" y="0" width="180" height="42" rx="10" fill="rgba(15, 35, 41, 0.7)" stroke="rgba(246, 210, 104, 0.25)" stroke-width="1" />
      <text x="90" y="26" text-anchor="middle" fill="#f6d268" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600">
        🕌 Daily Prayers
      </text>
    </g>
  </g>

  <!-- Footer Link Badge -->
  <text x="1110" y="555" text-anchor="end" fill="rgba(255,255,255,0.4)" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="500">
    iftyar.com
  </text>
</svg>
`

async function generateAll() {
  console.log('Generating favicons, Apple touch icon, and OpenGraph share card...')

  // Save SVG
  const svgPath = path.join(publicDir, 'favicon.svg')
  fs.writeFileSync(svgPath, appIconSvg.trim())
  console.log('✓ Wrote', svgPath)

  const appIconBuffer = Buffer.from(appIconSvg)

  // 1. favicon-16x16.png
  await sharp(appIconBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'))
  console.log('✓ Wrote favicon-16x16.png')

  // 2. favicon-32x32.png
  await sharp(appIconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'))
  console.log('✓ Wrote favicon-32x32.png')

  // 3. favicon-48x48.png
  await sharp(appIconBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon-48x48.png'))
  console.log('✓ Wrote favicon-48x48.png')

  // 4. apple-touch-icon.png (180x180 for iOS Home Screen)
  await sharp(appIconBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'))
  console.log('✓ Wrote apple-touch-icon.png (180x180)')

  // 5. icon-192.png (PWA / Android)
  await sharp(appIconBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'))
  console.log('✓ Wrote icon-192.png (192x192)')

  // 6. icon-512.png (PWA high-res)
  await sharp(appIconBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'))
  console.log('✓ Wrote icon-512.png (512x512)')

  // 7. og-image.png (1200x630 for WhatsApp, iMessage, Twitter previews)
  const ogBuffer = Buffer.from(ogCardSvg)
  await sharp(ogBuffer)
    .resize(1200, 630)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'og-image.png'))
  console.log('✓ Wrote og-image.png (1200x630)')

  // 8. favicon.ico - standard Windows / legacy browser multi-size or 32x32 PNG header
  // Note: Modern browsers accept PNG favicon named favicon.ico or link rel="icon"
  fs.copyFileSync(path.join(publicDir, 'favicon-32x32.png'), path.join(publicDir, 'favicon.ico'))
  console.log('✓ Wrote favicon.ico')

  console.log('\nAll assets successfully generated! ✨')
}

generateAll().catch((err) => {
  console.error('Error generating assets:', err)
  process.exit(1)
})

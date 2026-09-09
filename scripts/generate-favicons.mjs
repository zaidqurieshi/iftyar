import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '../public')

// 1. Math for 8-pointed Islamic Star (Rub el Hizb)
function getEightPointStarPolygon(cx, cy, rOuter, rInner) {
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

// 2. Math for exact circular Crescent Moon path
function getCrescentPath(cx1, cy1, r1, cx2, cy2, r2) {
  const d = Math.hypot(cx2 - cx1, cy2 - cy1)
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a))
  const x2 = cx1 + (a * (cx2 - cx1)) / d
  const y2 = cy1 + (a * (cy2 - cy1)) / d

  const rx = -(cy2 - cy1) * (h / d)
  const ry = (cx2 - cx1) * (h / d)

  const p1 = { x: x2 + rx, y: y2 + ry }
  const p2 = { x: x2 - rx, y: y2 - ry }

  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r1} ${r1} 0 1 0 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} A ${r2} ${r2} 0 1 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`
}

const crescentPath = getCrescentPath(245, 256, 140, 276, 234, 114)
const starOuterPoints = getEightPointStarPolygon(306, 224, 44, 23)
const starInnerPoints = getEightPointStarPolygon(306, 224, 25, 13)

// --- A. Master App Icon SVG (512x512 Full Bleed for Apple Touch Icon, Android PWA) ---
// Note: Full bleed square without outer squircle cuts, as iOS applies its own squircle mask natively.
const masterAppIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Rich Obsidian-Emerald Radial Background -->
    <radialGradient id="bgGlow" cx="48%" cy="42%" r="68%">
      <stop offset="0%" stop-color="#0c3830" />
      <stop offset="45%" stop-color="#06201b" />
      <stop offset="80%" stop-color="#03120f" />
      <stop offset="100%" stop-color="#010806" />
    </radialGradient>

    <!-- Luxury Gold Foil Gradient -->
    <linearGradient id="goldGradient" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#fffbe8" />
      <stop offset="22%" stop-color="#fde047" />
      <stop offset="55%" stop-color="#f59e0b" />
      <stop offset="82%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>

    <!-- Emerald Gem Core Gradient -->
    <linearGradient id="emeraldCore" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6ee7b7" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>

    <!-- Specular Highlight for Star -->
    <radialGradient id="starHighlight" cx="40%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="60%" stop-color="#a7f3d0" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
    </radialGradient>

    <!-- Drop Shadows for 3D elevation -->
    <filter id="shadowCrescent" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.55" />
    </filter>

    <filter id="shadowStar" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Full-bleed background -->
  <rect width="512" height="512" fill="url(#bgGlow)" />

  <!-- Sacred Geometry Watermark: Concentric Rings -->
  <circle cx="256" cy="256" r="236" fill="none" stroke="#f6d268" stroke-width="1.5" stroke-opacity="0.08" />
  <circle cx="256" cy="256" r="216" fill="none" stroke="#34d399" stroke-width="1" stroke-opacity="0.06" stroke-dasharray="3 6" />
  <circle cx="256" cy="256" r="176" fill="none" stroke="#f6d268" stroke-width="1" stroke-opacity="0.07" />

  <!-- Subtle 8-Fold Sacred Geometry Star in Background -->
  <g opacity="0.04" stroke="#f6d268" stroke-width="1.5" fill="none">
    <rect x="96" y="96" width="320" height="320" rx="4" />
    <rect x="96" y="96" width="320" height="320" rx="4" transform="rotate(45 256 256)" />
  </g>

  <!-- Central Ambient Golden Glow -->
  <circle cx="270" cy="250" r="140" fill="#f59e0b" opacity="0.12" filter="blur(35px)" />

  <!-- 3D Sculptured Golden Crescent Moon (Hilal) -->
  <path
    d="${crescentPath}"
    fill="url(#goldGradient)"
    filter="url(#shadowCrescent)"
  />

  <!-- Crescent Inner Light Sheen -->
  <path
    d="${crescentPath}"
    fill="none"
    stroke="#fffbe8"
    stroke-width="1.5"
    stroke-opacity="0.35"
  />

  <!-- 8-Pointed Islamic Star (Rub el Hizb) -->
  <g filter="url(#shadowStar)">
    <!-- Outer Gold Faceted Star -->
    <polygon
      points="${starOuterPoints}"
      fill="url(#goldGradient)"
    />

    <!-- Inner Emerald Gemstone Facet -->
    <polygon
      points="${starInnerPoints}"
      fill="url(#emeraldCore)"
    />

    <!-- Radiant Diamond Light Highlight in Center -->
    <circle cx="306" cy="224" r="7" fill="url(#starHighlight)" />
  </g>
</svg>
`

// --- B. Vector Favicon SVG (64x64 / high contrast, razor sharp, no blur) ---
const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="favBg" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#0c3830" />
      <stop offset="100%" stop-color="#020d0b" />
    </radialGradient>
    <linearGradient id="favGold" x1="10%" y1="10%" x2="90%" y2="90%">
      <stop offset="0%" stop-color="#fffbe8" />
      <stop offset="35%" stop-color="#fde047" />
      <stop offset="70%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="favEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a7f3d0" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>

  <!-- Squircle Base for Browser Tabs -->
  <rect width="64" height="64" rx="14" fill="url(#favBg)" />

  <!-- Crescent scaled down cleanly: center ~ 31, 32 -->
  <g transform="translate(32, 32) scale(0.115) translate(-256, -256)">
    <path
      d="${crescentPath}"
      fill="url(#favGold)"
    />
    <polygon
      points="${starOuterPoints}"
      fill="url(#favGold)"
    />
    <polygon
      points="${starInnerPoints}"
      fill="url(#favEmerald)"
    />
    <circle cx="306" cy="224" r="8" fill="#ffffff" />
  </g>
</svg>
`

// --- C. OpenGraph Share Card (1200x630) for WhatsApp / Social Media Previews ---
const ogCardSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="ogBg" cx="30%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#0c3a32" />
      <stop offset="50%" stop-color="#051c18" />
      <stop offset="100%" stop-color="#020a08" />
    </radialGradient>

    <linearGradient id="ogGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbe8" />
      <stop offset="25%" stop-color="#fde047" />
      <stop offset="60%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>

    <linearGradient id="ogEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a7f3d0" />
      <stop offset="50%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <linearGradient id="ogBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f6d268" stop-opacity="0.4" />
      <stop offset="50%" stop-color="#34d399" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.35" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#ogBg)" />

  <!-- Frame Border -->
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="url(#ogBorder)" stroke-width="2" />

  <!-- Ambient Glow -->
  <circle cx="280" cy="315" r="180" fill="#f59e0b" opacity="0.12" filter="blur(50px)" />
  <circle cx="220" cy="315" r="160" fill="#10b981" opacity="0.1" filter="blur(60px)" />

  <!-- Left Icon Emblem: Crescent & Star -->
  <g transform="translate(10, 80) scale(0.92)">
    <path
      d="${crescentPath}"
      fill="url(#ogGold)"
    />
    <polygon
      points="${starOuterPoints}"
      fill="url(#ogGold)"
    />
    <polygon
      points="${starInnerPoints}"
      fill="url(#ogEmerald)"
    />
    <circle cx="306" cy="224" r="8" fill="#ffffff" />
  </g>

  <!-- Right Side Content -->
  <!-- Badge: Ramadan 1448 AH -->
  <g transform="translate(490, 140)">
    <rect x="0" y="0" width="260" height="38" rx="19" fill="rgba(52, 211, 153, 0.12)" stroke="rgba(52, 211, 153, 0.35)" stroke-width="1.5" />
    <text x="130" y="24" text-anchor="middle" fill="#34d399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" letter-spacing="0.14em">
      ✦ RAMADAN 1448 AH
    </text>
  </g>

  <!-- Main Title: Iftyar -->
  <text x="490" y="260" fill="url(#ogGold)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="88" font-weight="800" letter-spacing="-0.03em">
    Iftyar
  </text>

  <!-- Arabic Calligraphy -->
  <text x="760" y="252" fill="rgba(246, 210, 104, 0.6)" font-family="'Amiri', 'Traditional Arabic', serif" font-size="52" font-weight="700">
    إِفْطَار
  </text>

  <!-- Subtitle -->
  <text x="490" y="325" fill="#e6edf3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="600" letter-spacing="-0.01em">
    Ramadan Countdown &amp; Prophetic Wisdom
  </text>

  <text x="490" y="375" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="400">
    Live Sehri &amp; Iftar countdown, local timetables, Qibla direction,
  </text>
  <text x="490" y="405" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="400">
    and 370+ authentic daily Prophetic reminders.
  </text>

  <!-- Highlight Badges -->
  <g transform="translate(490, 460)">
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="180" height="42" rx="10" fill="rgba(15, 35, 41, 0.7)" stroke="rgba(246, 210, 104, 0.25)" stroke-width="1" />
      <text x="90" y="26" text-anchor="middle" fill="#f6d268" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600">
        ⏱️ Live Countdown
      </text>
    </g>

    <g transform="translate(195, 0)">
      <rect x="0" y="0" width="180" height="42" rx="10" fill="rgba(15, 35, 41, 0.7)" stroke="rgba(52, 211, 153, 0.25)" stroke-width="1" />
      <text x="90" y="26" text-anchor="middle" fill="#34d399" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600">
        🧭 Qibla Direction
      </text>
    </g>

    <g transform="translate(390, 0)">
      <rect x="0" y="0" width="195" height="42" rx="10" fill="rgba(15, 35, 41, 0.7)" stroke="rgba(246, 210, 104, 0.25)" stroke-width="1" />
      <text x="97" y="26" text-anchor="middle" fill="#f6d268" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600">
        📖 370+ Reminders
      </text>
    </g>
  </g>

  <!-- URL Branding -->
  <text x="1110" y="555" text-anchor="end" fill="rgba(255,255,255,0.4)" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="500">
    iftyar.com
  </text>
</svg>
`

async function generateAll() {
  console.log('Generating high-end professional icons and favicons...')

  // 1. Write favicon.svg
  const svgFaviconPath = path.join(publicDir, 'favicon.svg')
  fs.writeFileSync(svgFaviconPath, faviconSvg.trim())
  console.log('✓ Wrote favicon.svg')

  // Buffers
  const masterAppBuffer = Buffer.from(masterAppIconSvg)
  const faviconBuffer = Buffer.from(faviconSvg)

  // 2. apple-touch-icon.png (180x180) - Full bleed edge-to-edge square for iOS
  await sharp(masterAppBuffer)
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'))
  console.log('✓ Wrote apple-touch-icon.png (180x180, full-bleed iOS format)')

  // 3. icon-192.png (PWA / Android standard)
  await sharp(masterAppBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'))
  console.log('✓ Wrote icon-192.png (192x192)')

  // 4. icon-512.png (PWA high-res)
  await sharp(masterAppBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'))
  console.log('✓ Wrote icon-512.png (512x512)')

  // 5. favicon-48x48.png
  await sharp(faviconBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon-48x48.png'))
  console.log('✓ Wrote favicon-48x48.png')

  // 6. favicon-32x32.png
  await sharp(faviconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'))
  console.log('✓ Wrote favicon-32x32.png')

  // 7. favicon-16x16.png
  await sharp(faviconBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'))
  console.log('✓ Wrote favicon-16x16.png')

  // 8. favicon.ico (copied from 32x32 PNG)
  fs.copyFileSync(path.join(publicDir, 'favicon-32x32.png'), path.join(publicDir, 'favicon.ico'))
  console.log('✓ Wrote favicon.ico')

  // 9. og-image.png (1200x630 share preview)
  const ogBuffer = Buffer.from(ogCardSvg)
  await sharp(ogBuffer)
    .resize(1200, 630)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'og-image.png'))
  console.log('✓ Wrote og-image.png (1200x630)')

  console.log('\nAll icons, favicons & share preview generated with professional polish! ✨')
}

generateAll().catch((err) => {
  console.error('Error generating assets:', err)
  process.exit(1)
})

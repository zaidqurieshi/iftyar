import sharp from 'sharp'
import fs from 'fs'

const inputPath = '/Users/zaidqurieshi/.gemini/antigravity-ide/brain/c72e1953-82ff-461c-a1d2-d236ac61dc5c/.user_uploaded/media_1789065736338.png'

async function generateFavicons() {
  console.log('Generating favicons from uploaded image...')

  // Step 1: Create a perfectly square 512x512 icon from the uploaded image
  // The icon is centered with subtle padding inside a 512x512 canvas with background #344930
  
  // Crop the icon portion
  // Bounding box of white arch is minX: 41, maxX: 509 (width: 468), minY: 111, maxY: 813 (height: 702)
  // Let's crop from Y: 90 to 830 (height 740), X: 20 to 525 (width 505)
  
  const croppedBuffer = await sharp(inputPath)
    .extract({ left: 20, top: 80, width: 505, height: 750 })
    .toBuffer()

  // Fit inside 512x512 canvas with background #344930 (RGB: 52, 73, 48)
  const masterSquare = await sharp(croppedBuffer)
    .resize(410, 410, { fit: 'contain', background: { r: 52, g: 73, b: 48, alpha: 1 } })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 52, g: 73, b: 48, alpha: 1 }
    })
    .toBuffer()

  // Generate SVG vector equivalent for crisp resolution on high-DPI browsers
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" fill="#344930" rx="96"/>
  <!-- Arch Dome top -->
  <path d="M 176 170 A 80 80 0 0 1 336 170 Z" fill="#ffffff" />
  <!-- Arch Outer Frame -->
  <path d="M 130 170 L 382 170 L 382 410 L 130 410 Z" fill="#ffffff" />
  <!-- Arch Inner Cutout -->
  <path d="M 176 170 L 336 170 L 336 380 L 176 380 Z" fill="#344930" />
</svg>`

  fs.writeFileSync('public/favicon.svg', svgContent)
  console.log('Saved public/favicon.svg')

  // Generate PNG sizes
  const sizes = [
    { name: 'public/favicon-16x16.png', size: 16 },
    { name: 'public/favicon-32x32.png', size: 32 },
    { name: 'public/favicon-48x48.png', size: 48 },
    { name: 'public/favicon.ico', size: 32 },
    { name: 'public/apple-touch-icon.png', size: 180 },
    { name: 'public/icon-192.png', size: 192 },
    { name: 'public/icon-512.png', size: 512 },
  ]

  for (const { name, size } of sizes) {
    await sharp(masterSquare)
      .resize(size, size)
      .png()
      .toFile(name)
    console.log(`Saved ${name}`)
  }

  // Update favicon mark in AppShell header to use the new green Mihrab Arch logo mark!
  console.log('Favicon generation complete!')
}

generateFavicons().catch(console.error)

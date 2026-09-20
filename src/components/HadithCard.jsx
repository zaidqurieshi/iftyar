import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import GlassCard from './GlassCard'
import { getRandomHadith, HADITH_COLLECTION } from '../data/hadithCollection'

function drawHadithImage(hadith) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 675
  const context = canvas.getContext('2d')

  // Background
  context.fillStyle = '#121711'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Jade accent line
  context.fillStyle = '#bac8b1'
  context.fillRect(70, 70, 1060, 4)

  // Title
  context.fillStyle = '#bac8b1'
  context.font = '600 44px Georgia, serif'
  context.fillText('Daily Hadith Reminder', 70, 150)

  // Hadith text
  context.font = '38px Georgia, serif'
  context.fillStyle = '#e6e6e6'

  const words = hadith.text.split(' ')
  const lines = []
  let line = ''
  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word
    if (context.measureText(nextLine).width > 1000) {
      lines.push(line)
      line = word
    } else {
      line = nextLine
    }
  })
  lines.push(line)
  lines.slice(0, 5).forEach((val, idx) => context.fillText(val, 70, 240 + idx * 58))

  // Source & Footer
  context.font = '28px Arial, sans-serif'
  context.fillStyle = '#7b9669'
  context.fillText(`— ${hadith.source} • Meeqat`, 70, 560)
  context.fillText(`— ${hadith.source} • Iftyar`, 70, 560)

  return canvas.toDataURL('image/png')
}

export default function HadithCard() {
  const [hadith, setHadith] = useState(() => getRandomHadith())
  const [shareStatus, setShareStatus] = useState('')
  const [isRotating, setIsRotating] = useState(false)

  const imageUrl = useMemo(() => drawHadithImage(hadith), [hadith])

  const handleNextHadith = () => {
    setIsRotating(true)
    setHadith(getRandomHadith())
    setShareStatus('')
    setTimeout(() => setIsRotating(false), 400)
  }

  const handleShare = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'hadith-reminder.png', { type: 'image/png' })

      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          title: 'Hadith Reminder',
          text: `"${hadith.text}" — ${hadith.source}`,
          files: [file],
        })
        setShareStatus('Shared!')
        return
      }
    } catch {
      // fallback to WhatsApp
    }

    const shareUrl = `https://wa.me/?text=${encodeURIComponent(
      `"${hadith.text}"\n— ${hadith.source}\n\nShared via Meeqat (https://meeqat.vercel.app)`
      `"${hadith.text}"\n— ${hadith.source}\n\nShared via Iftyar (https://iftyar.vercel.app)`
    )}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
    setShareStatus('Opened WhatsApp')
  }

  return (
    <GlassCard className="panel-card" static>
      <div className="hero-card__header" style={{ marginBottom: '0.85rem' }}>
        <div>
          <span className="eyebrow eyebrow--gold">Daily Wisdom ({hadith.id} of {HADITH_COLLECTION.length})</span>
          <span className="eyebrow eyebrow--sage">Daily Wisdom ({hadith.id} of {HADITH_COLLECTION.length})</span>
          <h2 style={{ fontSize: '1.4rem' }}>Prophetic Reminder</h2>
        </div>

        <motion.button
          type="button"
          className="dua-action-btn"
          onClick={handleNextHadith}
          whileTap={{ scale: 0.95 }}
          title="New Reminder"
        >
          <motion.span
            animate={{ rotate: isRotating ? 360 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'inline-block' }}
          >
            ↻
          </motion.span>
          <span>Shuffle</span>
        </motion.button>
      </div>

      <div className="hadith-quote-icon">“</div>

      <AnimatePresence mode="wait">
        <motion.div
          key={hadith.text}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <p className="hadith-quote-text">{hadith.text}</p>
        </motion.div>
      </AnimatePresence>

      <div className="hadith-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span className="hadith-source-badge">✦ {hadith.source}</span>
          {hadith.category && (
            <span className="hadith-category-badge">{hadith.category}</span>
          )}
        </div>

        <div className="hadith-action-btns">
          <motion.button
            type="button"
            className="dua-action-btn"
            onClick={handleShare}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            <span>{shareStatus || 'Share Reminder 📤'}</span>
          </motion.button>
        </div>
      </div>
    </GlassCard>
  )
}

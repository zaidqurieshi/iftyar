import { useMemo, useState } from 'react'
import GlassCard from './GlassCard'
import { getRandomHadith } from '../data/hadithCollection'

const IFTYAR_URL = 'https://iftyar.com'

function drawHadithImage(hadith) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 675
  const context = canvas.getContext('2d')

  context.fillStyle = '#10241d'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#d1bd7c'
  context.fillRect(70, 70, 1060, 4)
  context.fillStyle = '#edfdf3'
  context.font = '600 48px Georgia'
  context.fillText('Hadith', 70, 150)
  context.font = '42px Georgia'
  context.fillStyle = '#c8e8d5'

  const words = hadith.text.split(' ')
  const lines = []
  let line = ''
  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word
    if (context.measureText(nextLine).width > 980) {
      lines.push(line)
      line = word
    } else {
      line = nextLine
    }
  })
  lines.push(line)
  lines.forEach((value, index) => context.fillText(value, 70, 275 + index * 64))

  context.font = '28px Arial'
  context.fillStyle = '#9bc7aa'
  context.fillText(hadith.source, 70, 520)
  context.fillStyle = '#d1bd7c'
  context.font = '600 30px Arial'
  context.fillText('Iftyar', 70, 600)

  return canvas.toDataURL('image/png')
}

export default function HadithCard() {
  // Pick a fresh random hadith on every mount (i.e. every page load/reload).
  const [hadith] = useState(() => getRandomHadith())
  const [shareStatus, setShareStatus] = useState('')
  const imageUrl = useMemo(() => drawHadithImage(hadith), [hadith])

  const handleShare = async () => {
    if (!imageUrl) return

    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const file = new File([blob], 'iftyar-hadith.png', { type: 'image/png' })

    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share({ title: 'Hadith - Iftyar', files: [file] })
        setShareStatus('Shared')
        return
      } catch (error) {
        if (error.name === 'AbortError') return
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(`Hadith from Iftyar: ${IFTYAR_URL}`)}`, '_blank', 'noopener,noreferrer')
    setShareStatus('WhatsApp opened with the Iftyar link')
  }

  return (
    <GlassCard className="panel-card hadith-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Random Hadith</p>
          <h2>A new reminder on every visit</h2>
        </div>
        <button type="button" className="hadith-card__share" onClick={handleShare} disabled={!imageUrl}>
          Share
        </button>
      </div>
      {imageUrl && <img className="hadith-card__image" src={imageUrl} alt={`Hadith: ${hadith.text}`} />}
      {shareStatus && <p className="hadith-card__status" role="status">{shareStatus}</p>}
      <a className="hadith-card__link" href={IFTYAR_URL} target="_blank" rel="noreferrer">Iftyar</a>
    </GlassCard>
  )
}

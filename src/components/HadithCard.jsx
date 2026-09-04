import { useEffect, useMemo, useState } from 'react'
import GlassCard from './GlassCard'

const IFTYAR_URL = 'https://iftyar.com'
const FALLBACK_HADITH = {
  text: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
  source: 'Sahih al-Bukhari 6018',
}

const HADITH_API_URL = 'https://random-hadith-generator.vercel.app/hadith/'

async function getDailyHadith(signal) {
  const response = await fetch(`${HADITH_API_URL}?refresh=${Date.now()}`, {
    signal,
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Hadith request failed.')

  const data = await response.json()
  const text = data?.hadith_english?.trim()
  const source = [data?.book, data?.refno].filter(Boolean).join(' ')
  if (!text || !source) throw new Error('Hadith response was incomplete.')

  return { text, source }
}

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
  context.fillText('Daily Hadith', 70, 150)
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
  const [hadith, setHadith] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shareStatus, setShareStatus] = useState('')
  const imageUrl = useMemo(() => (hadith ? drawHadithImage(hadith) : ''), [hadith])

  useEffect(() => {
    const controller = new AbortController()
    getDailyHadith(controller.signal)
      .then(setHadith)
      .catch((error) => {
        if (error.name !== 'AbortError') setHadith(FALLBACK_HADITH)
      })
      .finally(() => setIsLoading(false))
    return () => controller.abort()
  }, [])

  const handleShare = async () => {
    if (!imageUrl) return

    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const file = new File([blob], 'iftyar-daily-hadith.png', { type: 'image/png' })

    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share({ title: 'Daily Hadith - Iftyar', files: [file] })
        setShareStatus('Shared')
        return
      } catch (error) {
        if (error.name === 'AbortError') return
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(`Daily Hadith from Iftyar: ${IFTYAR_URL}`)}`, '_blank', 'noopener,noreferrer')
    setShareStatus('WhatsApp opened with the Iftyar link')
  }

  return (
    <GlassCard className="panel-card hadith-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Daily Hadith</p>
          <h2>One reminder for today</h2>
        </div>
        <button type="button" className="hadith-card__share" onClick={handleShare} disabled={!imageUrl}>
          Share
        </button>
      </div>
      {isLoading && <p className="supporting-copy">Fetching today&apos;s Hadith...</p>}
      {imageUrl && <img className="hadith-card__image" src={imageUrl} alt={`Daily hadith: ${hadith.text}`} />}
      {shareStatus && <p className="hadith-card__status" role="status">{shareStatus}</p>}
      <a className="hadith-card__link" href={IFTYAR_URL} target="_blank" rel="noreferrer">Iftyar</a>
    </GlassCard>
  )
}

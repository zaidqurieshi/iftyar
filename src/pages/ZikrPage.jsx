import React, { useState } from 'react'

// 99 Names of Allah with English meanings
const NAMES = [
  { arabic: 'الرَّحْمَنُ', english: 'The Most Merciful' },
  { arabic: 'الرَّحِيمُ', english: 'The Most Compassionate' },
  { arabic: 'الْمَلِكُ', english: 'The King' },
  { arabic: 'الْقُدُّوسُ', english: 'The Most Holy' },
  { arabic: 'السَّلَامُ', english: 'The Source of Peace' },
  { arabic: 'الْمُؤْمِنُ', english: 'The Granter of Security' },
  { arabic: 'الْمُهَيْمِنُ', english: 'The Protector' },
  { arabic: 'الْعَزِيزُ', english: 'The Mighty' },
  { arabic: 'الْجَبَّارُ', english: 'The Compeller' },
  { arabic: 'الْمُتَكَبِّرُ', english: 'The Supreme' },
  { arabic: 'الْخَالِقُ', english: 'The Creator' },
  { arabic: 'الْبَارِئُ', english: 'The Maker of Order' },
  { arabic: 'الْمُصَوِّرُ', english: 'The Fashioner' },
  { arabic: 'الْغَفَّارُ', english: 'The Great Forgiver' },
  { arabic: 'الْقَهَّارُ', english: 'The All-Powerful' },
  { arabic: 'الْوَهَّابُ', english: 'The Bestower' },
  { arabic: 'الرَّزَّاقُ', english: 'The Provider' },
  { arabic: 'الْفَتَّاحُ', english: 'The Opener' },
  { arabic: 'اَللَّهُ', english: 'God' },
  { arabic: 'الرَّحْمَٰنُ', english: 'The Compassionate' },
  // ... continue to 99 entries (omitted for brevity in this snippet)
]

export default function ZikrPage() {
  const [index, setIndex] = useState(0)
  const { arabic, english } = NAMES[index] || {}

  const next = () => setIndex((i) => (i + 1) % NAMES.length)
  const prev = () => setIndex((i) => (i - 1 + NAMES.length) % NAMES.length)

  return (
    <div className="zikr-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{arabic}</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{english}</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={prev} style={{ padding: '0.5rem 1rem' }}>Previous</button>
        <button onClick={next} style={{ padding: '0.5rem 1rem' }}>Next</button>
      </div>
    </div>
  )
}

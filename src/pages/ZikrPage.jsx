import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import GlassCard from '../components/GlassCard'
import DuaCard from '../components/DuaCard'

const TASBIH_PRESETS = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    meaning: 'Glory be to Allah',
    target: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    meaning: 'All praise is due to Allah',
    target: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah is the Greatest',
    target: 34,
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    meaning: 'I seek forgiveness from Allah',
    target: 100,
  },
  {
    id: 'tahlil',
    arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    meaning: 'There is no god but Allah',
    target: 100,
  },
  {
    id: 'salawat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    transliteration: 'Allahumma Salli Ala Muhammad',
    meaning: 'O Allah, send blessings upon Muhammad',
    target: 100,
  },
]

const NAMES_OF_ALLAH = [
  { num: 1, arabic: 'الرَّحْمَنُ', transliteration: 'Ar-Rahman', english: 'The Most Gracious' },
  { num: 2, arabic: 'الرَّحِيمُ', transliteration: 'Ar-Raheem', english: 'The Most Merciful' },
  { num: 3, arabic: 'الْمَلِكُ', transliteration: 'Al-Malik', english: 'The King and Sovereign' },
  { num: 4, arabic: 'الْقُدُّوسُ', transliteration: 'Al-Quddus', english: 'The Most Holy' },
  { num: 5, arabic: 'السَّلَامُ', transliteration: 'As-Salam', english: 'The Source of Peace' },
  { num: 6, arabic: 'الْمُؤْمِنُ', transliteration: 'Al-Mu’min', english: 'The Granter of Security' },
  { num: 7, arabic: 'الْمُهَيْمِنُ', transliteration: 'Al-Muhaymin', english: 'The Guardian & Protector' },
  { num: 8, arabic: 'الْعَزِيزُ', transliteration: 'Al-Aziz', english: 'The Almighty & Invulnerable' },
  { num: 9, arabic: 'الْجَبَّارُ', transliteration: 'Al-Jabbar', english: 'The Compeller' },
  { num: 10, arabic: 'الْمُتَكَبِّرُ', transliteration: 'Al-Mutakabbir', english: 'The Supreme & Majestic' },
  { num: 11, arabic: 'الْخَالِقُ', transliteration: 'Al-Khaliq', english: 'The Creator' },
  { num: 12, arabic: 'الْبَارِئُ', transliteration: 'Al-Bari', english: 'The Evolver & Maker' },
  { num: 13, arabic: 'الْمُصَوِّرُ', transliteration: 'Al-Musawwir', english: 'The Fashioner of Forms' },
  { num: 14, arabic: 'الْغَفَّارُ', transliteration: 'Al-Ghaffar', english: 'The Constant Forgiver' },
  { num: 15, arabic: 'الْقَهَّارُ', transliteration: 'Al-Qahhar', english: 'The All-Subduing' },
  { num: 16, arabic: 'الْوَهَّابُ', transliteration: 'Al-Wahhab', english: 'The Supreme Bestower' },
  { num: 17, arabic: 'الرَّزَّاقُ', transliteration: 'Ar-Razzaq', english: 'The Provider' },
  { num: 18, arabic: 'الْفَتَّاحُ', transliteration: 'Al-Fattah', english: 'The Supreme Opener' },
  { num: 19, arabic: 'الْعَلِيمُ', transliteration: 'Al-’Aleem', english: 'The All-Knowing' },
  { num: 20, arabic: 'الْقَابِضُ', transliteration: 'Al-Qabid', english: 'The Withholder' },
  { num: 21, arabic: 'الْبَاسِطُ', transliteration: 'Al-Basit', english: 'The Extender & Expander' },
  { num: 22, arabic: 'الْخَافِضُ', transliteration: 'Al-Khafid', english: 'The Abaser' },
  { num: 23, arabic: 'الرَّافِعُ', transliteration: 'Ar-Rafi’', english: 'The Exalter' },
  { num: 24, arabic: 'الْمُعِزُّ', transliteration: 'Al-Mu’izz', english: 'The Bestower of Honour' },
  { num: 25, arabic: 'الْمُذِلُّ', transliteration: 'Al-Mudhill', english: 'The Humiliator' },
  { num: 26, arabic: 'السَّمِيعُ', transliteration: 'As-Sami’', english: 'The All-Hearing' },
  { num: 27, arabic: 'الْبَصِيرُ', transliteration: 'Al-Baseer', english: 'The All-Seeing' },
  { num: 28, arabic: 'الْحَكَمُ', transliteration: 'Al-Hakam', english: 'The Impartial Judge' },
  { num: 29, arabic: 'الْعَدْلُ', transliteration: 'Al-’Adl', english: 'The Utterly Just' },
  { num: 30, arabic: 'اللَّطِيفُ', transliteration: 'Al-Lateef', english: 'The Subtle & Kind' },
  { num: 31, arabic: 'الْخَبِيرُ', transliteration: 'Al-Khabeer', english: 'The All-Aware' },
  { num: 32, arabic: 'الْحَلِيمُ', transliteration: 'Al-Haleem', english: 'The Most Forbearing' },
  { num: 33, arabic: 'الْعَظِيمُ', transliteration: 'Al-’Azeem', english: 'The Magnificent' },
  { num: 34, arabic: 'الْغَفُورُ', transliteration: 'Al-Ghafoor', english: 'The Forgiving' },
  { num: 35, arabic: 'الشَّكُورُ', transliteration: 'Ash-Shakoor', english: 'The Most Appreciative' },
  { num: 36, arabic: 'الْعَلِيُّ', transliteration: 'Al-’Aliyy', english: 'The Most High' },
  { num: 37, arabic: 'الْكَبِيرُ', transliteration: 'Al-Kabeer', english: 'The Most Great' },
  { num: 38, arabic: 'الْحَفِيظُ', transliteration: 'Al-Hafeez', english: 'The Preserver' },
  { num: 39, arabic: 'الْمُقِيتُ', transliteration: 'Al-Muqeet', english: 'The Sustainer' },
  { num: 40, arabic: 'الْحَسِيبُ', transliteration: 'Al-Haseeb', english: 'The Reckoner' },
]

export default function ZikrPage() {
  const [activeTab, setActiveTab] = useState('tasbih')

  // Tasbih state
  const [selectedPresetId, setSelectedPresetId] = useState(TASBIH_PRESETS[0].id)
  const [count, setCount] = useState(0)

  const currentPreset =
    TASBIH_PRESETS.find((p) => p.id === selectedPresetId) || TASBIH_PRESETS[0]

  const handleTap = () => {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(30)
      } catch {
        // ignore
      }
    }
    setCount((prev) => prev + 1)
  }

  const handleReset = () => {
    setCount(0)
  }

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setCount(0)
  }

  // 99 Names state
  const [nameIndex, setNameIndex] = useState(0)
  const currentName = NAMES_OF_ALLAH[nameIndex]

  const handleNextName = () => {
    setNameIndex((prev) => (prev + 1) % NAMES_OF_ALLAH.length)
  }

  const handlePrevName = () => {
    setNameIndex((prev) => (prev - 1 + NAMES_OF_ALLAH.length) % NAMES_OF_ALLAH.length)
  }

  return (
    <div className="page-stack">
      {/* Top Segmented Controls */}
      <div className="segmented-control" role="tablist">
        {[
          { id: 'tasbih', label: 'Digital Tasbih' },
          { id: 'names', label: '99 Names of Allah' },
          { id: 'duas', label: 'Ramadan Duas' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`segment-btn ${activeTab === tab.id ? 'segment-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {activeTab === tab.id && (
              <motion.div
                className="segment-indicator"
                layoutId="zikrTabIndicator"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="segment-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Digital Tasbih */}
      {activeTab === 'tasbih' && (
        <GlassCard className="panel-card tasbih-card" static>
          {/* Preset Selector Chips */}
          <div className="tasbih-preset-chips">
            {TASBIH_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`tasbih-chip ${selectedPresetId === preset.id ? 'tasbih-chip--active' : ''}`}
                onClick={() => handleSelectPreset(preset)}
              >
                {preset.transliteration} ({preset.target})
              </button>
            ))}
          </div>

          {/* Active Phrase */}
          <div className="tasbih-active-phrase">
            <h2 className="tasbih-arabic">{currentPreset.arabic}</h2>
            <p className="tasbih-meaning">{currentPreset.transliteration}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              "{currentPreset.meaning}"
            </p>
          </div>

          {/* Big Interactive Tap Button */}
          <motion.button
            type="button"
            className="tasbih-tap-btn"
            onClick={handleTap}
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.02 }}
            aria-label="Tap to count tasbih"
          >
            <span className="tasbih-count-num">{count}</span>
            <span className="tasbih-target-tag">Target: {currentPreset.target}</span>
          </motion.button>

          {/* Control Actions */}
          <div className="tasbih-controls">
            <button type="button" className="tasbih-ctrl-btn" onClick={handleReset}>
              <span>↺ Reset Count</span>
            </button>
            <span className="chip chip--gold">
              Completed: {Math.floor(count / currentPreset.target)} cycles
            </span>
          </div>
        </GlassCard>
      )}

      {/* Tab 2: 99 Names of Allah */}
      {activeTab === 'names' && (
        <GlassCard className="panel-card names-carousel-card" static>
          <span className="name-number-badge">Name {currentName.num} of 99</span>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentName.arabic}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <h2 className="name-arabic-main">{currentName.arabic}</h2>
              <p className="name-english-trans">{currentName.transliteration}</p>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-soft)', fontStyle: 'italic' }}>
                "{currentName.english}"
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="names-nav-row">
            <button type="button" className="names-nav-btn" onClick={handlePrevName}>
              ← Previous
            </button>
            <button
              type="button"
              className="names-nav-btn"
              onClick={() => setNameIndex(Math.floor(Math.random() * NAMES_OF_ALLAH.length))}
            >
              🎲 Random
            </button>
            <button type="button" className="names-nav-btn" onClick={handleNextName}>
              Next →
            </button>
          </div>
        </GlassCard>
      )}

      {/* Tab 3: Ramadan Duas */}
      {activeTab === 'duas' && <DuaCard />}
    </div>
  )
}

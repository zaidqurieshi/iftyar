import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import GlassCard from './GlassCard'

const DUAS_DATA = [
  {
    key: 'sehri',
    title: 'Dua for Fasting (Niyyah for Sahar)',
    arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliteration: "Wa bi-sawmi ghadin nawaytu min shahri Ramadan.",
    english: 'I intend to keep the fast tomorrow for the blessed month of Ramadan.',
    category: 'Sahar',
  },
  {
    key: 'iftar-1',
    title: 'Dua at Iftar (Primary Supplication)',
    arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: "Allahumma inni laka sumtu wa bika aamantu wa 'alayka tawakkaltu wa 'ala rizq-ika aftartu.",
    english: 'O Allah! I fasted for You and I believe in You and I put my trust in You and I break my fast with Your sustenance.',
    category: 'Iftar',
  },
  {
    key: 'iftar-2',
    title: 'Dua upon Breaking Fast (Sunnah Narration)',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: "Dhahaba adh-dhama'u wabtallat al-'urooqu wa thabata al-ajru in sha Allah.",
    english: 'The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
    category: 'Iftar',
  },
  {
    key: 'qadr',
    title: 'Dua for Laylatul Qadr (Night of Decree)',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni.",
    english: 'O Allah, You are Forgiving and love forgiveness, so please forgive me.',
    category: 'Ramadan Nights',
  },
]

export default function DuaCard() {
  const [openKey, setOpenKey] = useState(null)
  const [copiedKey, setCopiedKey] = useState(null)

  const toggleSection = (key) => {
    setOpenKey((prev) => (prev === key ? null : key))
  }

  const handleCopy = async (dua, e) => {
    e.stopPropagation()
    const textToCopy = `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${dua.english}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedKey(dua.key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <GlassCard className="panel-card" static>
      <div className="hero-card__header" style={{ marginBottom: '1rem' }}>
        <div>
          <span className="eyebrow eyebrow--gold">Daily Supplications</span>
          <h2 style={{ fontSize: '1.4rem' }}>Ramadan Duas</h2>
        </div>
        <span className="chip chip--gold">Sunnah & Qur'an</span>
      </div>

      <div className="dua-card-wrap">
        {DUAS_DATA.map((dua) => {
          const isOpen = openKey === dua.key
          const isCopied = copiedKey === dua.key

          return (
            <div
              key={dua.key}
              className={`dua-accordion-item ${isOpen ? 'dua-accordion-item--open' : ''}`}
            >
              <button
                type="button"
                className="dua-accordion-header"
                onClick={() => toggleSection(dua.key)}
                aria-expanded={isOpen}
              >
                <div>
                  <span className="eyebrow eyebrow--emerald" style={{ fontSize: '0.65rem' }}>
                    {dua.category}
                  </span>
                  <h3 className="dua-accordion-title">{dua.title}</h3>
                </div>

                <div className={`dua-accordion-chevron ${isOpen ? 'dua-accordion-chevron--open' : ''}`}>
                  ▼
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    className="dua-accordion-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <div className="dua-arabic-box">
                      <p className="dua-arabic">{dua.arabic}</p>
                      <p className="dua-transliteration">{dua.transliteration}</p>
                      <p className="dua-translation">{dua.english}</p>
                    </div>

                    <div className="dua-actions-row">
                      <button
                        type="button"
                        className="dua-action-btn"
                        onClick={(e) => handleCopy(dua, e)}
                      >
                        {isCopied ? 'Copied! ✨' : 'Copy Dua 📋'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

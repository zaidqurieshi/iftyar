import { useState } from 'react'
import GlassCard from './GlassCard'

export default function DuaCard() {
  const [openSections, setOpenSections] = useState({})

  const handleToggle = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const duas = {
    sehri: [
      {
        arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
        english: 'I intend to keep the fast for tomorrow in the month of Ramadan',
      },
    ],
    iftar: [
      {
        arabic: 'اللَّهُمَّ اِنِّى لَكَ صُمْتُ وَبِكَ امنْتُ وَعَليْكَ تَوَكّلتُ وَعَلى رِزْقِكَ اَفْطَرْتُ',
        english: 'O Allah! I fasted for You and I believe in You and I put my trust in You and I break my fast with Your sustenance',
      },
      {
        arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
        english: 'Thirst has gone, the arteries are moist, and the reward is sure, if Allah wills.',
      },
    ],
  }

  const renderSection = (title, key, duaList) => (
    <div key={key} className="dua-section">
      <button
        className="dua-section-header"
        onClick={() => handleToggle(key)}
        aria-expanded={openSections[key] || false}
        aria-controls={`dua-${key}`}
      >
        <h3>{title}</h3>
        <span className={`dua-toggle ${openSections[key] ? 'dua-toggle--open' : ''}`}>
          ▼
        </span>
      </button>

      {openSections[key] && (
        <div id={`dua-${key}`} className="dua-section-content">
          {duaList.map((dua, index) => (
            <div key={index} className="dua-item">
              <p className="dua-arabic">{dua.arabic}</p>
              <p className="dua-translation">{dua.english}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <GlassCard className="dua-card">
      {renderSection('Dua Sahar', 'sehri', duas.sehri)}
      <div className="dua-divider" />
      {renderSection('Dua Iftar - 1', 'iftar', [duas.iftar[0]])}
      <div className="dua-divider" />
      {renderSection('Dua Iftar - 2', 'iftar-2', [duas.iftar[1]])}
    </GlassCard>
  )
}

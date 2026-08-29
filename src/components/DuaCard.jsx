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
        arabic: 'نَوَيْتُ أَنْ أَصُومَ غَدًا مِنْ شَهْرِ رَمَضَانَ',
        english: '"I intend to fast tomorrow in the month of Ramadan."',
      },
      {
        arabic: 'اللهم بك آمنت وبك توكلت وعلى رزقك اتكلت',
        english: '"O Allah, in You I have faith, in You I put my trust, and on You I rely for sustenance."',
      },
    ],
    iftar: [
      {
        arabic: 'اَللّٰهُمَّ لَكَ صُمْنَا وَبِكَ آمَنَّا وَعَلَى رِزْقِكَ أَفْطَرْنَا',
        english: '"O Allah, for You we fasted, in You we believed, and with Your provision we broke our fast."',
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
      {renderSection('Dua Sehri', 'sehri', duas.sehri)}
      <div className="dua-divider" />
      {renderSection('Dua Iftar', 'iftar', duas.iftar)}
    </GlassCard>
  )
}

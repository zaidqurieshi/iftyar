/**
 * Curated collection of authentic hadiths bundled with the app.
 *
 * The previous implementation fetched a random hadith from
 * `random-hadith-generator.vercel.app`, but that deployment no longer exists
 * (it returns 404 DEPLOYMENT_NOT_FOUND), so the card always showed the same
 * fallback text. These hadiths are well-known narrations with their sources,
 * and one is picked at random on every page load — no network required.
 */
export const HADITH_COLLECTION = [
  { text: 'Actions are judged by intentions, and every person will get what they intended.', source: 'Sahih al-Bukhari 1' },
  { text: 'None of you truly believes until he loves for his brother what he loves for himself.', source: 'Sahih al-Bukhari 13' },
  { text: 'Whoever believes in Allah and the Last Day should speak good or remain silent.', source: 'Sahih al-Bukhari 6018' },
  { text: 'The best among you are those who learn the Qur’an and teach it.', source: 'Sahih al-Bukhari 5027' },
  { text: 'A Muslim is the one from whose tongue and hands other Muslims are safe.', source: 'Sahih al-Bukhari 10' },
  { text: 'The strong person is not the good wrestler; the strong person is the one who controls himself when angry.', source: 'Sahih al-Bukhari 6114' },
  { text: 'Allah does not look at your appearance or your wealth, but He looks at your hearts and your deeds.', source: 'Sahih Muslim 2564' },
  { text: 'The most beloved deeds to Allah are those that are done consistently, even if they are small.', source: 'Sahih al-Bukhari 6464' },
  { text: 'Cleanliness is half of faith.', source: 'Sahih Muslim 223' },
  { text: 'Whoever is not grateful to people is not grateful to Allah.', source: 'Sunan Abi Dawud 4811' },
  { text: 'Smiling in the face of your brother is an act of charity.', source: 'Jami at-Tirmidhi 1956' },
  { text: 'The best of you are those who are best to their families.', source: 'Jami at-Tirmidhi 3895' },
  { text: 'Every act of goodness is charity.', source: 'Sahih al-Bukhari 6021' },
  { text: 'Fear Allah wherever you are, follow a bad deed with a good deed and it will erase it, and treat people with good character.', source: 'Jami at-Tirmidhi 1987' },
  { text: 'Leave what makes you doubt for what does not make you doubt.', source: 'Jami at-Tirmidhi 2518' },
  { text: 'Part of the perfection of a person’s Islam is leaving what does not concern him.', source: 'Jami at-Tirmidhi 2317' },
  { text: 'He is not a believer whose stomach is filled while his neighbour goes hungry.', source: 'Al-Adab Al-Mufrad 112' },
  { text: 'Whoever relieves a believer’s distress in this world, Allah will relieve his distress on the Day of Resurrection.', source: 'Sahih Muslim 2699' },
  { text: 'Allah is beautiful and He loves beauty.', source: 'Sahih Muslim 91' },
  { text: 'Two words are light on the tongue, heavy on the scales, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil-Azim.', source: 'Sahih al-Bukhari 6682' },
  { text: 'Charity does not decrease wealth.', source: 'Sahih Muslim 2588' },
  { text: 'Make things easy and do not make them difficult; give glad tidings and do not repel people.', source: 'Sahih al-Bukhari 69' },
  { text: 'Whoever guides someone to goodness will have a reward equal to the one who acts upon it.', source: 'Sahih Muslim 1893' },
  { text: 'The most complete of the believers in faith are those with the best character.', source: 'Jami at-Tirmidhi 1162' },
  { text: 'Modesty is a branch of faith.', source: 'Sahih al-Bukhari 9' },
  { text: 'Truthfulness leads to righteousness, and righteousness leads to Paradise.', source: 'Sahih al-Bukhari 6094' },
  { text: 'The supplication of a Muslim for his brother in his absence is answered.', source: 'Sahih Muslim 2733' },
  { text: 'Kindness is not found in anything except that it beautifies it, and it is not removed from anything except that it disgraces it.', source: 'Sahih Muslim 2594' },
  { text: 'This world is a prison for the believer and a paradise for the disbeliever.', source: 'Sahih Muslim 2956' },
  { text: 'Take up good deeds only as much as you are able, for the best deeds are those done regularly, even if they are few.', source: 'Sunan Ibn Majah 4240' },
]

/** Pick a truly random hadith — call on every mount so each page load differs. */
export function getRandomHadith() {
  const index = Math.floor(Math.random() * HADITH_COLLECTION.length)
  return HADITH_COLLECTION[index]
}

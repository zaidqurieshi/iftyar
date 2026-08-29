export function formatHijri(date) {
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const day = parts.find((p) => p.type === 'day')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';
  const year = parts.find((p) => p.type === 'year')?.value || '';
  return `${day} ${month} ${year} AH`;
}

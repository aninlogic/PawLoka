export const speciesOptions = [
  ['cat', 'Kucing'],
  ['dog', 'Anjing'],
  ['bird', 'Burung'],
  ['hamster', 'Hamster'],
  ['sugar-glider', 'Sugar glider'],
  ['rabbit', 'Kelinci'],
  ['turtle', 'Kura-kura'],
  ['fish', 'Ikan Hias'],
  ['hedgehog', 'Landak Mini'],
]

export const speciesNames = Object.fromEntries(speciesOptions)

export function formatAge(months) {
  if (months < 12) return `${months} bulan`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  return remainingMonths ? `${years} tahun ${remainingMonths} bulan` : `${years} tahun`
}

export const TYPES = ['Culte spécial', 'Conférence', 'Séminaire', 'Croisade', 'Formation', 'Veillée de prière', 'Baptême', 'Mariage', 'Ordination', 'Funérailles', 'Autre']
export const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
export const MONTHS_SHORT = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']

const pad = (n) => String(n).padStart(2, '0')
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }

// Date de Pâques (algorithme de Meeus/Jones/Butcher)
export function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(y, month - 1, day)
}

export function feasts(y) {
  const p = easter(y)
  return [
    { date: `${y}-01-06`, titre: 'Épiphanie' },
    { date: iso(add(p, -46)), titre: 'Mercredi des Cendres' },
    { date: iso(add(p, -7)), titre: 'Dimanche des Rameaux' },
    { date: iso(add(p, -2)), titre: 'Vendredi saint' },
    { date: iso(p), titre: 'Pâques' },
    { date: iso(add(p, 39)), titre: 'Ascension' },
    { date: iso(add(p, 49)), titre: 'Pentecôte' },
    { date: `${y}-08-15`, titre: 'Assomption' },
    { date: `${y}-11-01`, titre: 'Toussaint' },
    { date: `${y}-12-25`, titre: 'Noël' },
  ]
}

export const dayNum = (s) => Number(s.slice(8, 10))
export const monthIdx = (s) => Number(s.slice(5, 7)) - 1
export const weekday = (s) => new Date(Number(s.slice(0, 4)), monthIdx(s), dayNum(s)).toLocaleDateString('fr-FR', { weekday: 'short' })
export const shortDate = (s) => `${dayNum(s)} ${MONTHS_SHORT[monthIdx(s)]}`

// Une couleur stable par église
export function churchColor(id) {
  let h = 0
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) % 360
  return `hsl(${h} 65% 42%)`
}

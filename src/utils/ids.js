const hash = (s) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return h >>> 0
}
const code6 = (s) => hash(s).toString(36).toUpperCase().padStart(6, '0').slice(-6)

export const codeEglise = (id) => `ANEG-E-${code6('E' + id)}`
export const codeDirigeant = (churchId, nom = '') =>
  `ANEG-D-${code6('D' + churchId + '|' + String(nom).trim().toLowerCase())}`

const USE_HASH = true
export function appUrl(path = '') {
  const base = window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '')
  return USE_HASH ? `${base}/#/${path}` : `${base}/${path}`
}

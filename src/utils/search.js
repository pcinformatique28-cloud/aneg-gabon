import { norm } from '../data/churches'

const mots = (q) => norm(q || '').split(/\s+/).filter(Boolean)
const meule = (c) => norm(`${c.nom} ${c.lieu} ${c.commune} ${c.denomination}`)

// Une église correspond si TOUS les mots saisis apparaissent (nom, quartier, commune, dénomination).
export function matches(c, q) {
  const t = mots(q)
  if (!t.length) return true
  const h = meule(c)
  return t.every((w) => h.includes(w))
}

// Suggestions : églises, puis communes, puis dénominations.
export function suggest(churches, q, max = 7) {
  const t = mots(q)
  if (!t.length) return []
  const ok = (s) => { const n = norm(s || ''); return t.every((w) => n.includes(w)) }
  const out = []
  churches.filter((c) => matches(c, q)).slice(0, 4).forEach((c) =>
    out.push({ key: `e-${c.id}`, kind: 'Église', label: c.nom, sub: [c.commune, c.denomination].filter(Boolean).join(' · '), id: c.id }))
  ;[...new Set(churches.map((c) => c.commune).filter(Boolean))].filter(ok).slice(0, 2).forEach((v) =>
    out.push({ key: `c-${v}`, kind: 'Commune', label: v, value: v }))
  ;[...new Set(churches.map((c) => c.denomination).filter(Boolean))].filter(ok).slice(0, 2).forEach((v) =>
    out.push({ key: `d-${v}`, kind: 'Dénomination', label: v, value: v }))
  return out.slice(0, max)
}

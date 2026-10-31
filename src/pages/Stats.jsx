import ReportPanel from '../components/ReportPanel'
import { useEffect, useMemo, useState } from 'react'
import { useChurches } from '../hooks/useChurches'
import { fetchPublicChurches, fetchEvents } from '../services/store'
import { MONTHS_SHORT, monthIdx } from '../data/calendar'

const COLORS = ['#0a63c9', '#009e60', '#f5c400', '#e4572e', '#7b3fe4', '#17a2b8', '#d6336c', '#6c757d', '#2b8a3e']
const nf = (n) => Number(n).toLocaleString('fr-FR')

const count = (list, fn) => {
  const m = new Map()
  list.forEach((x) => { const k = fn(x); if (k) m.set(k, (m.get(k) || 0) + 1) })
  return [...m].sort((a, b) => b[1] - a[1])
}
const sum = (list, fn) => list.reduce((s, x) => s + (Number(fn(x)) || 0), 0)
const top = (rows, n = 7) => (rows.length <= n ? rows : [...rows.slice(0, n), ['Autres', rows.slice(n).reduce((s, r) => s + r[1], 0)]])

function Donut({ rows, label }) {
  const total = rows.reduce((s, r) => s + r[1], 0)
  if (!total) return <p className="muted">Pas encore de données.</p>
  const R = 15.9155
  let off = 0
  return (
    <div className="st-donut">
      <svg viewBox="0 0 42 42" role="img" aria-label={label}>
        <circle cx="21" cy="21" r={R} fill="none" stroke="#eef2fa" strokeWidth="6" />
        {rows.map(([k, n], i) => {
          const len = (n / total) * 100
          const el = (
            <circle key={k} cx="21" cy="21" r={R} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="6"
              strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={25 - off} />
          )
          off += len
          return el
        })}
        <text x="21" y="22.6" textAnchor="middle" className="st-total">{total}</text>
      </svg>
      <ul className="st-legend">
        {rows.map(([k, n], i) => (
          <li key={k}><i style={{ background: COLORS[i % COLORS.length] }} />{k}<b>{n}</b><small>{Math.round((n / total) * 100)} %</small></li>
        ))}
      </ul>
    </div>
  )
}

function HBars({ rows }) {
  if (!rows.length) return <p className="muted">Pas encore de données.</p>
  const max = Math.max(1, ...rows.map((r) => r[1]))
  return (
    <div className="bars">
      {rows.map(([k, n]) => (
        <div key={k} className="bar-row"><span>{k}</span><div><i style={{ width: `${(n / max) * 100}%` }} /></div><b>{nf(n)}</b></div>
      ))}
    </div>
  )
}

function VBars({ values, labels }) {
  const max = Math.max(1, ...values)
  return (
    <div className="vb">
      {values.map((v, i) => (
        <div key={i} className="vb-col">
          <b>{v || ''}</b>
          <div className="vb-bar"><i style={{ height: `${(v / max) * 100}%` }} /></div>
          <span>{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function StatsBase() {
  const { churches } = useChurches()
  const [reg, setReg] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const year = new Date().getFullYear()

  useEffect(() => {
    let off = false
    Promise.allSettled([fetchPublicChurches(), fetchEvents()]).then(([a, b]) => {
      if (off) return
      if (a.status === 'fulfilled') setReg(a.value)
      if (b.status === 'fulfilled') setEvents(b.value)
      setLoading(false)
    })
    return () => { off = true }
  }, [])

  const d = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const evYear = events.filter((e) => (e.date || '').startsWith(String(year)))
    const parDenom = count(churches, (c) => c.denomination)
    return {
      parDenom,
      parCommune: count(churches, (c) => c.commune),
      communes: new Set(churches.map((c) => c.commune).filter(Boolean)).size,
      fideles: sum(reg, (c) => c.effectif),
      paroisses: sum(reg, (c) => c.nbParoisses),
      ministres: sum(reg, (c) => (c.ministres || []).length),
      parProvince: count(reg, (c) => c.siege?.province),
      langues: count(reg.flatMap((c) => c.langues || []), (x) => x),
      pratiques: top(count(reg.flatMap((c) => c.pratiques || []), (x) => x), 8),
      fidelesEglise: reg.filter((c) => Number(c.effectif) > 0).map((c) => [c.nomOfficiel || 'Église', Number(c.effectif)]).sort((a, b) => b[1] - a[1]).slice(0, 8),
      decennies: count(
        reg.filter((c) => /^\d{4}/.test(c.dateCreation || '')),
        (c) => `${Math.floor(Number(c.dateCreation.slice(0, 4)) / 10) * 10}`,
      ).sort((a, b) => a[0].localeCompare(b[0])).map(([k, n]) => [`${k}s`, n]),
      evYear: evYear.length,
      aVenir: events.filter((e) => (e.date || '') >= today).length,
      evParMois: MONTHS_SHORT.map((_, i) => evYear.filter((e) => monthIdx(e.date) === i).length),
      evParType: count(evYear, (e) => e.type),
      table: parDenom.map(([k, n]) => {
        const r = reg.filter((c) => c.famille === k)
        return [k, n, sum(r, (c) => c.effectif), sum(r, (c) => c.nbParoisses)]
      }),
    }
  }, [churches, reg, events, year])

  const cards = [
    [churches.length, 'lieux de culte'],
    [reg.length, 'églises inscrites'],
    [d.communes, 'communes'],
    [d.parDenom.length, 'dénominations'],
    [nf(d.fideles), 'fidèles déclarés'],
    [nf(d.paroisses), 'paroisses déclarées'],
    [nf(d.ministres), 'ministres déclarés'],
    [d.aVenir, 'événements à venir'],
  ]

  return (
    <div className="stack">
      <h1 className="h1">Statistiques</h1>
      {loading && <p className="muted">Chargement des chiffres…</p>}

      <div className="st-cards">
        {cards.map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}
      </div>

      <section className="panel"><h2>Lieux de culte par dénomination</h2><Donut rows={top(d.parDenom)} label="Dénominations" /></section>
      <section className="panel"><h2>Par commune</h2><HBars rows={top(d.parCommune, 10)} /></section>

      <section className="panel">
        <h2>Détail par dénomination</h2>
        <div className="st-tablewrap">
          <table className="st-table">
            <thead><tr><th>Dénomination</th><th>Lieux</th><th>Fidèles</th><th>Paroisses</th></tr></thead>
            <tbody>
              {d.table.map(([k, a, b, c]) => <tr key={k}><td>{k}</td><td>{a}</td><td>{b ? nf(b) : '—'}</td><td>{c ? nf(c) : '—'}</td></tr>)}
              <tr className="st-sum"><td>Total</td><td>{churches.length}</td><td>{nf(d.fideles)}</td><td>{nf(d.paroisses)}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {reg.length > 0 && (
        <>
          <section className="panel"><h2>Fidèles par église</h2><HBars rows={d.fidelesEglise} /></section>
          <section className="panel"><h2>Églises par province</h2><HBars rows={d.parProvince} /></section>
          <section className="panel"><h2>Langues utilisées</h2><HBars rows={d.langues} /></section>
          <section className="panel"><h2>Pratiques et sacrements</h2><HBars rows={d.pratiques} /></section>
          <section className="panel"><h2>Années de création</h2><HBars rows={d.decennies} /></section>
        </>
      )}

      <section className="panel">
        <h2>Agenda {year} : {d.evYear} événement{d.evYear > 1 ? 's' : ''}</h2>
        <VBars values={d.evParMois} labels={MONTHS_SHORT.map((m) => m.slice(0, 3))} />
        <h2 className="st-sub">Types d’événements</h2>
        <Donut rows={top(d.evParType)} label="Types d’événements" />
      </section>

      <p className="hint">Chiffres calculés en direct à partir de {churches.length} lieux de culte, dont {reg.length} fiche{reg.length > 1 ? 's' : ''} d’église inscrite{reg.length > 1 ? 's' : ''}. Les effectifs, paroisses et ministres sont ceux déclarés par les églises.</p>
    </div>
  )
}

export default function Stats() {
  return (
    <>
      <StatsBase />
      <div className="stack"><ReportPanel /></div>
    </>
  )
}

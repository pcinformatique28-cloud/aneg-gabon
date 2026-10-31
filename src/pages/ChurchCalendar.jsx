import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchChurch, fetchEvents } from '../services/store'
import { MONTHS, feasts, monthIdx } from '../data/calendar'
import EventRow from '../components/EventRow'

export default function ChurchCalendar() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const [church, setChurch] = useState(null)
  const [events, setEvents] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [withFeasts, setWithFeasts] = useState(true)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let off = false
    fetchChurch(id).then((c) => !off && setChurch(c)).catch(() => {})
    fetchEvents(id)
      .then((l) => !off && setEvents(l))
      .catch((e) => !off && setErr(e.code || e.message))
      .finally(() => !off && setLoading(false))
    return () => { off = true }
  }, [id])

  const name = church?.nomOfficiel || events[0]?.churchName || 'Église'
  const mine = !!user && (isAdmin || user.uid === id)
  const items = useMemo(() => {
    const ev = events.filter((e) => (e.date || '').startsWith(String(year)))
    const fe = withFeasts ? feasts(year).map((f) => ({ ...f, fete: true, id: `f-${f.date}` })) : []
    return [...ev, ...fe].sort((a, b) => a.date.localeCompare(b.date) || (a.fete ? -1 : 1))
  }, [events, year, withFeasts])
  const total = events.filter((e) => (e.date || '').startsWith(String(year))).length

  return (
    <div className="stack">
      <h1 className="h1">Calendrier {year}</h1>
      <p><Link to={`/eglise/${id}`}>{name}</Link></p>
      <div className="ag-year">
        <button type="button" onClick={() => setYear((y) => y - 1)} aria-label="Année précédente">‹</button>
        <b>{year}</b>
        <button type="button" onClick={() => setYear((y) => y + 1)} aria-label="Année suivante">›</button>
      </div>
      <label className="ag-check"><input type="checkbox" checked={withFeasts} onChange={(e) => setWithFeasts(e.target.checked)} /> Afficher les fêtes chrétiennes</label>
      {err && <p className="alert" role="alert">Lecture impossible : {err}</p>}
      {loading && <p className="muted">Chargement…</p>}
      <p className="muted">{total} événement{total > 1 ? 's' : ''} en {year}</p>
      {MONTHS.map((m, i) => {
        const list = items.filter((e) => monthIdx(e.date) === i)
        return list.length > 0 && (
          <section key={m} className="ag-month">
            <h2>{m}</h2>
            <div className="list">
              {list.map((e) => (
                <EventRow key={e.id} e={e} showChurch={false} canEdit={mine && !e.fete}
                  onEdit={(ev) => { window.location.hash = `#/agenda?modifier=${ev.id}` }} onDel={() => {}} />
              ))}
            </div>
          </section>
        )
      })}
      {mine && <Link className="btn primary block" to="/agenda">Ajouter ou modifier des événements</Link>}
    </div>
  )
}

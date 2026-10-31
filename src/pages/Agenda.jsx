import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchChurch, fetchEvents, saveEvent, deleteEvent } from '../services/store'
import { TYPES, MONTHS, MONTHS_SHORT, feasts, churchColor, dayNum, monthIdx } from '../data/calendar'
import EventRow from '../components/EventRow'

const blank = () => ({ titre: '', type: 'Culte spécial', date: '', dateFin: '', heure: '', lieu: '', description: '' })

export default function Agenda() {
  const { user, isAdmin } = useAuth()
  const [params, setParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [tab, setTab] = useState('programme')
  const [church, setChurch] = useState(null)
  const [chReady, setChReady] = useState(false)
  const [form, setForm] = useState(null)
  const [formErr, setFormErr] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try { setEvents(await fetchEvents()); setErr('') } catch (e) { setErr(e.code || e.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!user) return
    fetchChurch(user.uid).then(setChurch).catch(() => {}).finally(() => setChReady(true))
  }, [user])

  const canPost = isAdmin || !!church
  const canEdit = useCallback((e) => !!user && (isAdmin || e.ownerUid === user.uid), [user, isAdmin])

  const modifier = params.get('modifier')
  useEffect(() => {
    if (!modifier || !events.length || !user) return
    const ev = events.find((e) => e.id === modifier)
    if (ev && canEdit(ev)) { setForm({ ...blank(), ...ev }); setTab('mien') }
  }, [modifier, events, user, canEdit])

  const items = useMemo(() => {
    const ev = events.filter((e) => (e.date || '').startsWith(String(year)))
    const fe = feasts(year).map((f) => ({ ...f, fete: true, id: `f-${f.date}` }))
    return [...ev, ...fe].sort((a, b) => a.date.localeCompare(b.date) || (a.fete ? -1 : 1))
  }, [events, year])
  const byMonth = useMemo(() => MONTHS.map((_, i) => items.filter((e) => monthIdx(e.date) === i)), [items])

  const rows = useMemo(() => {
    const m = new Map()
    events.forEach((e) => { if (!m.has(e.churchId)) m.set(e.churchId, e.churchName || 'Église') })
    return [...m]
  }, [events])

  const mine = events.filter(canEdit)
  const setF = (patch) => setForm((p) => ({ ...p, ...patch }))
  const fermer = () => { setForm(null); setFormErr(''); if (params.get('modifier')) setParams({}) }

  const enregistrer = async () => {
    if (!form.titre.trim()) return setFormErr('Donne un titre à l’événement.')
    if (!form.date) return setFormErr('Choisis la date.')
    if (form.dateFin && form.dateFin < form.date) return setFormErr('La date de fin précède la date de début.')
    setBusy(true); setFormErr('')
    try {
      const data = {
        titre: form.titre.trim(), type: form.type, date: form.date, dateFin: form.dateFin || '',
        heure: form.heure || '', lieu: (form.lieu || '').trim(), description: (form.description || '').trim(),
      }
      if (form.id) await saveEvent(form.id, data)
      else await saveEvent(null, { ...data, churchId: user.uid, ownerUid: user.uid, churchName: church?.nomOfficiel || 'ANEG' })
      fermer()
      await load()
    } catch (e) {
      setFormErr(`Enregistrement impossible (${e.code || e.message}).`)
    } finally {
      setBusy(false)
    }
  }

  const supprimer = async (e) => {
    if (!window.confirm(`Supprimer « ${e.titre} » ?`)) return
    try { await deleteEvent(e.id); await load() } catch (ex) { setErr(ex.code || ex.message) }
  }

  const editer = (e) => { setForm({ ...blank(), ...e }); setTab('mien') }

  const YearNav = () => (
    <div className="ag-year">
      <button type="button" onClick={() => setYear((y) => y - 1)} aria-label="Année précédente">‹</button>
      <b>{year}</b>
      <button type="button" onClick={() => setYear((y) => y + 1)} aria-label="Année suivante">›</button>
    </div>
  )

  return (
    <div className="stack">
      <h1 className="h1">Agenda</h1>

      <div className="ag-tabs">
        <button type="button" className={`ag-tab${tab === 'programme' ? ' on' : ''}`} onClick={() => setTab('programme')}>Programme</button>
        {isAdmin && <button type="button" className={`ag-tab${tab === 'chrono' ? ' on' : ''}`} onClick={() => setTab('chrono')}>Chronologie</button>}
        {canPost && <button type="button" className={`ag-tab${tab === 'mien' ? ' on' : ''}`} onClick={() => setTab('mien')}>{isAdmin ? 'Gérer' : 'Mes événements'}</button>}
      </div>

      {err && <p className="alert" role="alert">Lecture impossible : {err}</p>}

      {tab === 'programme' && (
        <>
          <YearNav />
          {loading && <p className="muted">Chargement…</p>}
          {byMonth.map((list, i) => list.length > 0 && (
            <section key={MONTHS[i]} className="ag-month">
              <h2>{MONTHS[i]} {year}</h2>
              <div className="list">
                {list.map((e) => <EventRow key={e.id} e={e} canEdit={canEdit(e)} onEdit={editer} onDel={supprimer} />)}
              </div>
            </section>
          ))}
          {!loading && !events.some((e) => (e.date || '').startsWith(String(year))) && (
            <p className="muted">Aucun événement d’église en {year} pour l’instant. Les fêtes chrétiennes sont affichées.</p>
          )}
          {!user && <p className="hint"><Link to="/connexion">Connecte-toi</Link> avec le compte de ton église pour publier des événements.</p>}
          {user && chReady && !canPost && <p className="hint">Pour publier des événements, inscris d’abord ton église (Profil, puis « Inscrire / gérer mon église »).</p>}
        </>
      )}

      {tab === 'chrono' && isAdmin && (
        <>
          <YearNav />
          <div className="tl-wrap">
            <table className="tl">
              <thead>
                <tr><th>Église</th>{MONTHS_SHORT.map((m) => <th key={m}>{m}</th>)}</tr>
              </thead>
              <tbody>
                <tr className="tl-fete">
                  <th>✝ Fêtes chrétiennes</th>
                  {MONTHS.map((_, i) => (
                    <td key={i}>{feasts(year).filter((f) => monthIdx(f.date) === i).map((f) => (
                      <span key={f.date} className="chip fete">{dayNum(f.date)} {f.titre}</span>
                    ))}</td>
                  ))}
                </tr>
                {rows.map(([cid, name]) => (
                  <tr key={cid}>
                    <th style={{ '--c': churchColor(cid) }}><i />{name}</th>
                    {MONTHS.map((_, i) => (
                      <td key={i}>{events.filter((e) => e.churchId === cid && (e.date || '').startsWith(String(year)) && monthIdx(e.date) === i).map((e) => (
                        <button key={e.id} type="button" className="chip" style={{ background: churchColor(cid) }} onClick={() => editer(e)} title={e.type}>
                          {dayNum(e.date)} {e.titre}
                        </button>
                      ))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <p className="muted">Aucune église n’a encore publié d’événement.</p>}
          <p className="hint">Touche un événement pour le modifier. Chaque église a sa couleur.</p>
        </>
      )}

      {tab === 'mien' && canPost && (form ? (
        <div className="panel stack">
          <h2>{form.id ? 'Modifier l’événement' : 'Nouvel événement'}</h2>
          <label className="ag-f">Titre<input className="inp" value={form.titre} onChange={(e) => setF({ titre: e.target.value })} /></label>
          <label className="ag-f">Type
            <select className="inp" value={form.type} onChange={(e) => setF({ type: e.target.value })}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="ag-f">Date<input className="inp" type="date" value={form.date} onChange={(e) => setF({ date: e.target.value })} /></label>
          <label className="ag-f">Jusqu’au (facultatif)<input className="inp" type="date" value={form.dateFin} onChange={(e) => setF({ dateFin: e.target.value })} /></label>
          <label className="ag-f">Heure<input className="inp" type="time" value={form.heure} onChange={(e) => setF({ heure: e.target.value })} /></label>
          <label className="ag-f">Lieu<input className="inp" value={form.lieu} onChange={(e) => setF({ lieu: e.target.value })} /></label>
          <label className="ag-f">Description<textarea className="inp" rows={3} value={form.description} onChange={(e) => setF({ description: e.target.value })} /></label>
          {formErr && <p className="alert" role="alert">{formErr}</p>}
          <div className="btn-row">
            <button type="button" className="btn primary" onClick={enregistrer} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
            <button type="button" className="btn ghost" onClick={fermer}>Annuler</button>
          </div>
          <p className="hint">Dès l’enregistrement, l’événement est visible par tous. Seuls toi et l’administrateur peuvent le modifier.</p>
        </div>
      ) : (
        <>
          <button type="button" className="btn primary block" onClick={() => setForm(blank())}>Ajouter un événement</button>
          {church && <Link className="btn ghost block" to={`/eglise/${user.uid}/calendrier`}>Voir mon calendrier annuel</Link>}
          <div className="list">
            {mine.map((e) => <EventRow key={e.id} e={e} canEdit onEdit={editer} onDel={supprimer} showChurch={isAdmin} />)}
          </div>
          {!mine.length && <p className="muted">Aucun événement enregistré.</p>}
        </>
      ))}
    </div>
  )
}

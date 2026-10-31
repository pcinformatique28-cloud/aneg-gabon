import { Link } from 'react-router-dom'
import { churchColor, dayNum, weekday, shortDate } from '../data/calendar'

export default function EventRow({ e, canEdit, onEdit, onDel, showChurch = true }) {
  if (e.fete) {
    return (
      <div className="ev fete">
        <div className="ev-day"><b>{dayNum(e.date)}</b><small>{weekday(e.date)}</small></div>
        <div className="ev-body"><b>✝ {e.titre}</b><small className="muted block">Fête chrétienne</small></div>
      </div>
    )
  }
  return (
    <div className="ev" style={{ '--c': churchColor(e.churchId) }}>
      <div className="ev-day"><b>{dayNum(e.date)}</b><small>{weekday(e.date)}</small></div>
      <div className="ev-body">
        <b>{e.titre}</b>
        <small className="muted block">
          {[e.type, e.heure, e.lieu].filter(Boolean).join(' · ')}
          {e.dateFin ? ` · jusqu’au ${shortDate(e.dateFin)}` : ''}
        </small>
        {e.description && <p className="ev-desc">{e.description}</p>}
        {showChurch && <Link className="ev-church" to={`/eglise/${e.churchId}/calendrier`}>{e.churchName || 'Église'} · calendrier annuel</Link>}
      </div>
      {canEdit && (
        <div className="ev-act">
          <button type="button" onClick={() => onEdit(e)} aria-label="Modifier">✎</button>
          <button type="button" onClick={() => onDel(e)} aria-label="Supprimer">✕</button>
        </div>
      )}
    </div>
  )
}

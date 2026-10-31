import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Bell({ a, guest = false }) {
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const n = a.unread.length
  const unreadIds = new Set(a.unread.map((x) => x.id))
  const go = (x) => { a.markRead(x.id); setOpen(false); nav(x.link) }
  return (
    <div className="bell-wrap">
      <button
        type="button"
        className="icon-btn bell-btn"
        aria-label={n > 0 ? `Notifications, ${n} non lues` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {n > 0 && <i className="nav-badge">{n > 99 ? '99+' : n}</i>}
      </button>
      {open && (
        <>
          <button type="button" className="bell-scrim" aria-label="Fermer" onClick={() => setOpen(false)} />
          <div className="bell-panel" role="dialog" aria-label="Notifications">
            <div className="bell-head">
              <b>Notifications</b>
              {n > 0 && <button type="button" onClick={a.markAll}>Tout marquer comme lu</button>}
            </div>
            {guest && (
              <div className="bell-empty">
                Connecte-toi pour recevoir tes notifications.
                <button type="button" className="btn primary block" style={{ marginTop: 10 }} onClick={() => { setOpen(false); nav('/connexion') }}>Se connecter</button>
              </div>
            )}
            {!guest && a.items.length === 0 && <p className="bell-empty">Rien de nouveau.</p>}
            {a.items.map((x) => (
              <button type="button" key={x.id} className={'bell-item' + (unreadIds.has(x.id) ? ' unread' : '')} onClick={() => go(x)}>
                {x.title}
                <small>{x.body}</small>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

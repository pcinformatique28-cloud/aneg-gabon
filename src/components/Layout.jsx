import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { avatarUrl } from '../cloudinary'
import Bell from './Bell'
import { useAlerts } from '../hooks/useAlerts'
import { buildSources } from '../services/alertSources'
import { initFx, ring, setBadge } from '../utils/alertFx'
import { syncPush } from '../utils/push'
import {
  IconMenu, IconClose, IconUser, IconHome, IconSearch, IconPin, IconCalendar,
  IconChurch, IconLogout, IconLogin, IconInfo, IconChart, IconShield,
} from './Icons'

const LOGO = `${import.meta.env.BASE_URL}aneg-logo.png`

const BOTTOM = [
  { to: '/', label: 'Accueil', Icon: IconHome, end: true },
  { to: '/profil', label: 'Profil', Icon: IconUser },
  { to: '/annuaire', label: 'Annuaire', Icon: IconChurch },
  { to: '/carte', label: 'Carte', Icon: IconPin },
  { to: '/agenda', label: 'Agenda', Icon: IconCalendar },
]

function Avatar({ size = 36 }) {
  const { user, photo, nom } = useAuth()
  if (!user) return <IconUser size={size - 10} />
  if (photo) return <img className="avatar-img" src={avatarUrl(photo, size * 2)} alt={nom || 'Profil'} width={size} height={size} />
  const initiale = (nom || user.email || '?').trim().charAt(0).toUpperCase()
  return <span className="avatar-initial" style={{ width: size, height: size }}>{initiale}</span>
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { user, nom, role, logout, isAdmin } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => { initFx(`${import.meta.env.BASE_URL}sounds/notif.wav`) }, [])
  const alerts = useAlerts(user ? `${user.uid}:${isAdmin ? 'a' : 'u'}` : '', () => buildSources(user.uid, isAdmin), ring)
  const nAlerts = alerts.unread.length
  const nAdmin = alerts.unread.filter((x) => x.link === '/admin').length
  useEffect(() => { setBadge(nAlerts) }, [nAlerts])
  useEffect(() => { if (user) syncPush(user.uid) }, [user])

  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  const sortir = async () => { await logout(); setOpen(false); navigate('/') }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="flag-strip" aria-hidden="true"><i /><i /><i /></div>
        <div className="topbar-row">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Ouvrir le menu" aria-expanded={open}>
            <IconMenu size={26} />
          </button>
          <Link to="/" className="brand" aria-label="ANEG, accueil">
            <img src={LOGO} alt="" width="40" height="40" />
            <span>ANEG</span>
          </Link>
          <div className="right-cluster">
            <Bell a={alerts} guest={!user} />
            {isAdmin && (
              <Link to="/admin" className="icon-btn admin-btn" aria-label="Administration" title="Administration">
                <IconShield size={24} />{nAdmin > 0 && <i className="nav-badge">{nAdmin > 99 ? '99+' : nAdmin}</i>}
              </Link>
            )}
            <Link
              to={user ? '/profil' : '/connexion'}
              className={`icon-btn account ${user ? 'has-user' : ''}`}
              aria-label={user ? 'Mon profil' : 'Se connecter'}
            >
              <Avatar size={38} />
            </Link>
          </div>
        </div>
      </header>

      <div className={`scrim ${open ? 'show' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Menu latéral">
        <div className="drawer-head">
          <img src={LOGO} alt="" width="56" height="56" />
          <div>
            <strong>ANEG</strong>
            <small>Annuaire National des Églises du Gabon</small>
          </div>
          <button className="icon-btn dark" onClick={() => setOpen(false)} aria-label="Fermer le menu"><IconClose /></button>
        </div>

        <div className="drawer-user">
          {user ? (
            <Link to="/profil" className="drawer-card">
              <Avatar size={46} />
              <span><b>{nom || 'Mon compte'}</b><small>{user.email} · {role}</small></span>
            </Link>
          ) : (
            <Link to="/connexion" className="btn primary block"><IconLogin size={20} /> Se connecter / S’inscrire</Link>
          )}
        </div>

        <nav className="drawer-nav">
          <NavLink to="/" end><IconHome /> Accueil</NavLink>
          <NavLink to="/annuaire"><IconChurch /> Annuaire des églises</NavLink>
          <NavLink to="/carte"><IconPin /> Carte interactive</NavLink>
          <NavLink to="/agenda"><IconCalendar /> Agenda</NavLink>
          <NavLink to="/statistiques"><IconChart /> Statistiques</NavLink>
          <NavLink to="/a-propos"><IconInfo /> À propos</NavLink>
          <NavLink to="/profil"><IconUser /> Mon profil</NavLink>
          <NavLink to="/inscrire-eglise"><IconChurch /> Inscrire / gérer mon église</NavLink>
          {isAdmin && <NavLink to="/admin" className="admin-link"><IconShield /> Administration</NavLink>}
        </nav>

        {user && (
          <button className="drawer-out" onClick={sortir}><IconLogout /> Se déconnecter</button>
        )}
        <p className="drawer-foot">Créé par PC-INFORMATIQUE</p>
      </aside>

      <main className="page"><Outlet /></main>

      <footer className="footer">ANEG · Créé par PC-INFORMATIQUE</footer>

      <nav className="bottom-nav" aria-label="Navigation principale">
        {BOTTOM.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <em className="nav-ico"><Icon size={24} />{to === '/profil' && nAlerts > 0 && <i className="nav-badge">{nAlerts > 99 ? '99+' : nAlerts}</i>}</em>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

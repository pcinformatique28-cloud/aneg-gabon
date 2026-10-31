import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CHURCHES, COMMUNES } from '../data/churches'
import ChurchCard from '../components/ChurchCard'
import { IconSearch, IconChurch, IconPin, IconCalendar } from '../components/Icons'

const LOGO = `${import.meta.env.BASE_URL}aneg-logo.png`

export default function Home() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const chercher = (e) => {
    e.preventDefault()
    navigate(q.trim() ? `/annuaire?q=${encodeURIComponent(q.trim())}` : '/annuaire')
  }

  return (
    <div className="stack center">
      <img className="hero-logo" src={LOGO} alt="ANEG – Annuaire National des Églises du Gabon" />
      <h1 className="title">Annuaire National des Églises du Gabon</h1>
      <p className="slogan">Référencer · Informer · Connecter</p>

      <form className="searchbar" onSubmit={chercher} role="search">
        <IconSearch size={20} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Église, quartier, dénomination…"
          aria-label="Rechercher une église"
        />
        <button className="btn success" type="submit">Chercher</button>
      </form>

      <div className="stats-row">
        <div><b>{CHURCHES.length}</b><span>lieux de culte</span></div>
        <div><b>{COMMUNES.length}</b><span>communes</span></div>
        <div><b>{new Set(CHURCHES.map((c) => c.denomination)).size}</b><span>dénominations</span></div>
      </div>

      <div className="tiles">
        <Link to="/annuaire" className="tile"><IconChurch size={28} /><b>Annuaire</b><span>Trouver une église par commune, quartier ou dénomination.</span></Link>
        <Link to="/carte" className="tile"><IconPin size={28} /><b>Carte</b><span>Voir les églises autour de moi.</span></Link>
        <Link to="/agenda" className="tile"><IconCalendar size={28} /><b>Agenda</b><span>Cultes, conférences, séminaires et croisades.</span></Link>
      </div>

      <section className="section left">
        <div className="section-head"><h2>À Libreville, Akanda et Owendo</h2><Link to="/annuaire">Tout voir</Link></div>
        <div className="list">
          {CHURCHES.slice(0, 4).map((c) => <ChurchCard key={c.id} church={c} />)}
        </div>
      </section>
    </div>
  )
}

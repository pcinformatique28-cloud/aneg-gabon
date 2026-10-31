import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useChurches } from '../hooks/useChurches'
import ChurchCard from '../components/ChurchCard'
import SearchBox from '../components/SearchBox'
import { matches } from '../utils/search'
import { IconChurch, IconPin, IconCalendar } from '../components/Icons'

const LOGO = `${import.meta.env.BASE_URL}aneg-logo.png`

export default function Home() {
  const { churches, loading } = useChurches()
  const [q, setQ] = useState('')
  const liste = useRef(null)
  const resultats = useMemo(() => churches.filter((c) => matches(c, q)), [churches, q])
  const aller = () => liste.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="stack center">
      <img className="hero-logo" src={LOGO} alt="ANEG – Annuaire National des Églises du Gabon" />
      <h1 className="title">Annuaire National des Églises du Gabon</h1>
      <p className="slogan">Référencer · Informer · Connecter</p>

      <SearchBox value={q} onChange={setQ} onSubmit={aller} churches={churches} />

      <div className="stats-row">
        <div><b>{churches.length}</b><span>lieux de culte</span></div>
        <div><b>{new Set(churches.map((c) => c.commune).filter(Boolean)).size}</b><span>communes</span></div>
        <div><b>{new Set(churches.map((c) => c.denomination)).size}</b><span>dénominations</span></div>
      </div>

      <div className="tiles">
        <Link to="/annuaire" className="tile"><IconChurch size={28} /><b>Annuaire</b><span>Trouver une église par commune, quartier ou dénomination.</span></Link>
        <Link to="/carte" className="tile"><IconPin size={28} /><b>Carte</b><span>Voir les églises autour de moi.</span></Link>
        <Link to="/agenda" className="tile"><IconCalendar size={28} /><b>Agenda</b><span>Cultes, conférences, séminaires et croisades.</span></Link>
      </div>

      <section className="section left" ref={liste}>
        <div className="section-head">
          <h2>{q.trim() ? 'Résultats' : 'Toutes les églises'} ({loading ? '…' : resultats.length})</h2>
          <Link to="/annuaire">Annuaire</Link>
        </div>
        <div className="list">
          {resultats.map((c) => <ChurchCard key={c.id} church={c} />)}
          {!loading && !resultats.length && <p className="empty">Aucune église ne correspond à cette recherche.</p>}
        </div>
      </section>
    </div>
  )
}

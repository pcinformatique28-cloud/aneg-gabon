import { Link } from 'react-router-dom'
import { CHURCHES, COMMUNES, DENOMINATIONS } from '../data/churches'

export function Agenda() {
  return (
    <div className="stack">
      <h1 className="h1">Agenda</h1>
      <div className="panel">
        <p>Aucun événement n’est encore publié.</p>
        <p className="muted">Les églises validées pourront y annoncer leurs cultes, conférences, séminaires, croisades et formations.</p>
      </div>
    </div>
  )
}

export function Stats() {
  const par = (list, key) => list.map((k) => [k, CHURCHES.filter((c) => c[key] === k).length])
  const Bars = ({ rows }) => {
    const max = Math.max(1, ...rows.map((r) => r[1]))
    return (
      <div className="bars">
        {rows.map(([k, n]) => (
          <div key={k} className="bar-row"><span>{k}</span><div><i style={{ width: `${(n / max) * 100}%` }} /></div><b>{n}</b></div>
        ))}
      </div>
    )
  }
  return (
    <div className="stack">
      <h1 className="h1">Statistiques</h1>
      <section className="panel"><h2>Par commune</h2><Bars rows={par(COMMUNES, 'commune')} /></section>
      <section className="panel"><h2>Par dénomination</h2><Bars rows={par(DENOMINATIONS, 'denomination')} /></section>
      <p className="hint">Chiffres basés sur les {CHURCHES.length} lieux de culte référencés à ce jour.</p>
    </div>
  )
}

export function About() {
  return (
    <div className="stack">
      <h1 className="h1">À propos</h1>
      <div className="panel">
        <p>ANEG, l’Annuaire National des Églises du Gabon, a pour but de <b>référencer</b>, <b>informer</b> et <b>connecter</b> les communautés chrétiennes du pays.</p>
        <p>Les fiches affichées viennent pour l’instant de sources publiques et portent le statut « Référencée ». Elles seront confirmées lorsque chaque église créera son compte.</p>
        <p className="muted">Créé par PC-INFORMATIQUE.</p>
        <Link className="btn primary" to="/connexion">Inscrire mon église</Link>
      </div>
    </div>
  )
}

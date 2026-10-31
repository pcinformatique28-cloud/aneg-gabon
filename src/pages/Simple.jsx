import { Link } from 'react-router-dom'
import { useChurches } from '../hooks/useChurches'

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
  const { churches } = useChurches()
  const uniq = (key) => [...new Set(churches.map((c) => c[key]).filter(Boolean))]
  const par = (list, key) => list.map((k) => [k, churches.filter((c) => c[key] === k).length])
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
      <section className="panel"><h2>Par commune</h2><Bars rows={par(uniq('commune'), 'commune')} /></section>
      <section className="panel"><h2>Par dénomination</h2><Bars rows={par(uniq('denomination'), 'denomination')} /></section>
      <p className="hint">Chiffres basés sur les {churches.length} lieux de culte référencés à ce jour.</p>
    </div>
  )
}

export function About() {
  return (
    <div className="stack">
      <h1 className="h1">À propos</h1>
      <section className="about-block">
        <p>ANEG, l’Annuaire National des Églises du Gabon, a pour but de référencer, d’informer et de connecter les communautés chrétiennes du pays. Il réunit au même endroit les églises, leurs lieux de culte, leurs responsables et leurs activités.</p>
        <p>Chaque église inscrite présente son identité, sa doctrine, son histoire, ses paroisses et ses ministres. Les documents administratifs, comme l’autorisation d’exercer délivrée par le ministère de l’Intérieur, sont examinés par l’équipe ANEG et ne sont jamais affichés au public.</p>
        <p>Les fiches affichées pour l’instant viennent de sources publiques et portent le statut « Référencée ». Elles seront confirmées lorsque chaque église créera son compte et fournira ses informations officielles.</p>
        <p>Une plateforme au service de la foi, de l’unité et du développement spirituel du Gabon. Créée par PC-INFORMATIQUE.</p>
      </section>
      <Link className="btn primary block" to="/inscrire-eglise">Inscrire mon église</Link>
    </div>
  )
}

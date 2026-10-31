import { Link, useParams } from 'react-router-dom'
import { getChurch, itineraire } from '../data/churches'
import { IconNavigate, IconPin } from '../components/Icons'

export default function ChurchDetail() {
  const { id } = useParams()
  const c = getChurch(id)
  if (!c) {
    return (
      <div className="stack">
        <h1 className="h1">Église introuvable</h1>
        <Link className="btn primary" to="/annuaire">Retour à l’annuaire</Link>
      </div>
    )
  }
  const route = itineraire(c)

  return (
    <div className="stack">
      <Link to="/annuaire" className="back">← Annuaire</Link>
      <h1 className="h1">{c.nom}</h1>
      <div className="tags">
        <span className="tag denom">{c.denomination}</span>
        <span className="tag">{c.statut}</span>
      </div>

      <section className="panel">
        <h2><IconPin size={18} /> Localisation</h2>
        <p>{c.lieu}</p>
        <p className="muted">{c.commune}, Gabon</p>
        {c.precision === 'quartier' && <p className="hint">Position approximative (niveau quartier). L’église pourra la préciser depuis son compte.</p>}
        {route && <a className="btn primary" href={route} target="_blank" rel="noreferrer"><IconNavigate size={18} /> Itinéraire</a>}
        {c.lat != null && <Link className="btn ghost" to={`/carte?focus=${c.id}`}>Voir sur la carte</Link>}
      </section>

      {c.note && (
        <section className="panel"><h2>Présentation</h2><p>{c.note}</p></section>
      )}

      <section className="panel">
        <h2>Statut de vérification</h2>
        <p><b>{c.statut}</b> : les informations viennent de sources publiques et n’ont pas encore été confirmées par l’église. L’équipe ANEG les vérifiera après l’inscription de l’église.</p>
      </section>

      <section className="panel">
        <h2>Sources</h2>
        <ul className="sources">
          {c.source.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.titre}</a></li>)}
        </ul>
      </section>
    </div>
  )
}

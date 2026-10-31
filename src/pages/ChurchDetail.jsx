import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChurch, itineraire } from '../data/churches'
import { fetchChurch } from '../services/store'
import { STATUTS } from '../data/refs'
import { IconNavigate, IconPin } from '../components/Icons'

const Text = ({ children }) => (children ? <p className="just">{children}</p> : null)

function Seed({ c }) {
  const route = itineraire(c)
  return (
    <>
      <section className="panel wide">
        <h2><IconPin size={18} /> Localisation</h2>
        <p>{c.lieu}</p>
        <p className="muted">{c.commune}, Gabon</p>
        {c.precision === 'quartier' && <p className="hint">Position approximative (niveau quartier). L’église pourra la préciser depuis son compte.</p>}
        <div className="btn-row">
          {route && <a className="btn primary" href={route} target="_blank" rel="noreferrer"><IconNavigate size={18} /> Itinéraire</a>}
          {c.lat != null && <Link className="btn ghost" to={`/carte?focus=${c.id}`}>Voir sur la carte</Link>}
        </div>
      </section>
      {c.note && <section className="panel wide"><h2>Présentation</h2><Text>{c.note}</Text></section>}
      <section className="panel wide">
        <h2>Statut de vérification</h2>
        <Text>{`${c.statut} : les informations viennent de sources publiques et n’ont pas encore été confirmées par l’église. L’équipe ANEG les vérifiera après l’inscription de l’église.`}</Text>
      </section>
      <section className="panel wide">
        <h2>Sources</h2>
        <ul className="sources">{c.source.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.titre}</a></li>)}</ul>
      </section>
    </>
  )
}

function Rich({ c }) {
  const s = c.siege || {}
  const hasGps = Number.isFinite(parseFloat(s.lat)) && Number.isFinite(parseFloat(s.lng))
  const route = hasGps ? `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}` : null
  const ministres = c.ministres || []
  const parLieu = useMemo(() => {
    const m = {}
    ministres.forEach((x) => { m[x.lieu || 'Siège'] = (m[x.lieu || 'Siège'] || 0) + 1 })
    return m
  }, [ministres])
  const ct = c.contacts || {}

  return (
    <>
      {(c.slogan || c.histoire || c.vision || c.mission) && (
        <section className="panel wide">
          <h2>Présentation</h2>
          {c.slogan && <p className="slogan-in">« {c.slogan} »</p>}
          <Text>{c.histoire}</Text>
          {c.vision && <><h3 className="sub">Vision</h3><Text>{c.vision}</Text></>}
          {c.mission && <><h3 className="sub">Mission</h3><Text>{c.mission}</Text></>}
        </section>
      )}

      <section className="panel wide">
        <h2>Fondation</h2>
        <dl className="dl">
          <dt>Date de création</dt><dd>{c.dateCreation ? new Date(c.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</dd>
          {c.lieuCreation && <><dt>Lieu de création</dt><dd>{c.lieuCreation}</dd></>}
          {(c.fondateurs || []).length > 0 && <><dt>Fondateurs</dt><dd>{c.fondateurs.map((f) => f.nom).join(', ')}</dd></>}
        </dl>
      </section>

      <section className="panel wide">
        <h2>Doctrine et pratiques</h2>
        <Text>{c.confession}</Text>
        <dl className="dl">
          {c.livreReference && <><dt>Livre de référence</dt><dd>{c.livreReference}</dd></>}
          {(c.pratiques || []).length > 0 && <><dt>Pratiques</dt><dd>{c.pratiques.join(', ')}</dd></>}
          {(c.langues || []).length > 0 && <><dt>Langues de culte</dt><dd>{c.langues.join(', ')}</dd></>}
          {c.affiliation && <><dt>Affiliation</dt><dd>{c.affiliation}</dd></>}
        </dl>
      </section>

      <section className="panel wide">
        <h2><IconPin size={18} /> Lieu de culte central</h2>
        <p>{[s.adresse, s.quartier, s.commune].filter(Boolean).join(', ')}</p>
        {s.province && <p className="muted">Province : {s.province}</p>}
        {(c.cultes || []).length > 0 && (
          <ul className="sources nolist">
            {c.cultes.map((x, i) => <li key={i}><b>{x.jour}</b> {x.heure} · {x.type}</li>)}
          </ul>
        )}
        <div className="btn-row">
          {route && <a className="btn primary" href={route} target="_blank" rel="noreferrer"><IconNavigate size={18} /> Itinéraire</a>}
          {hasGps && <Link className="btn ghost" to={`/carte?focus=${c.id}`}>Voir sur la carte</Link>}
        </div>
      </section>

      <section className="panel wide">
        <h2>Organisation</h2>
        <dl className="dl">
          {c.autorite?.nom && <><dt>{c.autorite.titre || 'Autorité dirigeante'}</dt><dd>{c.autorite.nom}</dd></>}
          {c.nbParoisses != null && <><dt>Paroisses et annexes</dt><dd>{c.nbParoisses}</dd></>}
          {c.effectif != null && <><dt>Fidèles (approx.)</dt><dd>{c.effectif}</dd></>}
        </dl>
        {(c.paroisses || []).length > 0 && (
          <ul className="sources nolist">
            {c.paroisses.map((p, i) => <li key={i}><b>{p.nom}</b><small className="block muted">{[p.quartier, p.commune].filter(Boolean).join(', ')}{p.responsable ? ` · ${p.responsable}` : ''}</small></li>)}
          </ul>
        )}
      </section>

      {ministres.length > 0 && (
        <section className="panel wide">
          <h2>Ministres et prédicateurs ({ministres.length})</h2>
          <p className="hint">Par lieu de culte : {Object.entries(parLieu).map(([l, n]) => `${l} (${n})`).join(' · ')}</p>
          {ministres.map((m, i) => (
            <div className="minister" key={i}>
              <h3>{m.nom}</h3>
              <p className="muted">{[m.titre, m.lieu, m.debutMinistere ? `ministère depuis ${m.debutMinistere}` : ''].filter(Boolean).join(' · ')}</p>
              <Text>{m.bio}</Text>
              {(m.dateOrdination || m.autoriteOrdinante) && (
                <p className="hint">Ordination : {[m.dateOrdination, m.autoriteOrdinante].filter(Boolean).join(' · ')}</p>
              )}
              {(m.formations || []).length > 0 && (
                <ul className="sources">
                  {m.formations.map((x, k) => (
                    <li key={k}>{[x.intitule, x.etablissement, x.pays, x.annee].filter(Boolean).join(', ')}{x.diplome ? ` (${x.diplome})` : ''} <span className="tag">Déclaré</span></li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <p className="hint">« Déclaré » signifie que l’information a été fournie par l’église ; ANEG ne juge pas la valeur spirituelle d’un ministre.</p>
        </section>
      )}

      {(ct.telephone || ct.email || ct.siteWeb || ct.facebook) && (
        <section className="panel wide">
          <h2>Contacts</h2>
          <dl className="dl">
            {ct.telephone && <><dt>Téléphone</dt><dd><a href={`tel:${ct.telephone}`}>{ct.telephone}</a></dd></>}
            {ct.email && <><dt>E-mail</dt><dd><a href={`mailto:${ct.email}`}>{ct.email}</a></dd></>}
            {ct.siteWeb && <><dt>Site web</dt><dd><a href={ct.siteWeb} target="_blank" rel="noreferrer">{ct.siteWeb}</a></dd></>}
            {ct.facebook && <><dt>Réseau social</dt><dd><a href={ct.facebook} target="_blank" rel="noreferrer">{ct.facebook}</a></dd></>}
          </dl>
        </section>
      )}
    </>
  )
}

export default function ChurchDetail() {
  const { id } = useParams()
  const seed = getChurch(id)
  const [remote, setRemote] = useState(null)
  const [state, setState] = useState(seed ? 'ok' : 'loading')

  useEffect(() => {
    if (seed) return
    let off = false
    setState('loading')
    fetchChurch(id)
      .then((c) => { if (!off) { setRemote(c); setState(c ? 'ok' : 'none') } })
      .catch(() => !off && setState('none'))
    return () => { off = true }
  }, [id, seed])

  if (state === 'loading') return <p className="muted">Chargement…</p>
  if (state === 'none' || (!seed && !remote)) {
    return (
      <div className="stack">
        <h1 className="h1">Église introuvable</h1>
        <p className="muted">Cette fiche n’existe pas ou n’est pas publiée.</p>
        <Link className="btn primary" to="/annuaire">Retour à l’annuaire</Link>
      </div>
    )
  }

  const nom = seed ? seed.nom : remote.nomOfficiel
  const denom = seed ? seed.denomination : remote.famille
  const statut = seed ? seed.statut : STATUTS[remote.status] || 'Référencée'

  return (
    <div className="stack">
      <Link to="/annuaire" className="back">← Annuaire</Link>
      <div className="detail-head">
        {!seed && remote.logoUrl && <img src={remote.logoUrl} alt="" className="detail-logo" />}
        <h1 className="h1">{nom}</h1>
      </div>
      <div className="tags">
        {denom && <span className="tag denom">{denom}</span>}
        {!seed && remote.denomination && <span className="tag">{remote.denomination}</span>}
        <span className="tag">{statut}</span>
      </div>
      {!seed && <Link className="btn primary block" to={`/eglise/${id}/calendrier`}>Voir le calendrier annuel de cette église</Link>}
      {seed ? <Seed c={seed} /> : <Rich c={remote} />}
    </div>
  )
}

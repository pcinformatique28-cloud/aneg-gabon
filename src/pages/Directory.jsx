import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CHURCHES, COMMUNES, DENOMINATIONS, norm } from '../data/churches'
import ChurchCard from '../components/ChurchCard'
import { IconSearch } from '../components/Icons'

export default function Directory() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const commune = params.get('commune') || ''
  const denom = params.get('denom') || ''

  const set = (k, v) => {
    const next = new URLSearchParams(params)
    v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }

  const resultats = useMemo(() => {
    const n = norm(q)
    return CHURCHES.filter((c) =>
      (!commune || c.commune === commune) &&
      (!denom || c.denomination === denom) &&
      (!n || norm(`${c.nom} ${c.lieu} ${c.commune} ${c.denomination}`).includes(n)),
    )
  }, [q, commune, denom])

  return (
    <div className="stack">
      <h1 className="h1">Annuaire des églises</h1>

      <label className="searchbar single">
        <IconSearch size={20} />
        <input type="search" value={q} onChange={(e) => set('q', e.target.value)} placeholder="Nom, quartier, dénomination…" aria-label="Rechercher" />
      </label>

      <div className="filters">
        <select value={commune} onChange={(e) => set('commune', e.target.value)} aria-label="Commune">
          <option value="">Toutes les communes</option>
          {COMMUNES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={denom} onChange={(e) => set('denom', e.target.value)} aria-label="Dénomination">
          <option value="">Toutes les dénominations</option>
          {DENOMINATIONS.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      <p className="muted">{resultats.length} résultat{resultats.length > 1 ? 's' : ''}</p>
      <div className="list">
        {resultats.map((c) => <ChurchCard key={c.id} church={c} />)}
        {!resultats.length && <p className="empty">Aucune église ne correspond à cette recherche.</p>}
      </div>
    </div>
  )
}

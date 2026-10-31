import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useChurches } from '../hooks/useChurches'
import ChurchCard from '../components/ChurchCard'
import SearchBox from '../components/SearchBox'
import { matches } from '../utils/search'

export default function Directory() {
  const { churches, loading, error } = useChurches()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const commune = params.get('commune') || ''
  const denom = params.get('denom') || ''

  const set = (k, v) => {
    const next = new URLSearchParams(params)
    v ? next.set(k, v) : next.delete(k)
    setParams(next, { replace: true })
  }

  const communes = useMemo(() => [...new Set(churches.map((c) => c.commune).filter(Boolean))].sort(), [churches])
  const denoms = useMemo(() => [...new Set(churches.map((c) => c.denomination).filter(Boolean))].sort(), [churches])

  const resultats = useMemo(
    () => churches.filter((c) => (!commune || c.commune === commune) && (!denom || c.denomination === denom) && matches(c, q)),
    [churches, q, commune, denom],
  )

  return (
    <div className="stack">
      <h1 className="h1">Annuaire des églises</h1>

      <SearchBox single button={false} value={q} onChange={(v) => set('q', v)} churches={churches} />

      <div className="filters">
        <select value={commune} onChange={(e) => set('commune', e.target.value)} aria-label="Commune">
          <option value="">Toutes les communes</option>
          {communes.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={denom} onChange={(e) => set('denom', e.target.value)} aria-label="Dénomination">
          <option value="">Toutes les dénominations</option>
          {denoms.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      <p className="muted">{loading ? 'Chargement…' : `${resultats.length} résultat${resultats.length > 1 ? 's' : ''}`}</p>
      {error && <p className="empty">Lecture des fiches impossible : {error}</p>}
      <div className="list">
        {resultats.map((c) => <ChurchCard key={c.id} church={c} />)}
        {!loading && !resultats.length && <p className="empty">Aucune église ne correspond à cette recherche.</p>}
      </div>
    </div>
  )
}

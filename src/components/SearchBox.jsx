import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch } from './Icons'
import { suggest } from '../utils/search'

export default function SearchBox({ value, onChange, onSubmit, churches, button = true, single = false }) {
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const list = useMemo(() => (open ? suggest(churches, value) : []), [open, churches, value])

  const pick = (s) => {
    setOpen(false)
    if (s.id) nav(`/eglise/${s.id}`)
    else onChange(s.value)
  }

  return (
    <div className="sb-wrap">
      <form
        className={`searchbar${single ? ' single' : ''}`}
        role="search"
        onSubmit={(e) => { e.preventDefault(); setOpen(false); onSubmit?.() }}
      >
        <IconSearch size={20} />
        <input
          type="search"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder="Rechercher une église…"
          aria-label="Rechercher une église"
          autoComplete="off"
        />
        {button && <button className="btn success" type="submit">Chercher</button>}
      </form>
      {list.length > 0 && (
        <ul className="sb-list" role="listbox">
          {list.map((s) => (
            <li key={s.key}>
              <button type="button" className="sb-item" onMouseDown={(e) => { e.preventDefault(); pick(s) }}>
                <span className="sb-kind">{s.kind}</span>
                <b>{s.label}</b>
                {s.sub ? <small>{s.sub}</small> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { IconPlus, IconTrash } from './Icons'

export function Field({ label, hint, req, children }) {
  return (
    <label className="fld">
      <span className="fld-label">{label}{req && <b className="req"> *</b>}</span>
      {children}
      {hint && <small className="fld-hint">{hint}</small>}
    </label>
  )
}

export const Input = (props) => <input className="inp" {...props} />
export const Area = ({ rows = 4, ...p }) => <textarea className="inp area" rows={rows} {...p} />

export function Select({ options, placeholder = 'Choisir…', ...p }) {
  return (
    <select className="inp" {...p}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export function Chips({ options, value = [], onChange }) {
  const toggle = (o) => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])
  return (
    <div className="chips" role="group">
      {options.map((o) => (
        <button type="button" key={o} className={`chip ${value.includes(o) ? 'on' : ''}`} aria-pressed={value.includes(o)} onClick={() => toggle(o)}>
          {o}
        </button>
      ))}
    </div>
  )
}

// Liste d'éléments à ajouter ou retirer (fondateurs, paroisses, ministres, formations…).
export function Repeater({ items = [], onChange, blank, addLabel, render, itemLabel = 'Élément' }) {
  const patch = (i, p) => onChange(items.map((it, k) => (k === i ? { ...it, ...p } : it)))
  const remove = (i) => onChange(items.filter((_, k) => k !== i))
  return (
    <div className="rep">
      {items.map((it, i) => (
        <div className="rep-item" key={i}>
          <div className="rep-head">
            <b>{itemLabel} {i + 1}</b>
            <button type="button" className="icon-btn dark small" onClick={() => remove(i)} aria-label={`Supprimer ${itemLabel.toLowerCase()} ${i + 1}`}>
              <IconTrash size={18} />
            </button>
          </div>
          {render(it, (p) => patch(i, p), i)}
        </div>
      ))}
      <button type="button" className="btn ghost block" onClick={() => onChange([...items, typeof blank === 'function' ? blank() : { ...blank }])}>
        <IconPlus size={18} /> {addLabel}
      </button>
    </div>
  )
}

export function Block({ title, intro, children }) {
  return (
    <section className="fblock">
      {title && <h2>{title}</h2>}
      {intro && <p className="muted">{intro}</p>}
      {children}
    </section>
  )
}

import { useRef, useState } from 'react'
import { uploadImage, avatarUrl } from '../cloudinary'

export const MAX_PHOTOS = 50

export default function Gallery({ photos, current, onChange, onPick }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [prog, setProg] = useState('')
  const [err, setErr] = useState('')
  const [sel, setSel] = useState(null)

  const ajouter = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    const room = MAX_PHOTOS - photos.length
    if (room <= 0) return setErr(`Limite atteinte : ${MAX_PHOTOS} photos maximum.`)
    const lot = files.slice(0, room)
    setErr(''); setBusy(true)
    const next = [...photos]
    let msg = files.length > room ? `Limite de ${MAX_PHOTOS} photos : ${files.length - room} image(s) ignorée(s).` : ''
    for (let i = 0; i < lot.length; i++) {
      setProg(`${i + 1}/${lot.length}`)
      try { next.push(await uploadImage(lot[i], 'aneg/galeries')) } catch (ex) { msg = ex.message }
    }
    try {
      if (next.length !== photos.length) await onChange(next)
    } catch (ex) {
      msg = `Enregistrement impossible (${ex.code || ex.message}).`
    }
    setErr(msg); setBusy(false); setProg('')
  }

  const supprimer = async (url) => {
    if (!window.confirm('Supprimer cette photo de ta galerie ?')) return
    try { await onChange(photos.filter((u) => u !== url)); setSel(null) } catch (ex) { setErr(ex.message) }
  }

  const definir = async (url) => {
    try { await onPick(url); setSel(null) } catch (ex) { setErr(ex.message) }
  }

  return (
    <section className="gal">
      <div className="gal-head">
        <h2>Ma galerie</h2>
        <span className="muted">{photos.length} / {MAX_PHOTOS}</span>
      </div>
      {!photos.length && <p className="muted">Aucune photo pour l’instant.</p>}
      <div className="gal-grid">
        {photos.map((u) => (
          <button key={u} type="button" className="gal-item" onClick={() => setSel(u)} aria-label="Ouvrir la photo">
            <img src={avatarUrl(u, 240)} alt="" loading="lazy" />
            {u === current && <i>Profil</i>}
          </button>
        ))}
      </div>
      {err && <p className="alert" role="alert">{err}</p>}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={ajouter} />
      <button type="button" className="btn primary block" onClick={() => input.current?.click()} disabled={busy || photos.length >= MAX_PHOTOS}>
        {busy ? `Envoi ${prog}…` : 'Ajouter des photos'}
      </button>

      {sel && (
        <div className="gal-view" role="dialog" aria-modal="true" onClick={() => setSel(null)}>
          <img src={sel} alt="" onClick={(e) => e.stopPropagation()} />
          <div className="gal-actions" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn success" disabled={sel === current} onClick={() => definir(sel)}>
              {sel === current ? 'Photo de profil actuelle' : 'Définir comme photo de profil'}
            </button>
            <button type="button" className="btn ghost" onClick={() => supprimer(sel)}>Supprimer</button>
            <button type="button" className="btn ghost" onClick={() => setSel(null)}>Fermer</button>
          </div>
        </div>
      )}
    </section>
  )
}

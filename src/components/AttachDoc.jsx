import { useCallback, useEffect, useState } from 'react'
import { Field, Input, Select } from './FormBits'
import { IconFile, IconPaperclip, IconDownload } from './Icons'
import { uploadDocument } from '../cloudinary'
import { addDocument, fetchDocuments, fetchFormats } from '../services/store'
import { STATUTS_DOC, TYPES_DOCUMENTS, fmtDate } from '../data/refs'

// Dépôt des documents administratifs d'une église (par l'église ou, en son nom, par l'administrateur).
export default function AttachDoc({ churchId, ownerUid, byAdmin = false, onChange }) {
  const [docs, setDocs] = useState([])
  const [formats, setFormats] = useState([])
  const [type, setType] = useState('')
  const [numero, setNumero] = useState('')
  const [dateDeliv, setDateDeliv] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    try { setDocs(await fetchDocuments(churchId)) } catch (e) { console.warn(e.code || e.message) }
    try { setFormats(await fetchFormats()) } catch (e) { console.warn(e.code || e.message) }
  }, [churchId])
  useEffect(() => { load() }, [load])

  const envoyer = async () => {
    setErr('')
    if (!type) return setErr('Choisis le type de document.')
    if (!file) return setErr('Choisis un fichier (PDF ou photo).')
    setBusy(true)
    try {
      const up = await uploadDocument(file)
      await addDocument({
        churchId,
        ownerUid,
        type,
        numero: numero.trim(),
        dateDelivrance: dateDeliv,
        url: up.url,
        publicId: up.publicId,
        fichier: up.nom,
        depotPar: byAdmin ? 'admin' : 'eglise',
      })
      setType(''); setNumero(''); setDateDeliv(''); setFile(null)
      await load()
      onChange?.()
    } catch (e) {
      setErr(e.message || 'Envoi impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      {formats.length > 0 && (
        <div className="panel">
          <h2><IconDownload size={18} /> Modèles officiels recommandés</h2>
          <p className="muted">Utilise ces formats pour préparer tes documents.</p>
          <ul className="sources">
            {formats.map((f) => (
              <li key={f.id}>
                <a href={f.url} target="_blank" rel="noreferrer">{f.titre}</a>
                {f.categorie ? ` · ${f.categorie}` : ''}
                {f.description ? <small className="block muted">{f.description}</small> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rep-item">
        <Field label="Type de document" req>
          <Select options={TYPES_DOCUMENTS} value={type} onChange={(e) => setType(e.target.value)} />
        </Field>
        <Field label="Numéro ou référence" hint="Ex. numéro de l’arrêté ou du récépissé.">
          <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
        </Field>
        <Field label="Date de délivrance">
          <Input type="date" value={dateDeliv} onChange={(e) => setDateDeliv(e.target.value)} />
        </Field>
        <Field label="Fichier (PDF ou photo, 5 Mo maximum)" req>
          <input className="inp" type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </Field>
        {err && <p className="alert" role="alert">{err}</p>}
        <button type="button" className="btn primary block" onClick={envoyer} disabled={busy}>
          <IconPaperclip size={18} /> {busy ? 'Envoi en cours…' : 'Déposer le document'}
        </button>
        <p className="hint">Ces documents ne sont jamais affichés au public : seuls l’équipe ANEG et ton église y ont accès.</p>
      </div>

      {docs.length > 0 && (
        <div className="panel">
          <h2><IconFile size={18} /> Documents déposés</h2>
          <ul className="sources nolist">
            {docs.map((d) => (
              <li key={d.id}>
                <b>{d.type}</b>
                <small className="block muted">
                  {d.numero ? `N° ${d.numero} · ` : ''}{fmtDate(d.createdAt)} · <span className={`st st-${d.status}`}>{STATUTS_DOC[d.status] || d.status}</span>{d.archived ? ' · archivé' : ''}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

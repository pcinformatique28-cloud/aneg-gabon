import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  addFormat, adminUpdateChurch, deleteChurch, deleteDocument, deleteFormat,
  fetchAllChurches, fetchDocuments, fetchFormats, updateDocument,
} from '../services/store'
import { uploadDocument } from '../cloudinary'
import { Area, Field, Input } from '../components/FormBits'
import AttachDoc from '../components/AttachDoc'
import {
  IconArchive, IconCheck, IconDownload, IconEdit, IconEye, IconEyeOff, IconFile, IconPaperclip,
  IconPlus, IconShield, IconTrash, IconX, IconChurch,
} from '../components/Icons'
import { STATUTS, STATUTS_DOC, fmtDate } from '../data/refs'

const TABS = [
  ['apercu', 'Tableau de bord'],
  ['eglises', 'Églises'],
  ['documents', 'Documents'],
  ['modeles', 'Modèles officiels'],
]

export default function Admin() {
  const { user, loading, isAdmin, adminEmail, emailVerified, sendVerification, refreshUser } = useAuth()
  const [tab, setTab] = useState('apercu')
  const [churches, setChurches] = useState([])
  const [docs, setDocs] = useState([])
  const [formats, setFormats] = useState([])
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState('')
  const [focusChurch, setFocusChurch] = useState('')

  const load = useCallback(async () => {
    setErr('')
    try {
      const [c, d, f] = await Promise.all([fetchAllChurches(), fetchDocuments(), fetchFormats()])
      setChurches(c); setDocs(d); setFormats(f)
    } catch (e) {
      setErr(`Lecture impossible (${e.code || e.message}). Publie les règles Firestore puis actualise.`)
    }
  }, [])
  useEffect(() => { if (isAdmin) load() }, [isAdmin, load])

  const nomEglise = useMemo(() => Object.fromEntries(churches.map((c) => [c.id, c.nomOfficiel || 'Église sans nom'])), [churches])

  if (loading) return <p className="muted">Chargement…</p>

  if (!isAdmin) {
    return (
      <div className="stack center">
        <IconShield size={48} />
        <h1 className="h1">Espace administrateur</h1>
        {!user && <><p className="muted">Connecte-toi avec le compte administrateur.</p><Link className="btn primary" to="/connexion">Se connecter</Link></>}
        {user && !adminEmail && <p className="muted">Ce compte n’a pas accès à l’administration.</p>}
        {user && adminEmail && !emailVerified && (
          <>
            <p className="muted">Pour des raisons de sécurité, l’adresse e-mail administrateur doit être vérifiée. Ouvre le lien reçu par e-mail, puis actualise.</p>
            <button className="btn ghost" onClick={async () => { await sendVerification(); setInfo('Lien envoyé. Vérifie ta boîte e-mail (et les courriers indésirables).') }}>Renvoyer le lien</button>
            <button className="btn primary" onClick={async () => { await refreshUser(); }}>J’ai vérifié, actualiser</button>
            {info && <p className="ok">{info}</p>}
          </>
        )}
      </div>
    )
  }

  const run = async (fn, okMsg) => {
    setBusy(true); setErr(''); setInfo('')
    try { await fn(); if (okMsg) setInfo(okMsg); await load() } catch (e) { setErr(`Action refusée (${e.code || e.message}).`) } finally { setBusy(false) }
  }

  return (
    <div className="stack">
      <h1 className="h1"><IconShield size={26} /> Administration</h1>
      <div className="tabs" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {err && <p className="alert" role="alert">{err}</p>}
      {info && <p className="ok" role="status">{info}</p>}

      {tab === 'apercu' && <Overview churches={churches} docs={docs} go={(t) => setTab(t)} />}
      {tab === 'eglises' && (
        <Churches churches={churches} busy={busy} run={run}
          openDocs={(id) => { setFocusChurch(id); setTab('documents') }} />
      )}
      {tab === 'documents' && (
        <Documents docs={docs} churches={churches} nomEglise={nomEglise} busy={busy} run={run}
          focus={focusChurch} clearFocus={() => setFocusChurch('')} reload={load} />
      )}
      {tab === 'modeles' && <Formats formats={formats} busy={busy} run={run} />}
    </div>
  )
}

/* ---------- Tableau de bord ---------- */
function Overview({ churches, docs, go }) {
  const count = (fn) => churches.filter(fn).length
  const cards = [
    ['À valider', count((c) => c.submitted && c.status === 'en_attente'), 'eglises', 'warn'],
    ['Modifiées à relire', count((c) => c.needsReview), 'eglises', 'warn'],
    ['Publiées', count((c) => c.visible), 'eglises', 'ok'],
    ['Masquées', count((c) => c.submitted && !c.visible), 'eglises', ''],
    ['Brouillons', count((c) => !c.submitted), 'eglises', ''],
    ['Documents à examiner', docs.filter((d) => d.status === 'depose' && !d.archived).length, 'documents', 'warn'],
    ['Documents archivés', docs.filter((d) => d.archived).length, 'documents', ''],
  ]
  const aTraiter = churches.filter((c) => c.submitted && (c.status === 'en_attente' || c.needsReview)).slice(0, 6)
  return (
    <>
      <div className="kpis">
        {cards.map(([l, n, t, tone]) => (
          <button key={l} className={`kpi ${tone}`} onClick={() => go(t)}><b>{n}</b><span>{l}</span></button>
        ))}
      </div>
      <section className="panel wide">
        <h2><IconChurch size={18} /> Fiches à traiter</h2>
        {aTraiter.length === 0 && <p className="muted">Rien en attente.</p>}
        <ul className="sources nolist">
          {aTraiter.map((c) => <li key={c.id}><b>{c.nomOfficiel || 'Sans nom'}</b><small className="block muted">{c.siege?.commune || '—'} · envoyée le {fmtDate(c.submittedAt)}</small></li>)}
        </ul>
        {aTraiter.length > 0 && <button className="btn primary" onClick={() => go('eglises')}>Ouvrir la liste</button>}
      </section>
      <p className="hint">{churches.length} fiche(s) d’église inscrite(s), {docs.length} document(s) administratif(s).</p>
    </>
  )
}

/* ---------- Églises ---------- */
const FILTRES = [
  ['toutes', 'Toutes'], ['a_valider', 'À valider'], ['publiees', 'Publiées'],
  ['masquees', 'Masquées'], ['brouillons', 'Brouillons'],
]

function Churches({ churches, busy, run, openDocs }) {
  const [filtre, setFiltre] = useState('toutes')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState('')
  const [note, setNote] = useState({})

  const liste = churches.filter((c) => {
    const ok = {
      toutes: true,
      a_valider: c.submitted && (c.status === 'en_attente' || c.needsReview),
      publiees: c.visible,
      masquees: c.submitted && !c.visible,
      brouillons: !c.submitted,
    }[filtre]
    return ok && (!q || `${c.nomOfficiel} ${c.siege?.commune} ${c.ownerEmail}`.toLowerCase().includes(q.toLowerCase()))
  })

  const valider = (c, status) => run(() => adminUpdateChurch(c.id, {
    status, visible: status !== 'rejetee', needsReview: false, verifiedAt: new Date().toISOString(),
  }), `« ${c.nomOfficiel} » : ${STATUTS[status]}.`)

  const supprimer = (c) => {
    if (window.confirm(`Supprimer définitivement « ${c.nomOfficiel || 'cette fiche'} » et ses documents ?`)) run(() => deleteChurch(c.id), 'Fiche supprimée.')
  }

  return (
    <>
      <label className="searchbar single"><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, commune, e-mail…" aria-label="Rechercher" /></label>
      <div className="chips">
        {FILTRES.map(([k, l]) => <button key={k} className={`chip ${filtre === k ? 'on' : ''}`} onClick={() => setFiltre(k)}>{l}</button>)}
      </div>
      <p className="muted">{liste.length} fiche(s)</p>

      <div className="list">
        {liste.map((c) => (
          <article key={c.id} className="adm-card">
            <button className="adm-head" onClick={() => setOpen(open === c.id ? '' : c.id)} aria-expanded={open === c.id}>
              <span><b>{c.nomOfficiel || 'Sans nom'}</b><small className="block muted">{c.siege?.commune || '—'} · {c.ownerEmail || '—'}</small></span>
              <span className="tags">
                <span className={`st st-${c.status}`}>{STATUTS[c.status] || c.status}</span>
                {!c.submitted && <span className="tag">Brouillon</span>}
                {c.needsReview && <span className="tag warn">Modifiée</span>}
                {c.submitted && !c.visible && <span className="tag">Masquée</span>}
              </span>
            </button>

            <div className="actions">
              <button title="Valider (référencer)" aria-label="Valider" disabled={busy} onClick={() => valider(c, 'referencee')}><IconCheck size={20} /></button>
              <button title={c.visible ? 'Masquer' : 'Afficher'} aria-label={c.visible ? 'Masquer' : 'Afficher'} disabled={busy}
                onClick={() => run(() => adminUpdateChurch(c.id, { visible: !c.visible }), c.visible ? 'Fiche masquée.' : 'Fiche affichée.')}>
                {c.visible ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
              <Link title="Modifier" aria-label="Modifier" to={`/admin/eglise/${c.id}`}><IconEdit size={20} /></Link>
              <button title="Joindre ou consulter les documents" aria-label="Documents" onClick={() => openDocs(c.id)}><IconPaperclip size={20} /></button>
              <button title="Supprimer" aria-label="Supprimer" className="danger" disabled={busy} onClick={() => supprimer(c)}><IconTrash size={20} /></button>
            </div>

            {open === c.id && (
              <div className="adm-more">
                <div className="btn-row">
                  <button className="btn ghost" disabled={busy} onClick={() => valider(c, 'verifiee')}>Marquer Vérifiée</button>
                  <button className="btn ghost" disabled={busy} onClick={() => valider(c, 'officielle')}>Officiellement documentée</button>
                  <button className="btn ghost" disabled={busy} onClick={() => valider(c, 'rejetee')}>Rejeter</button>
                </div>
                <Link className="back" to={`/eglise/${c.id}`}>Voir la fiche publique</Link>
                <Field label="Note interne (visible seulement par l’administration)">
                  <Area rows={3} value={note[c.id] ?? c.adminNote ?? ''} onChange={(e) => setNote({ ...note, [c.id]: e.target.value })} />
                </Field>
                <button className="btn ghost" disabled={busy} onClick={() => run(() => adminUpdateChurch(c.id, { adminNote: note[c.id] ?? c.adminNote ?? '' }), 'Note enregistrée.')}>Enregistrer la note</button>
                <p className="hint">Inscrite le {fmtDate(c.createdAt)} · Dernière mise à jour {fmtDate(c.updatedAt)}</p>
              </div>
            )}
          </article>
        ))}
        {!liste.length && <p className="empty">Aucune fiche dans cette vue.</p>}
      </div>
    </>
  )
}

/* ---------- Documents et archivage ---------- */
function Documents({ docs, churches, nomEglise, busy, run, focus, clearFocus, reload }) {
  const [vue, setVue] = useState('examiner')
  const liste = docs.filter((d) => {
    if (focus && d.churchId !== focus) return false
    if (vue === 'examiner') return d.status === 'depose' && !d.archived
    if (vue === 'valides') return d.status === 'valide' && !d.archived
    if (vue === 'archives') return d.archived
    return true
  })
  const focusC = churches.find((c) => c.id === focus)

  return (
    <>
      {focus && (
        <div className="panel wide">
          <h2>Joindre un document pour « {nomEglise[focus] || focus} »</h2>
          <AttachDoc churchId={focus} ownerUid={focusC?.ownerUid || focus} byAdmin onChange={reload} />
          <button className="btn ghost" onClick={clearFocus}>Voir tous les documents</button>
        </div>
      )}
      <div className="chips">
        {[['examiner', 'À examiner'], ['valides', 'Validés'], ['archives', 'Archivés'], ['tous', 'Tous']].map(([k, l]) => (
          <button key={k} className={`chip ${vue === k ? 'on' : ''}`} onClick={() => setVue(k)}>{l}</button>
        ))}
      </div>
      <div className="list">
        {liste.map((d) => (
          <article key={d.id} className="adm-card">
            <div className="adm-head static">
              <span><b>{d.type}</b><small className="block muted">{nomEglise[d.churchId] || d.churchId} · {fmtDate(d.createdAt)}{d.numero ? ` · N° ${d.numero}` : ''}{d.depotPar === 'admin' ? ' · joint par l’administration' : ''}</small></span>
              <span className={`st st-${d.status}`}>{STATUTS_DOC[d.status] || d.status}</span>
            </div>
            <div className="actions">
              <a href={d.url} target="_blank" rel="noreferrer" title="Ouvrir" aria-label="Ouvrir"><IconFile size={20} /></a>
              <button title="Valider" aria-label="Valider" disabled={busy} onClick={() => run(() => updateDocument(d.id, { status: 'valide' }))}><IconCheck size={20} /></button>
              <button title="Refuser" aria-label="Refuser" disabled={busy} onClick={() => run(() => updateDocument(d.id, { status: 'refuse' }))}><IconX size={20} /></button>
              <button title={d.archived ? 'Désarchiver' : 'Archiver'} aria-label="Archiver" disabled={busy} onClick={() => run(() => updateDocument(d.id, { archived: !d.archived, archivedAt: new Date().toISOString() }), d.archived ? 'Document remis en circulation.' : 'Document archivé.')}><IconArchive size={20} /></button>
              <button title="Supprimer" aria-label="Supprimer" className="danger" disabled={busy} onClick={() => window.confirm('Supprimer ce document ?') && run(() => deleteDocument(d.id), 'Document supprimé.')}><IconTrash size={20} /></button>
            </div>
          </article>
        ))}
        {!liste.length && <p className="empty">Aucun document dans cette vue.</p>}
      </div>
      <p className="hint">L’archivage conserve le document sans l’afficher dans la liste « à examiner ». Les fichiers sont stockés chez Cloudinary ; voir les consignes de confidentialité.</p>
    </>
  )
}

/* ---------- Modèles officiels recommandés ---------- */
function Formats({ formats, busy, run }) {
  const [titre, setTitre] = useState('')
  const [categorie, setCategorie] = useState('')
  const [description, setDescription] = useState('')
  const [lien, setLien] = useState('')
  const [file, setFile] = useState(null)
  const [err, setErr] = useState('')

  const ajouter = async () => {
    setErr('')
    if (!titre.trim()) return setErr('Donne un titre au modèle.')
    if (!file && !lien.trim()) return setErr('Joins un fichier ou colle un lien.')
    await run(async () => {
      let url = lien.trim()
      if (file) url = (await uploadDocument(file, 'aneg/modeles')).url
      await addFormat({ titre: titre.trim(), categorie: categorie.trim(), description: description.trim(), url })
      setTitre(''); setCategorie(''); setDescription(''); setLien(''); setFile(null)
    }, 'Modèle publié : il apparaît dans l’étape « Documents » des églises.')
  }

  return (
    <>
      <div className="rep-item">
        <h2 className="sub">Proposer un format officiel</h2>
        <Field label="Titre" req><Input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. Modèle de statuts d’association cultuelle" /></Field>
        <Field label="Catégorie"><Input value={categorie} onChange={(e) => setCategorie(e.target.value)} placeholder="Ex. Statuts, Demande d’autorisation, Attestation" /></Field>
        <Field label="Description"><Area rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <Field label="Fichier (PDF ou image)"><input className="inp" type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></Field>
        <Field label="…ou lien vers le modèle"><Input value={lien} onChange={(e) => setLien(e.target.value)} placeholder="https://" /></Field>
        {err && <p className="alert">{err}</p>}
        <button className="btn primary block" disabled={busy} onClick={ajouter}><IconPlus size={18} /> Publier le modèle</button>
      </div>
      <div className="list">
        {formats.map((f) => (
          <article key={f.id} className="adm-card">
            <div className="adm-head static">
              <span><b>{f.titre}</b><small className="block muted">{f.categorie || 'Sans catégorie'} · {fmtDate(f.createdAt)}</small>{f.description && <small className="block">{f.description}</small>}</span>
            </div>
            <div className="actions">
              <a href={f.url} target="_blank" rel="noreferrer" title="Ouvrir" aria-label="Ouvrir"><IconDownload size={20} /></a>
              <button title="Supprimer" aria-label="Supprimer" className="danger" disabled={busy} onClick={() => window.confirm('Retirer ce modèle ?') && run(() => deleteFormat(f.id), 'Modèle retiré.')}><IconTrash size={20} /></button>
            </div>
          </article>
        ))}
        {!formats.length && <p className="empty">Aucun modèle publié pour l’instant.</p>}
      </div>
    </>
  )
}

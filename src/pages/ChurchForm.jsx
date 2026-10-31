import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { fetchChurch, saveChurch } from '../services/store'
import { uploadImage } from '../cloudinary'
import { Area, Block, Chips, Field, Input, Repeater, Select } from '../components/FormBits'
import AttachDoc from '../components/AttachDoc'
import { IconLocate, IconCheck } from '../components/Icons'
import {
  DIPLOMES, FAMILLES, JOURS, LANGUES, NIVEAUX_FORMATION, PRATIQUES, PROVINCES, STATUTS,
  TITRES_AUTORITE, TITRES_MINISTERE, TYPES_CULTE,
} from '../data/refs'

const STEPS = ['Identité', 'Fondation', 'Doctrine', 'Siège et cultes', 'Organisation', 'Ministres', 'Documents', 'Envoi']

const empty = () => ({
  nomOfficiel: '', sigle: '', famille: '', denomination: '', slogan: '', logoUrl: '',
  dateCreation: '', lieuCreation: '', fondateurs: [{ nom: '', role: 'Fondateur' }],
  histoire: '', vision: '', mission: '',
  confession: '', livreReference: '', pratiques: [], langues: ['Français'], affiliation: '',
  siege: { adresse: '', quartier: '', commune: '', province: 'Estuaire', lat: '', lng: '' },
  cultes: [{ jour: 'Dimanche', heure: '09:00', type: 'Culte principal' }],
  autorite: { titre: '', nom: '' }, nbParoisses: '', effectif: '', paroisses: [],
  ministres: [],
  contacts: { telephone: '', email: '', siteWeb: '', facebook: '' },
})

const mergeData = (base, extra) => ({
  ...base,
  ...extra,
  siege: { ...base.siege, ...(extra.siege || {}) },
  autorite: { ...base.autorite, ...(extra.autorite || {}) },
  contacts: { ...base.contacts, ...(extra.contacts || {}) },
})

const blankMinistre = () => ({
  nom: '', titre: '', lieu: 'Siège', debutMinistere: '', dateOrdination: '', autoriteOrdinante: '',
  langues: [], bio: '', formations: [], statutVerif: 'declare',
})
const blankFormation = () => ({ niveau: '', intitule: '', etablissement: '', pays: 'Gabon', annee: '', diplome: '' })

// Retire les champs techniques et convertit les nombres avant l'enregistrement.
function clean(f) {
  const num = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v))
  return {
    nomOfficiel: f.nomOfficiel.trim(), sigle: f.sigle.trim(), famille: f.famille, denomination: f.denomination.trim(),
    slogan: f.slogan.trim(), logoUrl: f.logoUrl || '',
    dateCreation: f.dateCreation, lieuCreation: f.lieuCreation.trim(),
    fondateurs: f.fondateurs.filter((x) => x.nom.trim()).map((x) => ({ nom: x.nom.trim(), role: x.role || 'Fondateur' })),
    histoire: f.histoire.trim(), vision: f.vision.trim(), mission: f.mission.trim(),
    confession: f.confession.trim(), livreReference: f.livreReference.trim(), pratiques: f.pratiques, langues: f.langues,
    affiliation: f.affiliation.trim(),
    siege: { ...f.siege, lat: num(f.siege.lat), lng: num(f.siege.lng) },
    cultes: f.cultes,
    autorite: f.autorite, nbParoisses: num(f.nbParoisses), effectif: num(f.effectif),
    paroisses: f.paroisses.filter((p) => p.nom.trim()),
    ministres: f.ministres.filter((m) => m.nom.trim()).map((m) => ({
      ...m, nom: m.nom.trim(),
      formations: (m.formations || []).filter((x) => x.intitule.trim()),
    })),
    contacts: f.contacts,
  }
}

export default function ChurchForm() {
  const { id: paramId } = useParams()
  const { user, loading, isAdmin } = useAuth()
  const navigate = useNavigate()
  const churchId = isAdmin && paramId ? paramId : user?.uid
  const adminMode = isAdmin && !!paramId && paramId !== user?.uid

  const [f, setF] = useState(empty())
  const [existing, setExisting] = useState(null)
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [logoBusy, setLogoBusy] = useState(false)

  useEffect(() => {
    if (!churchId) return
    let off = false
    fetchChurch(churchId)
      .then((c) => {
        if (off) return
        if (c) { setExisting(c); setF(mergeData(empty(), c)) }
      })
      .catch((e) => !off && setErr(`Lecture impossible (${e.code || e.message}). Vérifie que les règles Firestore sont publiées.`))
      .finally(() => !off && setReady(true))
    return () => { off = true }
  }, [churchId])

  const up = (patch) => setF((p) => ({ ...p, ...patch }))
  const upIn = (key, patch) => setF((p) => ({ ...p, [key]: { ...p[key], ...patch } }))

  const lieux = useMemo(() => ['Siège', ...f.paroisses.map((p) => p.nom.trim()).filter(Boolean)], [f.paroisses])
  const parLieu = useMemo(() => {
    const counts = {}
    f.ministres.filter((m) => m.nom.trim()).forEach((m) => { counts[m.lieu || 'Siège'] = (counts[m.lieu || 'Siège'] || 0) + 1 })
    return counts
  }, [f.ministres])

  if (loading || (user && !ready)) return <p className="muted">Chargement…</p>
  if (!user) return <Navigate to="/connexion" replace />

  const save = async (submit = false) => {
    setBusy(true); setErr(''); setMsg('')
    try {
      const data = { ...clean(f), updatedAt: serverTimestamp() }
      if (!existing) {
        Object.assign(data, {
          ownerUid: user.uid, ownerEmail: user.email,
          status: 'en_attente', visible: false, submitted: !!submit, createdAt: serverTimestamp(),
        })
      } else if (!adminMode) {
        data.submitted = !!(submit || existing.submitted)
        if (existing.status && existing.status !== 'en_attente') data.needsReview = true
      }
      if (submit && !adminMode) data.submittedAt = serverTimestamp()
      await saveChurch(churchId, data)
      setExisting(await fetchChurch(churchId))
      setMsg(submit ? 'Fiche envoyée.' : 'Brouillon enregistré.')
      return true
    } catch (e) {
      setErr(`Enregistrement impossible (${e.code || e.message}).`)
      return false
    } finally {
      setBusy(false)
    }
  }

  const aller = async (n) => {
    if (n > step && f.nomOfficiel.trim() && !(await save(false))) return
    setStep(n); window.scrollTo(0, 0)
  }

  const envoyer = async () => {
    const manque = []
    if (!f.nomOfficiel.trim()) manque.push('nom officiel')
    if (!f.famille) manque.push('famille confessionnelle')
    if (!f.dateCreation) manque.push('date de création')
    if (!f.fondateurs.some((x) => x.nom.trim())) manque.push('au moins un fondateur')
    if (!f.confession.trim()) manque.push('confession de foi')
    if (!f.siege.adresse.trim() || !f.siege.commune.trim()) manque.push('adresse et commune du siège')
    if (!f.autorite.nom.trim()) manque.push('autorité dirigeante')
    if (!f.ministres.some((m) => m.nom.trim())) manque.push('au moins un ministre ou prédicateur')
    if (manque.length) return setErr(`À compléter avant l’envoi : ${manque.join(', ')}.`)
    if (await save(true)) navigate('/profil')
  }

  const choisirLogo = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setLogoBusy(true); setErr('')
    try { up({ logoUrl: await uploadImage(file, 'aneg/logos') }) } catch (ex) { setErr(ex.message) } finally { setLogoBusy(false) }
  }

  const position = () => {
    if (!navigator.geolocation) return setErr('Géolocalisation indisponible sur cet appareil.')
    navigator.geolocation.getCurrentPosition(
      (p) => upIn('siege', { lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) }),
      () => setErr('Position refusée. Autorise la localisation pour ce site, ou saisis les coordonnées à la main.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const verrou = existing && !adminMode && existing.submitted
  const s = f.siege

  return (
    <div className="stack">
      <h1 className="h1">{adminMode ? 'Modifier la fiche (administrateur)' : existing ? 'Ma fiche église' : 'Inscrire mon église'}</h1>
      {existing && (
        <p className="hint">Statut : <b>{STATUTS[existing.status] || 'En attente de validation'}</b>{existing.submitted ? ' · envoyée' : ' · brouillon non envoyé'}{existing.visible ? ' · publiée' : ' · non publiée'}</p>
      )}
      {verrou && !adminMode && <p className="hint">Tes modifications seront relues par l’équipe ANEG avant d’apparaître dans l’annuaire.</p>}

      <div className="steps" role="tablist" aria-label="Étapes">
        {STEPS.map((t, i) => (
          <button key={t} role="tab" aria-selected={i === step} className={`step ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`} onClick={() => aller(i)}>
            <i>{i < step ? <IconCheck size={14} /> : i + 1}</i><span>{t}</span>
          </button>
        ))}
      </div>

      {step === 0 && (
        <Block title="Identité de l’église" intro="Les informations demandées aux églises et associations cultuelles pour leur enregistrement.">
          <Field label="Nom officiel (tel qu’il figure sur l’autorisation)" req><Input value={f.nomOfficiel} onChange={(e) => up({ nomOfficiel: e.target.value })} /></Field>
          <Field label="Sigle ou nom d’usage"><Input value={f.sigle} onChange={(e) => up({ sigle: e.target.value })} /></Field>
          <Field label="Famille confessionnelle" req><Select options={FAMILLES} value={f.famille} onChange={(e) => up({ famille: e.target.value })} /></Field>
          <Field label="Dénomination ou courant précis" hint="Ex. Église Évangélique du Gabon, Assemblées de Dieu, Église du Christianisme Céleste…"><Input value={f.denomination} onChange={(e) => up({ denomination: e.target.value })} /></Field>
          <Field label="Devise ou slogan"><Input value={f.slogan} onChange={(e) => up({ slogan: e.target.value })} /></Field>
          <Field label="Logo">
            <input className="inp" type="file" accept="image/*" onChange={choisirLogo} />
            {logoBusy && <small>Envoi du logo…</small>}
            {f.logoUrl && <img className="logo-prev" src={f.logoUrl} alt="Logo de l’église" />}
          </Field>
        </Block>
      )}

      {step === 1 && (
        <Block title="Fondation et histoire">
          <Field label="Date de création de l’église" req><Input type="date" value={f.dateCreation} onChange={(e) => up({ dateCreation: e.target.value })} /></Field>
          <Field label="Lieu de création"><Input value={f.lieuCreation} onChange={(e) => up({ lieuCreation: e.target.value })} /></Field>
          <h3 className="sub">Fondateurs <b className="req">*</b></h3>
          <Repeater items={f.fondateurs} onChange={(v) => up({ fondateurs: v })} blank={{ nom: '', role: 'Fondateur' }} addLabel="Ajouter un fondateur" itemLabel="Fondateur"
            render={(it, patch) => (<>
              <Field label="Nom et prénoms"><Input value={it.nom} onChange={(e) => patch({ nom: e.target.value })} /></Field>
              <Field label="Qualité"><Select options={['Fondateur', 'Cofondateur', 'Fondatrice', 'Missionnaire fondateur', 'Autre']} value={it.role} onChange={(e) => patch({ role: e.target.value })} /></Field>
            </>)} />
          <Field label="Historique de l’église"><Area rows={6} value={f.histoire} onChange={(e) => up({ histoire: e.target.value })} /></Field>
          <Field label="Vision"><Area value={f.vision} onChange={(e) => up({ vision: e.target.value })} /></Field>
          <Field label="Mission"><Area value={f.mission} onChange={(e) => up({ mission: e.target.value })} /></Field>
        </Block>
      )}

      {step === 2 && (
        <Block title="Doctrine et pratiques religieuses">
          <Field label="Confession de foi (résumé des croyances)" req hint="Ex. Trinité, autorité des Écritures, salut par la grâce…"><Area rows={6} value={f.confession} onChange={(e) => up({ confession: e.target.value })} /></Field>
          <Field label="Livre de référence"><Input value={f.livreReference} onChange={(e) => up({ livreReference: e.target.value })} placeholder="Ex. La Bible (Louis Segond)" /></Field>
          <Field label="Pratiques et sacrements"><Chips options={PRATIQUES} value={f.pratiques} onChange={(v) => up({ pratiques: v })} /></Field>
          <Field label="Langues de culte"><Chips options={LANGUES} value={f.langues} onChange={(v) => up({ langues: v })} /></Field>
          <Field label="Affiliation (fédération, hiérarchie, église mère)"><Input value={f.affiliation} onChange={(e) => up({ affiliation: e.target.value })} /></Field>
        </Block>
      )}

      {step === 3 && (
        <Block title="Lieu de culte central et horaires" intro="Le siège est le lieu de culte central officiel de l’église.">
          <Field label="Adresse du siège" req><Input value={s.adresse} onChange={(e) => upIn('siege', { adresse: e.target.value })} placeholder="Rue, repère, immeuble…" /></Field>
          <Field label="Quartier"><Input value={s.quartier} onChange={(e) => upIn('siege', { quartier: e.target.value })} /></Field>
          <Field label="Commune" req><Input value={s.commune} onChange={(e) => upIn('siege', { commune: e.target.value })} placeholder="Libreville, Akanda, Owendo…" /></Field>
          <Field label="Province"><Select options={PROVINCES} value={s.province} onChange={(e) => upIn('siege', { province: e.target.value })} /></Field>
          <div className="two">
            <Field label="Latitude"><Input inputMode="decimal" value={s.lat} onChange={(e) => upIn('siege', { lat: e.target.value })} /></Field>
            <Field label="Longitude"><Input inputMode="decimal" value={s.lng} onChange={(e) => upIn('siege', { lng: e.target.value })} /></Field>
          </div>
          <button type="button" className="btn ghost block" onClick={position}><IconLocate size={18} /> Utiliser ma position actuelle</button>
          <p className="hint">Place-toi devant l’église avant d’utiliser ce bouton pour obtenir un point précis.</p>
          <h3 className="sub">Horaires des cultes</h3>
          <Repeater items={f.cultes} onChange={(v) => up({ cultes: v })} blank={{ jour: 'Dimanche', heure: '09:00', type: 'Culte principal' }} addLabel="Ajouter un horaire" itemLabel="Culte"
            render={(it, patch) => (<>
              <Field label="Type"><Select options={TYPES_CULTE} value={it.type} onChange={(e) => patch({ type: e.target.value })} /></Field>
              <div className="two">
                <Field label="Jour"><Select options={JOURS} value={it.jour} onChange={(e) => patch({ jour: e.target.value })} /></Field>
                <Field label="Heure"><Input type="time" value={it.heure} onChange={(e) => patch({ heure: e.target.value })} /></Field>
              </div>
            </>)} />
        </Block>
      )}

      {step === 4 && (
        <Block title="Organisation et paroisses" intro="Autorité dirigeante et lieux de culte placés sous sa direction.">
          <Field label="Titre de l’autorité dirigeante"><Select options={TITRES_AUTORITE} value={f.autorite.titre} onChange={(e) => upIn('autorite', { titre: e.target.value })} /></Field>
          <Field label="Nom de l’autorité dirigeante" req><Input value={f.autorite.nom} onChange={(e) => upIn('autorite', { nom: e.target.value })} /></Field>
          <div className="two">
            <Field label="Nombre de paroisses ou annexes"><Input inputMode="numeric" value={f.nbParoisses} onChange={(e) => up({ nbParoisses: e.target.value })} /></Field>
            <Field label="Effectif approximatif de fidèles"><Input inputMode="numeric" value={f.effectif} onChange={(e) => up({ effectif: e.target.value })} /></Field>
          </div>
          <h3 className="sub">Paroisses et annexes</h3>
          <Repeater items={f.paroisses} onChange={(v) => up({ paroisses: v })} blank={{ nom: '', quartier: '', commune: '', responsable: '' }} addLabel="Ajouter une paroisse" itemLabel="Paroisse"
            render={(it, patch) => (<>
              <Field label="Nom de la paroisse"><Input value={it.nom} onChange={(e) => patch({ nom: e.target.value })} /></Field>
              <div className="two">
                <Field label="Quartier"><Input value={it.quartier} onChange={(e) => patch({ quartier: e.target.value })} /></Field>
                <Field label="Commune"><Input value={it.commune} onChange={(e) => patch({ commune: e.target.value })} /></Field>
              </div>
              <Field label="Responsable de la paroisse"><Input value={it.responsable} onChange={(e) => patch({ responsable: e.target.value })} /></Field>
            </>)} />
          <h3 className="sub">Contacts de l’église</h3>
          <Field label="Téléphone de l’église"><Input inputMode="tel" value={f.contacts.telephone} onChange={(e) => upIn('contacts', { telephone: e.target.value })} /></Field>
          <Field label="E-mail de l’église"><Input type="email" value={f.contacts.email} onChange={(e) => upIn('contacts', { email: e.target.value })} /></Field>
          <Field label="Site web"><Input value={f.contacts.siteWeb} onChange={(e) => upIn('contacts', { siteWeb: e.target.value })} /></Field>
          <Field label="Page Facebook ou autre réseau"><Input value={f.contacts.facebook} onChange={(e) => upIn('contacts', { facebook: e.target.value })} /></Field>
        </Block>
      )}

      {step === 5 && (
        <Block title="Ministres et prédicateurs" intro="Pour chaque ministre en fonction : lieu de culte, biographie, ordination et cursus de formation. Ces informations sont affichées comme « déclarées » tant que l’équipe ANEG n’a pas vérifié les documents.">
          <Repeater items={f.ministres} onChange={(v) => up({ ministres: v })} blank={blankMinistre} addLabel="Ajouter un ministre ou prédicateur" itemLabel="Ministre"
            render={(m, patch) => (<>
              <Field label="Nom et prénoms" req><Input value={m.nom} onChange={(e) => patch({ nom: e.target.value })} /></Field>
              <Field label="Titre ou fonction" req><Select options={TITRES_MINISTERE} value={m.titre} onChange={(e) => patch({ titre: e.target.value })} /></Field>
              <Field label="Lieu de culte où il exerce"><Select options={lieux} placeholder="Siège" value={m.lieu} onChange={(e) => patch({ lieu: e.target.value })} /></Field>
              <div className="two">
                <Field label="Début du ministère (année)"><Input inputMode="numeric" maxLength={4} value={m.debutMinistere} onChange={(e) => patch({ debutMinistere: e.target.value })} /></Field>
                <Field label="Date d’ordination ou de consécration"><Input type="date" value={m.dateOrdination} onChange={(e) => patch({ dateOrdination: e.target.value })} /></Field>
              </div>
              <Field label="Autorité ayant ordonné ou consacré"><Input value={m.autoriteOrdinante} onChange={(e) => patch({ autoriteOrdinante: e.target.value })} /></Field>
              <Field label="Langues de prédication"><Chips options={LANGUES} value={m.langues} onChange={(v) => patch({ langues: v })} /></Field>
              <Field label="Biographie et parcours"><Area rows={5} value={m.bio} onChange={(e) => patch({ bio: e.target.value })} /></Field>
              <h4 className="sub">Formation ecclésiastique</h4>
              <Repeater items={m.formations} onChange={(v) => patch({ formations: v })} blank={blankFormation} addLabel="Ajouter une formation" itemLabel="Formation"
                render={(x, p2) => (<>
                  <Field label="Type de formation"><Select options={NIVEAUX_FORMATION} value={x.niveau} onChange={(e) => p2({ niveau: e.target.value })} /></Field>
                  <Field label="Intitulé"><Input value={x.intitule} onChange={(e) => p2({ intitule: e.target.value })} placeholder="Ex. Licence en théologie" /></Field>
                  <Field label="Établissement"><Input value={x.etablissement} onChange={(e) => p2({ etablissement: e.target.value })} /></Field>
                  <div className="two">
                    <Field label="Pays"><Input value={x.pays} onChange={(e) => p2({ pays: e.target.value })} /></Field>
                    <Field label="Année"><Input inputMode="numeric" maxLength={4} value={x.annee} onChange={(e) => p2({ annee: e.target.value })} /></Field>
                  </div>
                  <Field label="Diplôme obtenu"><Select options={DIPLOMES} value={x.diplome} onChange={(e) => p2({ diplome: e.target.value })} /></Field>
                </>)} />
            </>)} />
        </Block>
      )}

      {step === 6 && (
        <Block title="Documents administratifs" intro="Autorisation d’exercer délivrée par le ministère de l’Intérieur, récépissé, statuts, actes d’ordination, diplômes…">
          {existing ? (
            <AttachDoc churchId={churchId} ownerUid={existing.ownerUid || user.uid} byAdmin={adminMode} />
          ) : (
            <p className="alert">Enregistre d’abord le brouillon (bouton ci-dessous) pour pouvoir déposer des documents.</p>
          )}
        </Block>
      )}

      {step === 7 && (
        <Block title="Récapitulatif et envoi">
          <div className="panel">
            <h2>{f.nomOfficiel || 'Nom non renseigné'}</h2>
            <p>{f.famille || '—'}{f.denomination ? ` · ${f.denomination}` : ''}</p>
            <p className="muted">Siège : {[s.adresse, s.quartier, s.commune].filter(Boolean).join(', ') || '—'}</p>
            <p className="muted">Créée le {f.dateCreation || '—'} · Fondateurs : {f.fondateurs.filter((x) => x.nom.trim()).map((x) => x.nom).join(', ') || '—'}</p>
            <p className="muted">Autorité : {[f.autorite.titre, f.autorite.nom].filter(Boolean).join(' ') || '—'} · Paroisses : {f.nbParoisses || f.paroisses.length || 0}</p>
          </div>
          <div className="panel">
            <h2>Ministres par lieu de culte</h2>
            {Object.keys(parLieu).length ? (
              <ul className="sources nolist">{Object.entries(parLieu).map(([l, n]) => <li key={l}>{l} : <b>{n}</b> ministre{n > 1 ? 's' : ''}</li>)}</ul>
            ) : <p className="muted">Aucun ministre renseigné.</p>}
          </div>
          {!adminMode && !existing?.submitted && <p className="hint">Après l’envoi, l’équipe ANEG examine la fiche et les documents, puis la publie dans l’annuaire.</p>}
          {!adminMode && (
            <button type="button" className="btn success block" onClick={envoyer} disabled={busy}>
              {busy ? 'Envoi…' : existing?.submitted ? 'Envoyer les modifications' : 'Envoyer pour validation'}
            </button>
          )}
        </Block>
      )}

      {err && <p className="alert" role="alert">{err}</p>}
      {msg && <p className="ok" role="status">{msg}</p>}

      <div className="form-nav">
        <button type="button" className="btn ghost" disabled={step === 0 || busy} onClick={() => aller(step - 1)}>← Précédent</button>
        <button type="button" className="btn ghost" disabled={busy} onClick={() => save(false)}>{busy ? '…' : 'Enregistrer'}</button>
        {step < STEPS.length - 1 && <button type="button" className="btn primary" disabled={busy} onClick={() => aller(step + 1)}>Suivant →</button>}
      </div>
      {adminMode && <Link to="/admin" className="back">← Retour à l’administration</Link>}
    </div>
  )
}

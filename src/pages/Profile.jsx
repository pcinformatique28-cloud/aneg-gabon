import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchChurch } from '../services/store'
import { uploadImage, avatarUrl } from '../cloudinary'
import { STATUTS } from '../data/refs'
import Gallery from '../components/Gallery'
import QrCode from '../components/QrCode'
import { Rich } from './ChurchDetail'
import { codeEglise, appUrl } from '../utils/ids'
import { IconCamera, IconChurch, IconLogout, IconShield, IconUser } from '../components/Icons'
import PushToggle from '../components/PushToggle'

const ROLES = {
  utilisateur: 'Utilisateur',
  eglise: 'Église',
  predicateur: 'Prédicateur',
  moderateur: 'Modérateur',
  admin: 'Administrateur',
}

const Pencil = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
)

export default function Profile() {
  const { user, loading, nom, role, photo, profile, setPhoto, setNom, setGallery, logout, isAdmin, adminEmail, emailVerified, sendVerification, refreshUser } = useAuth()
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [church, setChurch] = useState(null)
  const [chReady, setChReady] = useState(false)
  const [edit, setEdit] = useState(false)
  const [val, setVal] = useState('')

  useEffect(() => {
    if (!user) return
    let off = false
    fetchChurch(user.uid)
      .then((c) => !off && setChurch(c))
      .catch(() => !off && setChurch(null))
      .finally(() => !off && setChReady(true))
    return () => { off = true }
  }, [user])

  if (loading) return <p className="muted">Chargement…</p>
  if (!user) {
    return (
      <div className="stack center">
        <div className="avatar-big empty"><IconUser size={54} /></div>
        <h1 className="h1">Mon profil</h1>
        <p className="muted">Connecte-toi pour gérer ton compte et ta photo de profil.</p>
        <Link className="btn primary" to="/connexion">Se connecter / S’inscrire</Link>
      </div>
    )
  }

  const choisir = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setErr(''); setBusy(true)
    try {
      await setPhoto(await uploadImage(f, 'aneg/profils'))
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  const renommer = async () => {
    const v = val.trim()
    if (!v) return setEdit(false)
    try { await setNom(v); setEdit(false) } catch (ex) { setErr(ex.message) }
  }

  const initiale = (nom || user.email || '?').trim().charAt(0).toUpperCase()
  const rows = church
    ? [
        ['Dénomination', [church.famille, church.denomination].filter(Boolean).join(' · ')],
        ['Siège', [church.siege?.quartier, church.siege?.commune].filter(Boolean).join(', ')],
        ['Fidèles', church.effectif],
        ['Paroisses', church.nbParoisses],
        ['Téléphone', church.contacts?.telephone],
        ['E-mail', church.contacts?.email],
      ].filter(([, v]) => v !== '' && v != null)
    : []

  return (
    <div className="stack center">
      <button className="avatar-big" onClick={() => input.current?.click()} disabled={busy} aria-label="Changer la photo de profil">
        {photo ? <img src={avatarUrl(photo, 320)} alt={nom} /> : <span>{initiale}</span>}
        <i className="cam"><IconCamera size={18} /></i>
      </button>
      <input ref={input} type="file" accept="image/*" hidden onChange={choisir} />
      {busy && <p className="muted">Envoi de la photo…</p>}
      {err && <p className="alert" role="alert">{err}</p>}

      {edit ? (
        <div className="pf-edit">
          <input className="inp" value={val} onChange={(e) => setVal(e.target.value)} autoFocus aria-label="Nom du compte" />
          <button className="btn success" onClick={renommer}>OK</button>
          <button className="btn ghost" onClick={() => setEdit(false)}>Annuler</button>
        </div>
      ) : (
        <h1 className="h1 pf-name">
          {nom || 'Mon compte'}
          <button className="pf-pen" onClick={() => { setVal(nom || ''); setEdit(true) }} aria-label="Modifier le nom"><Pencil /></button>
        </h1>
      )}
      <p className="muted">{user.email}</p>
      <span className="tag denom">{ROLES[role] || role}</span>

      {!emailVerified && (
        <div className="panel wide">
          <p>{adminEmail ? 'Adresse administrateur non vérifiée : l’accès à l’administration est bloqué tant que le lien reçu par e-mail n’a pas été ouvert.' : 'Adresse e-mail non vérifiée.'}</p>
          <div className="btn-row">
            <button className="btn ghost" onClick={async () => { try { await sendVerification(); setInfo('Lien envoyé. Vérifie ta boîte e-mail.') } catch (e) { setErr(e.message) } }}>Renvoyer le lien</button>
            <button className="btn primary" onClick={refreshUser}>J’ai vérifié, actualiser</button>
          </div>
          {info && <p className="ok">{info}</p>}
        </div>
      )}
      {isAdmin && <Link className="btn primary block" to="/admin"><IconShield size={20} /> Espace administration</Link>}

      {chReady && (church ? (
        <>
        <section className="pf-card">
          <div className="pf-card-head">
            {church.logoUrl ? <img src={avatarUrl(church.logoUrl, 96)} alt="" /> : <IconChurch size={28} />}
            <div>
              <h2>{church.nomOfficiel || 'Mon église'}{church.sigle ? ` (${church.sigle})` : ''}</h2>
              <small className="muted">{STATUTS[church.status] || 'En attente de validation'} · {church.visible ? 'visible dans l’annuaire' : 'pas encore publiée'}</small>
            </div>
            <Link className="pf-pen" to="/inscrire-eglise" aria-label="Modifier les informations de mon église"><Pencil size={20} /></Link>
          </div>
          <dl className="pf-rows">
            {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </section>
        <section className="panel wide id-panel">
          <h2>Identité ANEG</h2>
          <div className="id-row">
            <div className="id-qr"><QrCode url={appUrl(`eglise/${church.id}`)} title={church.nomOfficiel || 'Église'} code={codeEglise(church.id)} canExpand size={150} /></div>
            <p className="hint">Touchez le QR pour l’agrandir et l’imprimer (A6, A5, A4, PNG, SVG). Les visiteurs le scannent avec l’appareil photo.</p>
          </div>
          <div className="btn-row">
            <Link className="btn primary" to={`/eglise/${church.id}`}>Voir ma fiche publique</Link>
            <Link className="btn ghost" to={`/eglise/${church.id}/calendrier`}>Calendrier annuel</Link>
          </div>
        </section>
        <Rich c={church} />
        </>
      ) : (
        <Link className="btn ghost block" to="/inscrire-eglise"><IconChurch size={20} /> Inscrire mon église</Link>
      ))}

      <Gallery
        photos={profile?.gallery || []}
        current={photo}
        onChange={setGallery}
        onPick={setPhoto}
      />

      {user && <PushToggle uid={user.uid} />}
      <button className="btn ghost" onClick={logout}><IconLogout size={18} /> Se déconnecter</button>
    </div>
  )
}

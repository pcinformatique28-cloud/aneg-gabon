import { useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { uploadImage, avatarUrl } from '../cloudinary'
import { IconCamera, IconLogout, IconUser } from '../components/Icons'

const ROLES = {
  utilisateur: 'Utilisateur',
  eglise: 'Église',
  predicateur: 'Prédicateur',
  moderateur: 'Modérateur',
  admin: 'Administrateur',
}

export default function Profile() {
  const { user, loading, nom, role, photo, setPhoto, logout } = useAuth()
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

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

  const initiale = (nom || user.email || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="stack center">
      <button className="avatar-big" onClick={() => input.current?.click()} disabled={busy} aria-label="Changer la photo de profil">
        {photo ? <img src={avatarUrl(photo, 320)} alt={nom} /> : <span>{initiale}</span>}
        <i className="cam"><IconCamera size={18} /></i>
      </button>
      <input ref={input} type="file" accept="image/*" hidden onChange={choisir} />
      {busy && <p className="muted">Envoi de la photo…</p>}
      {err && <p className="alert" role="alert">{err}</p>}

      <h1 className="h1">{nom || 'Mon compte'}</h1>
      <p className="muted">{user.email}</p>
      <span className="tag denom">{ROLES[role] || role}</span>
      {!user.emailVerified && <p className="hint">Adresse e-mail non vérifiée.</p>}

      <button className="btn ghost" onClick={logout}><IconLogout size={18} /> Se déconnecter</button>
    </div>
  )
}

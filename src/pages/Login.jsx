import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconEye, IconEyeOff } from '../components/Icons'

const LOGO = `${import.meta.env.BASE_URL}aneg-logo.png`

const MESSAGES = {
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/invalid-email': 'Adresse e-mail invalide.',
  'auth/user-not-found': 'Aucun compte avec cette adresse.',
  'auth/wrong-password': 'Mot de passe incorrect.',
  'auth/email-already-in-use': 'Cette adresse est déjà utilisée. Connecte-toi.',
  'auth/weak-password': 'Mot de passe trop court (6 caractères minimum).',
  'auth/too-many-requests': 'Trop d’essais. Réessaie dans quelques minutes.',
  'auth/network-request-failed': 'Pas de connexion internet.',
}

export default function Login() {
  const { user, login, register, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // login | register | reset
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [voir, setVoir] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')

  if (user) return <Navigate to="/profil" replace />

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setInfo(''); setBusy(true)
    try {
      if (mode === 'login') {
        await login(email.trim(), pwd)
        navigate('/profil')
      } else if (mode === 'register') {
        if (nom.trim().length < 2) throw { code: 'nom', message: 'Indique ton nom.' }
        await register(nom.trim(), email.trim(), pwd)
        navigate('/profil')
      } else {
        await resetPassword(email.trim())
        setInfo('Un e-mail de réinitialisation vient d’être envoyé si le compte existe.')
      }
    } catch (ex) {
      setErr(MESSAGES[ex.code] || ex.message || 'Une erreur est survenue.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <img src={LOGO} alt="" width="84" height="84" />
      <h1 className="h1 center">{mode === 'register' ? 'Créer un compte' : mode === 'reset' ? 'Mot de passe oublié' : 'Connexion'}</h1>

      {mode !== 'reset' && (
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setErr('') }}>Se connecter</button>
          <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'on' : ''} onClick={() => { setMode('register'); setErr('') }}>S’inscrire</button>
        </div>
      )}

      <form onSubmit={submit} className="form" noValidate>
        {mode === 'register' && (
          <label>Nom complet
            <input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" required />
          </label>
        )}
        <label>Adresse e-mail
          <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        {mode !== 'reset' && (
          <label>Mot de passe
            <span className="pwd">
              <input type={voir ? 'text' : 'password'} value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={6} required />
              <button type="button" className="icon-btn dark" onClick={() => setVoir((v) => !v)} aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                {voir ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
            </span>
          </label>
        )}

        {err && <p className="alert" role="alert">{err}</p>}
        {info && <p className="ok" role="status">{info}</p>}

        <button className="btn primary block" disabled={busy}>
          {busy ? 'Patiente…' : mode === 'register' ? 'Créer mon compte' : mode === 'reset' ? 'Envoyer le lien' : 'Se connecter'}
        </button>
      </form>

      {mode === 'login' && <button className="link" onClick={() => { setMode('reset'); setErr('') }}>Mot de passe oublié ?</button>}
      {mode === 'reset' && <button className="link" onClick={() => { setMode('login'); setErr(''); setInfo('') }}>← Retour à la connexion</button>}
    </div>
  )
}

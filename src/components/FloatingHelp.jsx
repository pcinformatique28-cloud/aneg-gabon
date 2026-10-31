import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import HelpGuide from './HelpGuide'

const ADMIN_EMAIL = 'pcinformatique28@gmail.com'
const KEY_I = 'aneg-fh-install'
const KEY_H = 'aneg-fh-help'
const lire = (k) => { try { return sessionStorage.getItem(k) === '1' } catch (e) { return false } }
const ecrire = (k) => { try { sessionStorage.setItem(k, '1') } catch (e) { /* ignore */ } }

function Modal({ titre, onClose, children }) {
  return (
    <div className="fh-overlay" onClick={onClose}>
      <div className="fh-modal" role="dialog" aria-modal="true" aria-label={titre} onClick={(e) => e.stopPropagation()}>
        <button className="fh-close" onClick={onClose} aria-label="Fermer">×</button>
        <h2>{titre}</h2>
        {children}
      </div>
    </div>
  )
}

export default function FloatingHelp() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [modal, setModal] = useState('')
  const [hideI, setHideI] = useState(() => lire(KEY_I))
  const [hideH, setHideH] = useState(() => lire(KEY_H))
  const isAdminAccount = (user?.email || '').toLowerCase() === ADMIN_EMAIL

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (standalone) setInstalled(true)
    const onPrompt = (e) => { e.preventDefault(); setPrompt(e) }
    const onInstalled = () => { setInstalled(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const installer = async () => {
    if (prompt) {
      prompt.prompt()
      try { await prompt.userChoice } catch (e) { /* ignore */ }
      setPrompt(null)
    } else {
      setModal('install')
    }
  }

  return (
    <>
      {!installed && !hideI && (
        <div className="fh-pill fh-install">
          <button className="fh-main" onClick={installer}>📲 Installer l’app</button>
          <button className="fh-x" onClick={() => { ecrire(KEY_I); setHideI(true) }} aria-label="Masquer">×</button>
        </div>
      )}
      {!hideH && (
        <div className="fh-pill fh-help">
          <button className="fh-main" onClick={() => setModal('aide')}>❓ Comment ça marche</button>
          <button className="fh-x" onClick={() => { ecrire(KEY_H); setHideH(true) }} aria-label="Masquer">×</button>
        </div>
      )}

      {modal === 'install' && (
        <Modal titre="Installer ANEG" onClose={() => setModal('')}>
          <p>Ajoute ANEG à ton écran d’accueil pour l’ouvrir comme une application :</p>
          <ul>
            <li><b>Android (Chrome)</b> : menu ⋮ puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».</li>
            <li><b>iPhone (Safari)</b> : bouton Partager puis « Sur l’écran d’accueil ».</li>
          </ul>
        </Modal>
      )}

      {modal === 'aide' && (
        <Modal titre="Comment ça marche" onClose={() => setModal('')}>
          <HelpGuide isAdminAccount={isAdminAccount} />
        </Modal>
      )}
    </>
  )
}

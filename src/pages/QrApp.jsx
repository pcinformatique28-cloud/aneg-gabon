import QrCode from '../components/QrCode'
import { appUrl } from '../utils/ids'
import { useAuth } from '../context/AuthContext'

export default function QrApp() {
  const { isAdmin } = useAuth()
  return (
    <div className="stack">
      <h1 className="h1">QR code de l’application</h1>
      <p className="muted">Scannez-le avec l’appareil photo : il ouvre directement l’accueil d’ANEG.</p>
      <QrCode url={appUrl('')} title="ANEG" code="ANEG" canExpand={isAdmin} size={200} />
      <button className="btn primary block" onClick={() => {
        const u = window.location.origin + import.meta.env.BASE_URL
        if (navigator.share) navigator.share({ title: 'ANEG', text: 'Annuaire National des Églises du Gabon', url: u }).catch(() => {})
        else navigator.clipboard?.writeText(u)
      }}>Partager le lien de l’application</button>
    </div>
  )
}

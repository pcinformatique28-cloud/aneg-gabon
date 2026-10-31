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
    </div>
  )
}

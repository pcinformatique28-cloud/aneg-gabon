import { Link } from 'react-router-dom'
import { DENOM_COLORS } from '../data/churches'
import { IconPin } from './Icons'
import QrCode from './QrCode'
import Thumb from './Thumb'
import { codeEglise, appUrl } from '../utils/ids'

export default function ChurchCard({ church, distance }) {
  return (
    <Link to={`/eglise/${church.id}`} className="church-card" style={{ '--accent': DENOM_COLORS[church.denomination] || '#0a63c9' }}>
      <div className="church-card-top">
        <div className="card-name">
          <Thumb src={church.logoUrl} kind="church" size={64} className="mini-logo" />
          <div>
            <h3>{church.nom}</h3>
            <span className="id-chip">{codeEglise(church.id)}</span>
          </div>
        </div>
        <div className="card-qr"><QrCode url={appUrl(`eglise/${church.id}`)} title={church.nom} size={58} /></div>
        {distance != null && <span className="dist">{distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}</span>}
      </div>
      <p className="place"><IconPin size={16} /> {church.lieu} · {church.commune}</p>
      <div className="tags">
        <span className="tag denom">{church.denomination}</span>
        <span className="tag">{church.statut}</span>
      </div>
    </Link>
  )
}

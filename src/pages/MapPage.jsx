import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DENOM_COLORS, distanceKm, itineraire } from '../data/churches'
import { useChurches } from '../hooks/useChurches'
import { IconLocate } from '../components/Icons'

const pin = (color) =>
  L.divIcon({
    className: 'aneg-pin',
    html: `<span style="background:${color}"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  })

function Fly({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 0.8 })
  }, [target, map])
  return null
}

export default function MapPage() {
  const { churches } = useChurches()
  const [params] = useSearchParams()
  const focus = churches.find((c) => c.id === params.get('focus'))
  const [me, setMe] = useState(null)
  const [msg, setMsg] = useState('')
  const [target, setTarget] = useState(focus && focus.lat != null ? [focus.lat, focus.lng] : null)
  const places = useMemo(() => churches.filter((c) => c.lat != null), [churches])

  const proches = useMemo(() => {
    if (!me) return []
    return places
      .map((c) => ({ c, d: distanceKm(me[0], me[1], c.lat, c.lng) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
  }, [me, places])

  const localiser = () => {
    setMsg('')
    if (!navigator.geolocation) return setMsg('La géolocalisation n’est pas disponible sur cet appareil.')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = [p.coords.latitude, p.coords.longitude]
        setMe(pos)
        setTarget(pos)
      },
      () => setMsg('Position refusée ou indisponible. Autorise la localisation pour ce site.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="stack">
      <h1 className="h1">Carte interactive</h1>
      <div className="map-actions">
        <button className="btn success" onClick={localiser}><IconLocate size={18} /> Autour de moi</button>
        <div className="legend">
          {Object.entries(DENOM_COLORS).map(([k, v]) => <span key={k}><i style={{ background: v }} />{k}</span>)}
        </div>
      </div>
      {msg && <p className="alert">{msg}</p>}

      <div className="map-wrap">
        <MapContainer center={[0.4, 9.46]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution="&copy; contributeurs OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {places.map((c) => (
            <Marker key={c.id} position={[c.lat, c.lng]} icon={pin(DENOM_COLORS[c.denomination] || '#0a63c9')}>
              <Popup>
                <strong>{c.nom}</strong><br />{c.lieu} · {c.commune}<br />
                <Link to={`/eglise/${c.id}`}>Voir la fiche</Link>
                {' · '}
                <a href={itineraire(c)} target="_blank" rel="noreferrer">Itinéraire</a>
              </Popup>
            </Marker>
          ))}
          {me && <CircleMarker center={me} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: '#e11d48', fillOpacity: 1 }} />}
          <Fly target={target} />
        </MapContainer>
      </div>

      {proches.length > 0 && (
        <section className="panel">
          <h2>Les plus proches</h2>
          <ul className="sources">
            {proches.map(({ c, d }) => (
              <li key={c.id}><Link to={`/eglise/${c.id}`}>{c.nom}</Link> · {d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`}</li>
            ))}
          </ul>
        </section>
      )}
      <p className="hint">Les positions sont approximatives (niveau quartier) en attendant les coordonnées exactes données par chaque église.</p>
    </div>
  )
}

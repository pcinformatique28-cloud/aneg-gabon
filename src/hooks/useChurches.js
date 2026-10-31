import { useEffect, useMemo, useState } from 'react'
import { CHURCHES } from '../data/churches'
import { fetchPublicChurches } from '../services/store'
import { STATUTS } from '../data/refs'

// Transforme une fiche Firestore en « carte » compatible avec les églises de départ.
export function toCard(c) {
  const s = c.siege || {}
  const lat = parseFloat(s.lat)
  const lng = parseFloat(s.lng)
  return {
    id: c.id,
    nom: c.nomOfficiel || 'Église sans nom',
    denomination: c.famille || 'Autre',
    commune: s.commune || '',
    lieu: [s.quartier, s.adresse].filter(Boolean).join(' · ') || s.commune || '',
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    precision: 'gps',
    statut: STATUTS[c.status] || 'Référencée',
    remote: true,
  }
}

// Églises inscrites (Firestore, fiches visibles) + églises de départ.
export function useChurches() {
  const [remote, setRemote] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let off = false
    fetchPublicChurches()
      .then((list) => !off && setRemote(list.map(toCard)))
      .catch((e) => {
        console.warn('Fiches non lues :', e.code || e.message)
        if (!off) setError(e.code || e.message)
      })
      .finally(() => !off && setLoading(false))
    return () => { off = true }
  }, [])

  const churches = useMemo(() => [...remote, ...CHURCHES], [remote])
  return { churches, loading, error, remoteCount: remote.length }
}

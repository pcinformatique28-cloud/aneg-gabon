import { collection, doc, limit, query, where } from 'firebase/firestore'
import { db } from '../firebase'

const ms = (v) => {
  if (!v) return 0
  if (typeof v === 'string') { const t = Date.parse(v); return Number.isNaN(t) ? 0 : t }
  return v.toMillis?.() ?? 0
}

export function buildSources(uid, isAdmin) {
  const s = []
  if (isAdmin) {
    s.push({
      ref: query(collection(db, 'churches'), where('status', '==', 'en_attente'), limit(50)),
      map: (id, d) => (d.submitted ? {
        id: 'adm-eg-' + id, title: 'Église à valider', body: d.nomOfficiel || 'Nouvelle fiche',
        link: '/admin', at: ms(d.submittedAt) || ms(d.updatedAt) || ms(d.createdAt),
      } : null),
    })
    s.push({
      ref: query(collection(db, 'documents'), where('status', '==', 'depose'), limit(50)),
      map: (id, d) => (d.archived ? null : {
        id: 'adm-doc-' + id, title: 'Document à examiner', body: d.titre || d.nom || d.name || 'Nouveau document',
        link: '/admin', at: ms(d.createdAt),
      }),
    })
  }
  s.push({
    ref: doc(db, 'churches', uid),
    map: (id, d) => {
      if (!d.status || d.status === 'en_attente') return null
      const ok = d.status !== 'rejetee'
      return {
        id: 'eg-' + d.status + '-' + (d.verifiedAt || ''),
        title: ok ? 'Votre fiche a été validée' : 'Votre fiche a été refusée',
        body: d.nomOfficiel || '', link: '/inscrire-eglise', at: ms(d.verifiedAt),
      }
    },
  })
  s.push({
    ref: query(collection(db, 'documents'), where('ownerUid', '==', uid), limit(50)),
    map: (id, d) => {
      if (d.status !== 'valide' && d.status !== 'refuse') return null
      return {
        id: 'doc-' + id + '-' + d.status,
        title: d.status === 'valide' ? 'Document validé' : 'Document refusé',
        body: d.titre || d.nom || d.name || '', link: '/inscrire-eglise', at: ms(d.archivedAt) || ms(d.verifiedAt),
      }
    },
  })
  return s
}

import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
  query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { pingRelay } from '../utils/push'

const withId = (d) => ({ id: d.id, ...d.data() })

// ---------- Églises ----------
export async function fetchPublicChurches() {
  const snap = await getDocs(query(collection(db, 'churches'), where('visible', '==', true)))
  return snap.docs.map(withId)
}

export async function fetchChurch(id) {
  const s = await getDoc(doc(db, 'churches', id))
  return s.exists() ? withId(s) : null
}

export async function fetchAllChurches() {
  const snap = await getDocs(collection(db, 'churches'))
  return snap.docs.map(withId)
}

export const saveChurch = (id, data) => setDoc(doc(db, 'churches', id), data, { merge: true })

export const adminUpdateChurch = async (id, patch) => {
  await updateDoc(doc(db, 'churches', id), { ...patch, updatedAt: serverTimestamp() })
  if (patch.status && patch.status !== 'en_attente' && patch.verifiedAt) pingRelay('/notify-decision', id)
}

export async function deleteChurch(id) {
  const docs = await fetchDocuments(id)
  await Promise.all(docs.map((d) => deleteDoc(doc(db, 'documents', d.id))))
  await deleteDoc(doc(db, 'churches', id))
}

// ---------- Documents administratifs ----------
export async function fetchDocuments(churchId) {
  const ref = collection(db, 'documents')
  const snap = await getDocs(churchId ? query(ref, where('churchId', '==', churchId)) : ref)
  return snap.docs.map(withId).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

export const addDocument = async (data) => {
  const ref = await addDoc(collection(db, 'documents'), {
    status: 'depose',
    archived: false,
    ...data,
    createdAt: serverTimestamp(),
  })
  if (data.depotPar !== 'admin') pingRelay('/notify-doc', ref.id)
  return ref
}

export const updateDocument = async (id, patch) => {
  await updateDoc(doc(db, 'documents', id), patch)
  if (patch.status === 'valide' || patch.status === 'refuse') pingRelay('/notify-doc-decision', id)
}
export const deleteDocument = (id) => deleteDoc(doc(db, 'documents', id))

// ---------- Modèles et formats officiels recommandés ----------
export async function fetchFormats() {
  const snap = await getDocs(collection(db, 'formats'))
  return snap.docs.map(withId).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

export const addFormat = (data) => addDoc(collection(db, 'formats'), { ...data, createdAt: serverTimestamp() })
export const deleteFormat = (id) => deleteDoc(doc(db, 'formats', id))

// ---------- Événements (agenda) ----------
export async function fetchEvents(churchId) {
  const ref = collection(db, 'events')
  const snap = await getDocs(churchId ? query(ref, where('churchId', '==', churchId)) : ref)
  return snap.docs.map(withId).sort((a, b) => (a.date || '').localeCompare(b.date || ''))
}

export const saveEvent = (id, data) =>
  id
    ? updateDoc(doc(db, 'events', id), { ...data, updatedAt: serverTimestamp() })
    : addDoc(collection(db, 'events'), { ...data, createdAt: serverTimestamp() })

export const deleteEvent = (id) => deleteDoc(doc(db, 'events', id))

import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { app, db } from '../firebase'

const VAPID = 'BHtjIwJ0O2O76ezMoXglNrK6oBo8te3gbTcsBqCBn6sfRLilobKgxQ0DeU-1jtMz10n5ReODEFSfoYvUkKDzUZI'
const RELAY = 'https://aneg-relais.pcinformatique28.workers.dev'
const KEY = 'aneg_push_token'

const wait = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])

export async function pushSupported() {
  try {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window && (await isSupported())
  } catch { return false }
}

async function currentToken() {
  const reg = await wait(navigator.serviceWorker.ready, 5000)
  return (await getToken(getMessaging(app), { vapidKey: VAPID, serviceWorkerRegistration: reg })) || ''
}

async function save(uid, token) {
  await setDoc(doc(db, 'pushTokens', token), { uid, createdAt: serverTimestamp() })
  try { localStorage.setItem(KEY, token) } catch { /* ignore */ }
}

export async function enablePush(uid) {
  try {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return 'denied'
    const token = await currentToken()
    if (!token) return 'error'
    await save(uid, token)
    return 'on'
  } catch { return 'error' }
}

export async function syncPush(uid) {
  try {
    if (Notification.permission !== 'granted') return
    const token = await currentToken()
    if (token) await save(uid, token)
  } catch { /* ignore */ }
}

export async function disablePush() {
  try {
    const token = localStorage.getItem(KEY)
    if (token) {
      await wait(deleteDoc(doc(db, 'pushTokens', token)), 2000)
      localStorage.removeItem(KEY)
    }
  } catch { /* ignore */ }
}

export function pingRelay(path, id) {
  try {
    void fetch(RELAY + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      keepalive: true,
    }).catch(() => { /* ignore */ })
  } catch { /* ignore */ }
}

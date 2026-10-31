import { useEffect, useRef, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'

const KEY = 'aneg_alerts_read'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const save = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l.slice(-300))) } catch { /* ignore */ } }

// sources : [{ ref: Query ou DocumentReference, map: (id, data) => alerte | null }]
export function useAlerts(userKey, getSources, onNew) {
  const [rows, setRows] = useState([])
  const [read, setRead] = useState(load)
  const known = useRef(null)
  const cb = useRef(onNew)
  useEffect(() => { cb.current = onNew })

  useEffect(() => {
    if (!userKey) return undefined
    const sources = getSources()
    const per = new Map()
    const first = new Set()
    known.current = null
    const offs = sources.map((s, i) => onSnapshot(s.ref, (snap) => {
      const list = snap.docs
        ? snap.docs.map((d) => s.map(d.id, d.data()))
        : (snap.exists() ? [s.map(snap.id, snap.data())] : [])
      per.set(i, list.filter(Boolean))
      first.add(i)
      const all = [...per.values()].flat().sort((a, b) => b.at - a.at)
      setRows(all)
      if (first.size < sources.length) return
      if (known.current === null) { known.current = new Set(all.map((a) => a.id)); return }
      for (const a of all) {
        if (!known.current.has(a.id)) {
          known.current.add(a.id)
          if (!load().includes(a.id)) cb.current?.(a)
        }
      }
    }, () => { per.set(i, []); first.add(i) }))
    return () => offs.forEach((o) => o())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey])

  const items = userKey ? rows : []
  const unread = items.filter((a) => !read.includes(a.id))
  const markRead = (id) => setRead((p) => { const n = p.includes(id) ? p : [...p, id]; save(n); return n })
  const markAll = () => setRead((p) => { const n = [...new Set([...p, ...items.map((a) => a.id)])]; save(n); return n })
  return { items, unread, markRead, markAll }
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (u) => {
    if (!u) return setProfile(null)
    try {
      const snap = await getDoc(doc(db, 'users', u.uid))
      setProfile(snap.exists() ? snap.data() : null)
    } catch (err) {
      // Règles Firestore pas encore publiées : on continue sans profil.
      console.warn('Profil non lu :', err.code || err.message)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      await loadProfile(u)
      setLoading(false)
    })
  }, [loadProfile])

  const register = useCallback(
    async (nom, email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: nom })
      try {
        // Le rôle par défaut est toujours « utilisateur » : un rôle élevé s'attribue côté admin.
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          nom,
          email,
          role: 'utilisateur',
          photoURL: '',
          createdAt: serverTimestamp(),
        })
      } catch (err) {
        console.warn('Document users non créé :', err.code || err.message)
      }
      await loadProfile(cred.user)
      return cred.user
    },
    [loadProfile],
  )

  const login = useCallback((email, password) => signInWithEmailAndPassword(auth, email, password), [])
  const logout = useCallback(() => signOut(auth), [])
  const resetPassword = useCallback((email) => sendPasswordResetEmail(auth, email), [])

  const setPhoto = useCallback(async (url) => {
    await updateProfile(auth.currentUser, { photoURL: url })
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: url })
    } catch (err) {
      console.warn('Photo non enregistrée dans Firestore :', err.code || err.message)
    }
    setProfile((p) => ({ ...(p || {}), photoURL: url }))
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      role: profile?.role || 'utilisateur',
      nom: profile?.nom || user?.displayName || '',
      photo: profile?.photoURL || user?.photoURL || '',
      register,
      login,
      logout,
      resetPassword,
      setPhoto,
    }),
    [user, profile, loading, register, login, logout, resetPassword, setPhoto],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

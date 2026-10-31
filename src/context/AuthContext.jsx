import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { ADMIN_EMAIL } from '../data/refs'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const loadProfile = useCallback(async (u) => {
    if (!u) return setProfile(null)
    try {
      const snap = await getDoc(doc(db, 'users', u.uid))
      setProfile(snap.exists() ? snap.data() : null)
    } catch (err) {
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
        await sendEmailVerification(cred.user)
      } catch (err) {
        console.warn('E-mail de vérification non envoyé :', err.code || err.message)
      }
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
  const sendVerification = useCallback(() => sendEmailVerification(auth.currentUser), [])

  // Après avoir cliqué sur le lien reçu par e-mail : recharge l'utilisateur et renouvelle le jeton.
  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return
    await auth.currentUser.reload()
    await auth.currentUser.getIdToken(true)
    setVersion((v) => v + 1)
  }, [])

  const setPhoto = useCallback(async (url) => {
    await updateProfile(auth.currentUser, { photoURL: url })
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: url })
    } catch (err) {
      console.warn('Photo non enregistrée dans Firestore :', err.code || err.message)
    }
    setProfile((p) => ({ ...(p || {}), photoURL: url }))
  }, [])

  const value = useMemo(() => {
    const email = (user?.email || '').toLowerCase()
    const adminEmail = email === ADMIN_EMAIL
    const emailVerified = !!auth.currentUser?.emailVerified
    return {
      user,
      profile,
      loading,
      role: profile?.role || 'utilisateur',
      nom: profile?.nom || user?.displayName || '',
      photo: profile?.photoURL || user?.photoURL || '',
      emailVerified,
      adminEmail, // c'est l'adresse administrateur (même non vérifiée)
      isAdmin: adminEmail && emailVerified, // l'accès réel est aussi contrôlé par les règles Firestore
      register,
      login,
      logout,
      resetPassword,
      sendVerification,
      refreshUser,
      setPhoto,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, loading, version, register, login, logout, resetPassword, sendVerification, refreshUser, setPhoto])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

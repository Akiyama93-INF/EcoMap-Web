// firebase/authService.js — v3 + FCM (temporalmente desactivado para diagnostico)

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from './firebaseInit'

const USERS_COLLECTION = 'users'

const authService = {

  async register(email, password, displayName) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName })
      await setDoc(doc(db, USERS_COLLECTION, user.uid), {
        displayName,
        email,
        fcmToken:  null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return user
    } catch (error) {
      throw new Error(this._traducirError(error.code))
    }
  },

  async login(email, password) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      return user
    } catch (error) {
      throw new Error(this._traducirError(error.code))
    }
  },

  async logout() {
    try {
      await signOut(auth)
    } catch (error) {
      throw new Error(`Error al cerrar sesión: ${error.message}`)
    }
  },

  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback)
  },

  getCurrentUser() {
    return auth.currentUser
  },

  _traducirError(code) {
    const errores = {
      'auth/user-not-found':         'No existe una cuenta con ese correo.',
      'auth/wrong-password':         'Contraseña incorrecta.',
      'auth/email-already-in-use':   'Ya existe una cuenta con ese correo.',
      'auth/weak-password':          'La contraseña debe tener al menos 6 caracteres.',
      'auth/invalid-email':          'El formato del correo no es válido.',
      'auth/too-many-requests':      'Demasiados intentos. Intenta más tarde.',
      'auth/network-request-failed': 'Sin conexión a internet.',
      'auth/invalid-credential':     'Correo o contraseña incorrectos.',
    }
    return errores[code] ?? `Error de autenticación (${code})`
  },
}

export default authService
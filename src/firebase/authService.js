// firebase/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from './firebaseInit'

const USERS_COLLECTION = 'users'

const authService = {

  async register(email, password, displayName) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) {
        await updateProfile(user, { displayName })
      }
      await setDoc(doc(db, USERS_COLLECTION, user.uid), {
        displayName: displayName ?? '',
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

  // Inicio de sesión / registro con Google (popup)
  // Funciona tanto para cuentas nuevas como existentes
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)

      // Crear o actualizar el documento del usuario en Firestore
      // setDoc con merge:true no sobreescribe datos existentes
      await setDoc(
        doc(db, USERS_COLLECTION, user.uid),
        {
          displayName: user.displayName ?? '',
          email:       user.email ?? '',
          photoURL:    user.photoURL ?? null,
          updatedAt:   Timestamp.now(),
        },
        { merge: true }
      )

      // Si es un usuario nuevo, agregar createdAt
      // (setDoc con merge no lo sobreescribe si ya existe)
      await setDoc(
        doc(db, USERS_COLLECTION, user.uid),
        { createdAt: Timestamp.now() },
        { merge: true }
      )

      return user
    } catch (error) {
      // El usuario cerró el popup — no es un error real
      if (error.code === 'auth/popup-closed-by-user') return null
      throw new Error(this._traducirError(error.code))
    }
  },

  // Actualiza displayName en Firebase Auth
  async updateUserProfile(displayName) {
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No hay sesión activa.')
      await updateProfile(user, { displayName })
      // Sincronizar también en Firestore
      await setDoc(
        doc(db, USERS_COLLECTION, user.uid),
        { displayName, updatedAt: Timestamp.now() },
        { merge: true }
      )
    } catch (error) {
      throw new Error(`Error al actualizar perfil: ${error.message}`)
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
      'auth/popup-blocked':          'El navegador bloqueó la ventana de Google. Permite popups para este sitio.',
      'auth/account-exists-with-different-credential': 'Ya existe una cuenta con ese correo usando otro método de inicio de sesión.',
    }
    return errores[code] ?? `Error de autenticación (${code})`
  },
}

export default authService
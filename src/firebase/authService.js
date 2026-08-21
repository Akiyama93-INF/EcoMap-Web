// firebase/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from './firebaseInit'

const USERS_COLLECTION = 'users'

// Detecta si la app corre dentro de un WebView de Capacitor (APK)
// En ese entorno los popups son bloqueados nativamente, por eso se usa redirect
const isCapacitor = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() === true ||
    window.location.protocol === 'capacitor:')

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

  // Inicio de sesión con Google.
  // - En APK/Capacitor: usa signInWithRedirect (los popups son bloqueados en WebView)
  // - En web: usa signInWithPopup (experiencia más fluida)
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider()

    if (isCapacitor()) {
      // En APK el flujo continúa cuando el usuario vuelve a la app.
      // El resultado se captura en App.jsx con getRedirectResult al montar.
      await signInWithRedirect(auth, provider)
      return null // la página se recargará, no hay retorno sincrónico
    }

    try {
      const { user } = await signInWithPopup(auth, provider)
      await this._upsertGoogleUser(user)
      return user
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') return null
      throw new Error(this._traducirError(error.code))
    }
  },

  // Llama esto al montar App para capturar el resultado del redirect en APK
  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth)
      if (!result) return null
      await this._upsertGoogleUser(result.user)
      return result.user
    } catch (error) {
      // Si no hay resultado pendiente simplemente retorna null
      if (error.code === 'auth/no-auth-event') return null
      throw new Error(this._traducirError(error.code))
    }
  },

  // Crea o actualiza el documento Firestore del usuario de Google
  async _upsertGoogleUser(user) {
    const userRef  = doc(db, USERS_COLLECTION, user.uid)
    const { getDoc } = await import('firebase/firestore')
    const userSnap = await getDoc(userRef)

    await setDoc(
      userRef,
      {
        displayName: user.displayName ?? '',
        email:       user.email ?? '',
        photoURL:    user.photoURL ?? null,
        updatedAt:   Timestamp.now(),
        ...(!userSnap.exists() ? { createdAt: Timestamp.now() } : {}),
      },
      { merge: true }
    )
  },

  // Actualiza displayName en Firebase Auth y Firestore
  async updateUserProfile(displayName) {
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No hay sesión activa.')
      await updateProfile(user, { displayName })
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
      'auth/account-exists-with-different-credential':
        'Ya existe una cuenta con ese correo usando otro método de inicio de sesión.',
    }
    return errores[code] ?? `Error de autenticación (${code})`
  },
}

export default authService

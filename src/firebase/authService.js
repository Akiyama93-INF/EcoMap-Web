// firebase/authService.js — v3.4.4
// Login Google:
//   - APK/Capacitor: usa @codetrix-studio/capacitor-google-auth (nativo, sin salir a Chrome)
//   - Web: usa signInWithPopup (flujo normal de Firebase)

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
} from 'firebase/auth'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from './firebaseInit'

const USERS_COLLECTION = 'users'

// Detecta si la app corre dentro de Capacitor (APK)
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

  // Login con Google:
  // - En APK: abre el selector nativo de Google sin salir de la app
  // - En web: abre popup de Firebase
  async loginWithGoogle() {
    if (isCapacitor()) {
      try {
        // Importación dinámica para no romper el build web
        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')

        // Inicializar el plugin con el clientId web
        await GoogleAuth.initialize({
          clientId: '424454747908-cbv62dro9sc6vqku3ijkd90cb3o1667d.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        })

        const googleUser = await GoogleAuth.signIn()

        // Construir credencial de Firebase con el idToken del plugin
        const credential = GoogleAuthProvider.credential(
          googleUser.authentication.idToken
        )

        const { user } = await signInWithCredential(auth, credential)
        await this._upsertGoogleUser(user)
        return user
      } catch (error) {
        if (
          error.message?.includes('cancelled') ||
          error.message?.includes('canceled') ||
          error.message?.includes('dismiss')
        ) {
          return null // usuario canceló el selector
        }
        throw new Error(this._traducirError(error.code) ?? error.message)
      }
    }

    // Web — popup normal
    try {
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)
      await this._upsertGoogleUser(user)
      return user
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') return null
      throw new Error(this._traducirError(error.code))
    }
  },

  // Ya no se necesita con el plugin nativo — se mantiene como no-op
  // para no romper App.jsx si todavía lo llama alguna versión anterior
  async handleRedirectResult() {
    return null
  },

  async _upsertGoogleUser(user) {
    const userRef = doc(db, USERS_COLLECTION, user.uid)
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
      // Cerrar sesión también en el plugin nativo si está en APK
      if (isCapacitor()) {
        try {
          const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')
          await GoogleAuth.signOut()
        } catch (_) {
          // Si el plugin no estaba inicializado, ignorar
        }
      }
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

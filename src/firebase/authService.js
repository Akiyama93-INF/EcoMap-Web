// Servicio de Autenticación
// Maneja registro, login, logout y autenticación con Google

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth } from './firebaseInit'
import { saveProfile } from './profileService'

export const authService = {
  // Registro con email y contraseña
  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw new Error(`Error en registro: ${error.message}`)
    }
  },

  // Actualiza displayName en Firebase Auth
  async updateUserProfile(displayName) {
    try {
      await updateProfile(auth.currentUser, { displayName })
    } catch (error) {
      throw new Error(`Error actualizando perfil: ${error.message}`)
    }
  },

  // Login con email y contraseña
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw new Error(`Error en login: ${error.message}`)
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth)
    } catch (error) {
      throw new Error(`Error en logout: ${error.message}`)
    }
  },

  // Login con Google — guarda datos en Firestore tras el popup
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const { user } = userCredential

      await saveProfile(user.uid, {
        displayName: user.displayName ?? '',
        email:       user.email,
      })

      return user
    } catch (error) {
      throw new Error(`Error en login con Google: ${error.message}`)
    }
  },

  // Escuchar cambios de autenticación
  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback)
  },

  // Obtener usuario actual
  getCurrentUser() {
    return auth.currentUser
  },
}

export default authService
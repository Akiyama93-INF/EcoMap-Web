// Servicio de Autenticación
// Maneja registro, login, logout y autenticación con Google

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebaseInit'

// TODO: Implementar lógica completa de autenticación

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

  // Login con Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      return userCredential.user
      // TODO: Implementar lógica adicional para guardar datos del usuario en Firestore
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

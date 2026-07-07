// Inicialización de Firebase
// Este archivo configura e inicializa los servicios de Firebase

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import firebaseConfig from './firebaseConfig'

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Obtener referencias de los servicios
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

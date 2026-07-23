// Inicialización de Firebase
// Este archivo configura e inicializa los servicios de Firebase
// Actualizado:
//   - enableIndexedDbPersistence: modo offline nativo de Firestore

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import firebaseConfig from './firebaseConfig'

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Obtener referencias de los servicios
export const auth    = getAuth(app)
export const db      = getFirestore(app)
export const storage = getStorage(app)

// ← Modo offline: encola reportes nuevos y sirve los cargados sin internet
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Offline: múltiples pestañas abiertas, persistencia desactivada')
  } else if (err.code === 'unimplemented') {
    console.warn('Offline: este navegador no soporta persistencia IndexedDB')
  }
})

export default app
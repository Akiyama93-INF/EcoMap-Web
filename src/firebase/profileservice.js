// profileService.js
// CRUD del perfil de usuario en Firestore → users/{uid}

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebaseInit'

const col = 'users'

// Obtiene el perfil desde Firestore
export async function getProfile(uid) {
  const snap = await getDoc(doc(db, col, uid))
  return snap.exists() ? snap.data() : null
}

// Crea o sobreescribe el perfil (merge para no borrar campos existentes)
export async function saveProfile(uid, { displayName, email }) {
  await setDoc(
    doc(db, col, uid),
    {
      displayName,
      email,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

// Actualiza solo el displayName
export async function updateDisplayName(uid, displayName) {
  await setDoc(
    doc(db, col, uid),
    { displayName, updatedAt: serverTimestamp() },
    { merge: true }
  )
}
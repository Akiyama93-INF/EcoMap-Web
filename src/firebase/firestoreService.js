// firebase/firestoreService.js — v4
// Añadido:
//   - addComment(reportId, userId, userName, text)
//   - subscribeToComments(reportId, onData, onError)
//   - deleteComment(reportId, commentId, userId)
//   - subscribeToReportsByScope(scope, onData, onError) — query filtrada en Firestore
//   - updateReportStatus valida ownership antes de escribir

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db, auth } from './firebaseInit'

const REPORTS_COLLECTION  = 'reports'
const USERS_COLLECTION    = 'users'
const COMMENTS_COLLECTION = 'comments'

// Cache en memoria para no hacer múltiples lecturas al mismo uid en la sesión
const _nameCache = {}

async function resolveUserName(uid, fallback) {
  if (!uid) return fallback ?? 'Anónimo'
  if (_nameCache[uid]) return _nameCache[uid]

  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
    const name = snap.exists() ? (snap.data().displayName || fallback) : fallback
    _nameCache[uid] = name ?? 'Anónimo'
    return _nameCache[uid]
  } catch {
    return fallback ?? 'Anónimo'
  }
}

// Dado un array de reportes crudos, resuelve el displayName real de cada autor.
// Si userName ya parece un nombre (no contiene @) se usa directamente sin hit a Firestore.
async function enrichReports(rawReports) {
  const uidSet = new Set()
  rawReports.forEach((r) => {
    if (r.userId && r.userName?.includes('@')) uidSet.add(r.userId)
  })

  // Resuelve en paralelo solo los uid que necesitan lookup
  await Promise.all([...uidSet].map((uid) => resolveUserName(uid, null)))

  return rawReports.map((r) => {
    if (!r.userName?.includes('@')) return r
    return { ...r, userName: _nameCache[r.userId] ?? r.userName }
  })
}

// Las reglas de Firestore deben aplicar también estos permisos en el servidor.
function requireUser(expectedId) {
  const uid = auth.currentUser?.uid
  if (!uid || (expectedId && expectedId !== uid)) {
    throw new Error('Debes iniciar sesión con la cuenta correspondiente')
  }
  return uid
}

async function requireOwner(reportId) {
  const uid = requireUser()
  const snap = await getDoc(doc(db, REPORTS_COLLECTION, reportId))
  if (!snap.exists()) throw new Error('Reporte no encontrado')
  if (snap.data().userId !== uid) throw new Error('No tienes permiso para modificar este reporte')
  return { uid, snap }
}

export const firestoreService = {
// Crear nuevo reporte
async createReport(reportData) {
  try {
    const uid = requireUser(reportData.userId)
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
      ...reportData,
      userId: uid,

      // Contexto donde fue creado el reporte:
      // "nacional" o "insa"
      scope: reportData.scope ?? 'nacional',

      confirmations: [],
      confirmationCount: 0,
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return docRef.id
  } catch (error) {
    throw new Error(`Error al crear reporte: ${error.message}`)
  }
},

  // Obtener todos los reportes (lectura puntual) con nombres resueltos
  async getReports() {
    try {
      const snapshot = await getDocs(collection(db, REPORTS_COLLECTION))
      const raw = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      return enrichReports(raw)
    } catch (error) {
      throw new Error(`Error al obtener reportes: ${error.message}`)
    }
  },

  // Listener en tiempo real filtrado por scope (más eficiente que traer todo)
  // Requiere índice compuesto en Firestore: scope ASC + createdAt DESC
  // El link para crearlo aparece en consola la primera vez que se usa.
  subscribeToReportsByScope(scope, onData, onError) {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where('scope', '==', scope)
    )
    return onSnapshot(
      q,
      async (snapshot) => {
        const raw = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        const enriched = await enrichReports(raw)
        onData(enriched)
      },
      (err) => {
        console.error('subscribeToReportsByScope error:', err)
        onError?.(err)
      }
    )
  },

  // Listener en tiempo real con nombres resueltos (todos los reportes — mantener por compatibilidad)
  subscribeToReports(onData, onError) {
    const q = collection(db, REPORTS_COLLECTION)
    return onSnapshot(
      q,
      async (snapshot) => {
        const raw = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        const enriched = await enrichReports(raw)
        onData(enriched)
      },
      (err) => {
        console.error('subscribeToReports error:', err)
        onError?.(err)
      }
    )
  },

  // Obtener reporte por ID con nombre resuelto
  async getReportById(reportId) {
    try {
      const snap = await getDoc(doc(db, REPORTS_COLLECTION, reportId))
      if (!snap.exists()) throw new Error('Reporte no encontrado')
      const raw = { id: snap.id, ...snap.data() }
      const [enriched] = await enrichReports([raw])
      return enriched
    } catch (error) {
      throw new Error(`Error al obtener reporte: ${error.message}`)
    }
  },

  // Obtener reportes por usuario con nombres resueltos
  async getReportsByUser(userId) {
    try {
      const q = query(
        collection(db, REPORTS_COLLECTION),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(q)
      const raw = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      return enrichReports(raw)
    } catch (error) {
      throw new Error(`Error al obtener reportes del usuario: ${error.message}`)
    }
  },

  // Solo el autor autenticado puede editar campos permitidos.
  async updateReport(reportId, reportData) {
    try {
      await requireOwner(reportId)
      const allowed = ['description', 'category', 'subtypes', 'imageUrl', 'metadata']
      const changes = Object.fromEntries(Object.entries(reportData).filter(([key]) => allowed.includes(key)))
      if (!Object.keys(changes).length) throw new Error('No hay cambios permitidos')
      await updateDoc(doc(db, REPORTS_COLLECTION, reportId), {
        ...changes,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      throw new Error(`Error al actualizar reporte: ${error.message}`)
    }
  },

  async deleteReport(reportId) {
    try {
      await requireOwner(reportId)
      await deleteDoc(doc(db, REPORTS_COLLECTION, reportId))
    } catch (error) {
      throw new Error(`Error al eliminar reporte: ${error.message}`)
    }
  },

  // Transacción: no se pierden confirmaciones simultáneas.
  async confirmReport(reportId, userId) {
    try {
      const uid = requireUser(userId)
      const reportRef = doc(db, REPORTS_COLLECTION, reportId)
      return await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(reportRef)
        if (!snapshot.exists()) throw new Error('Reporte no encontrado')
        const data = snapshot.data()
        if (data.userId === uid) throw new Error('No puedes confirmar tu propio reporte')
        const confirmations = Array.isArray(data.confirmations) ? data.confirmations : []
        if (confirmations.includes(uid)) throw new Error('Ya confirmaste este reporte')
        const next = [...confirmations, uid]
        transaction.update(reportRef, {
          confirmations: next,
          confirmationCount: next.length,
          updatedAt: Timestamp.now(),
        })
        return { confirmationCount: next.length }
      })
    } catch (error) {
      throw new Error(`Error al confirmar reporte: ${error.message}`)
    }
  },

  async updateReportStatus(reportId, status, userId) {
    try {
      requireUser(userId)
      if (!['active', 'resolved'].includes(status)) throw new Error('Estado no válido')
      await requireOwner(reportId)
      await updateDoc(doc(db, REPORTS_COLLECTION, reportId), {
        status,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`)
    }
  },

  async markAsClean(reportId, userId) {
    try {
      const uid = requireUser(userId)
      await requireOwner(reportId)
      await updateDoc(doc(db, REPORTS_COLLECTION, reportId), {
        status: 'resolved',
        resolvedBy: uid,
        resolvedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      throw new Error(`Error al marcar como limpio: ${error.message}`)
    }
  },

  // ── v3: Comentarios ───────────────────────────────────────────────────────

  // Agregar comentario a un reporte
  async addComment(reportId, { userId, userName, photoURL = null, text }) {
    try {
      requireUser(userId)
      if (typeof text !== 'string' || !text.trim() || text.trim().length > 1000) {
        throw new Error('El comentario debe tener entre 1 y 1000 caracteres')
      }
      const ref = collection(db, REPORTS_COLLECTION, reportId, COMMENTS_COLLECTION)
      await addDoc(ref, {
        userId,
        userName,
        photoURL,
        text: text.trim(),
        createdAt: Timestamp.now(),
      })
    } catch (error) {
      throw new Error(`Error al agregar comentario: ${error.message}`)
    }
  },

  // Listener en tiempo real de comentarios de un reporte, ordenados por fecha
  subscribeToComments(reportId, onData, onError) {
    const q = query(
      collection(db, REPORTS_COLLECTION, reportId, COMMENTS_COLLECTION),
      orderBy('createdAt', 'asc')
    )
    return onSnapshot(
      q,
      (snapshot) => {
        const comments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        onData(comments)
      },
      (err) => {
        console.error('subscribeToComments error:', err)
        onError?.(err)
      }
    )
  },

  // Eliminar comentario — solo el autor puede hacerlo (también reforzado en reglas)
  async deleteComment(reportId, commentId, userId) {
    try {
      requireUser(userId)
      const ref = doc(db, REPORTS_COLLECTION, reportId, COMMENTS_COLLECTION, commentId)
      const snap = await getDoc(ref)
      if (!snap.exists()) throw new Error('Comentario no encontrado')
      if (snap.data().userId !== userId) throw new Error('Sin permiso para eliminar este comentario')
      await deleteDoc(ref)
    } catch (error) {
      throw new Error(`Error al eliminar comentario: ${error.message}`)
    }
  },
}

export default firestoreService
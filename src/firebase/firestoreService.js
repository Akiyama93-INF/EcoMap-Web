// firebase/firestoreService.js — Fase 3
// Añadido:
//   - confirmReport(): votos colaborativos (arrayUnion, un voto por userId)
//   - createReport(): guarda reportType explícito para que privacy.js no
//     necesite inferirlo en cada render

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
  arrayUnion,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebaseInit'

const REPORTS_COLLECTION = 'reports'

export const firestoreService = {
  // Crear nuevo reporte
  async createReport(reportData) {
    try {
      const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
        ...reportData,
        // Campos nuevos en Fase 3
        confirmations: [],      // [userId, ...] — máximo uno por usuario
        confirmationCount: 0,   // desnormalizado para ordenar sin leer el array
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      throw new Error(`Error al crear reporte: ${error.message}`)
    }
  },

  // Obtener todos los reportes activos
  async getReports() {
    try {
      const snapshot = await getDocs(collection(db, REPORTS_COLLECTION))
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (error) {
      throw new Error(`Error al obtener reportes: ${error.message}`)
    }
  },

  // Obtener reporte por ID
  async getReportById(reportId) {
    try {
      const snap = await getDoc(doc(db, REPORTS_COLLECTION, reportId))
      if (!snap.exists()) throw new Error('Reporte no encontrado')
      return { id: snap.id, ...snap.data() }
    } catch (error) {
      throw new Error(`Error al obtener reporte: ${error.message}`)
    }
  },

  // Obtener reportes por usuario
  async getReportsByUser(userId) {
    try {
      const q = query(
        collection(db, REPORTS_COLLECTION),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (error) {
      throw new Error(`Error al obtener reportes del usuario: ${error.message}`)
    }
  },

  // Actualizar reporte
  async updateReport(reportId, reportData) {
    try {
      await updateDoc(doc(db, REPORTS_COLLECTION, reportId), {
        ...reportData,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      throw new Error(`Error al actualizar reporte: ${error.message}`)
    }
  },

  // Eliminar reporte
  async deleteReport(reportId) {
    try {
      await deleteDoc(doc(db, REPORTS_COLLECTION, reportId))
    } catch (error) {
      throw new Error(`Error al eliminar reporte: ${error.message}`)
    }
  },

  // ── Fase 3: Reportes colaborativos ───────────────────────────────────────
  // Registra la confirmación de un usuario sobre un reporte existente.
  // arrayUnion garantiza que un userId no se agrega dos veces.
  async confirmReport(reportId, userId) {
    try {
      const snap = await getDoc(doc(db, REPORTS_COLLECTION, reportId))
      if (!snap.exists()) throw new Error('Reporte no encontrado')

      const data = snap.data()
      if ((data.confirmations ?? []).includes(userId)) {
        throw new Error('Ya confirmaste este reporte')
      }

      await updateDoc(doc(db, REPORTS_COLLECTION, reportId), {
        confirmations: arrayUnion(userId),
        confirmationCount: (data.confirmationCount ?? 0) + 1,
        updatedAt: Timestamp.now(),
      })

      return { confirmationCount: (data.confirmationCount ?? 0) + 1 }
    } catch (error) {
      throw new Error(`Error al confirmar reporte: ${error.message}`)
    }
  },

  // ── Fase 4: Estados de reporte ────────────────────────────────────────────
  async updateReportStatus(reportId, status) {
    try {
      await updateDoc(doc(db, REPORTS_COLLECTION, reportId), {
        status,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      throw new Error(`Error al actualizar estado: ${error.message}`)
    }
  },
}

export default firestoreService

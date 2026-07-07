// Servicio de Storage
// Maneja carga de imágenes de reportes

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { storage } from './firebaseInit'

// TODO: Implementar lógica completa de Storage

export const storageService = {
  // Subir imagen de reporte
  async uploadReportImage(userId, reportId, file) {
    try {
      if (!file) {
        throw new Error('No se proporcionó archivo')
      }

      const fileName = `reports/${userId}/${reportId}/${file.name}`
      const storageRef = ref(storage, fileName)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return downloadURL
    } catch (error) {
      throw new Error(`Error al subir imagen: ${error.message}`)
    }
  },

  // Obtener URL de descarga de imagen
  async getDownloadURL(imagePath) {
    try {
      const storageRef = ref(storage, imagePath)
      return await getDownloadURL(storageRef)
    } catch (error) {
      throw new Error(`Error al obtener URL: ${error.message}`)
    }
  },

  // Eliminar imagen
  async deleteImage(imagePath) {
    try {
      const storageRef = ref(storage, imagePath)
      await deleteObject(storageRef)
    } catch (error) {
      throw new Error(`Error al eliminar imagen: ${error.message}`)
    }
  },
}

export default storageService

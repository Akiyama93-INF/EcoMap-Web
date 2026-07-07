// Servicio para subir imágenes a Cloudinary

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const cloudinaryService = {
  async uploadImage(file) {
    if (!file) {
      throw new Error('No se proporcionó archivo')
    }

    const formData = new FormData()

    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error('Error al subir imagen a Cloudinary')
    }

    const data = await response.json()

    return data.secure_url
  },
}

export default cloudinaryService
// src/hooks/useCameraNative.js
// Detecta si la app corre en Capacitor nativo (Android/iOS) o en el browser.
// En nativo usa @capacitor/camera para abrir la cámara o la galería.
// En browser usa el input file estándar con capture="environment".

import { useState } from 'react'

// Capacitor está disponible globalmente cuando corre en la APK
function isNative() {
  return (
    typeof window !== 'undefined' &&
    window.Capacitor?.isNativePlatform?.() === true
  )
}

export function useCameraNative() {
  const [error, setError] = useState(null)

  // Convierte un base64 dataURL a File object para mantener compatibilidad
  // con el resto del form que espera un File
  function base64ToFile(base64, filename = 'photo.jpg') {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) u8arr[n] = bstr.charCodeAt(n)
    return new File([u8arr], filename, { type: mime })
  }

  async function takePhoto() {
    setError(null)
    if (!isNative()) return null // en browser el input file maneja esto

    try {
      const { Camera, CameraSource, CameraResultType } = await import('@capacitor/camera')
      const photo = await Camera.getPhoto({
        source:      CameraSource.Camera,
        resultType:  CameraResultType.Base64,
        quality:     85,
        correctOrientation: true,
      })
      return base64ToFile(`data:image/jpeg;base64,${photo.base64String}`, 'photo.jpg')
    } catch (err) {
      if (!err.message?.includes('cancelled')) setError(err.message)
      return null
    }
  }

  async function pickFromGallery() {
    setError(null)
    if (!isNative()) return null

    try {
      const { Camera, CameraSource, CameraResultType } = await import('@capacitor/camera')
      const photo = await Camera.getPhoto({
        source:      CameraSource.Photos,
        resultType:  CameraResultType.Base64,
        quality:     85,
      })
      return base64ToFile(`data:image/jpeg;base64,${photo.base64String}`, 'gallery.jpg')
    } catch (err) {
      if (!err.message?.includes('cancelled')) setError(err.message)
      return null
    }
  }

  return { takePhoto, pickFromGallery, isNative: isNative(), error }
}

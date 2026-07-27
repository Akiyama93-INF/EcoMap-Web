// firebase/notificationService.js — v2 (@capacitor/push-notifications oficial)

import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from './firebaseInit'

async function guardarToken(uid, token) {
  try {
    await updateDoc(doc(db, 'users', uid), {
      fcmToken:  token,
      updatedAt: Timestamp.now(),
    })
    console.log('[FCM] Token guardado:', token)
  } catch (err) {
    console.warn('[FCM] Error guardando token:', err)
  }
}

const notificationService = {

  async inicializar(uid) {
    if (!Capacitor.isNativePlatform()) return null

    try {
      const permStatus = await PushNotifications.requestPermissions()
      if (permStatus.receive !== 'granted') {
        console.warn('[FCM] Permiso denegado')
        return null
      }

      await PushNotifications.register()

      PushNotifications.addListener('registration', async (token) => {
        console.log('[FCM] Token recibido:', token.value)
        await guardarToken(uid, token.value)
      })

      PushNotifications.addListener('registrationError', (err) => {
        console.error('[FCM] Error de registro:', err)
      })

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[FCM] Notificación recibida:', notification)
        notificationService._onForegroundMessage?.(notification)
      })

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('[FCM] Notificación tocada:', action.notification)
        notificationService._onNotificationTap?.(action.notification)
      })

    } catch (err) {
      console.error('[FCM] Error al inicializar:', err)
      return null
    }
  },

  async limpiarAlLogout(uid) {
    if (!Capacitor.isNativePlatform()) return
    try {
      await PushNotifications.removeAllListeners()
      await updateDoc(doc(db, 'users', uid), {
        fcmToken:  null,
        updatedAt: Timestamp.now(),
      })
    } catch (err) {
      console.warn('[FCM] Error limpiando token:', err)
    }
  },

  _onForegroundMessage: null,
  _onNotificationTap:   null,

  onForegroundMessage(fn) { this._onForegroundMessage = fn },
  onNotificationTap(fn)   { this._onNotificationTap   = fn },
}

export default notificationService
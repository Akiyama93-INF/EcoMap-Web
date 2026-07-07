// Firebase Configuration
// IMPORTANTE: Esta es una configuración de ejemplo. Debes reemplazar los valores con tus propias credenciales.
// Obtén estas credenciales desde: https://console.firebase.google.com/
// 1. Ir a Firebase Console
// 2. Seleccionar tu proyecto
// 3. Ir a Configuración del proyecto
// 4. Copiar los datos de la aplicación web

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export default firebaseConfig

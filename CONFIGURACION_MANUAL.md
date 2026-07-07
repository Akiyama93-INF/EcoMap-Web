# CONFIGURACIÓN MANUAL REQUERIDA

## Firebase Setup - Pasos Importantes

Esta aplicación utiliza Firebase para almacenamiento, autenticación y base de datos. Sigue estos pasos para configurar todo correctamente.

---

## 1. CREAR PROYECTO EN FIREBASE CONSOLE

**Dónde hacerlo:**
- Ir a: https://console.firebase.google.com/

**Pasos:**
1. Click en "Agregar proyecto"
2. Ingresa un nombre (ej: "EcoMap Basureros")
3. Selecciona o crea una cuenta de Google
4. Completa la configuración del proyecto

---

## 2. HABILITAR FIRESTORE DATABASE

**Dónde hacerlo:**
- En Firebase Console → Tu Proyecto → "Build" (en la barra izquierda) → "Firestore Database"

**Pasos:**
1. Click en "Create database"
2. Selecciona región: `us-central1` (o tu región más cercana)
3. Modo: Selecciona **"Start in test mode"** (para desarrollo)
4. Click en "Create"

**Nota:** En producción, debes cambiar las reglas de seguridad.

---

## 3. HABILITAR CLOUD STORAGE

**Dónde hacerlo:**
- En Firebase Console → Tu Proyecto → "Build" → "Storage"

**Pasos:**
1. Click en "Get started"
2. Selecciona la misma región que Firestore
3. Selecciona **"Start in test mode"**
4. Click en "Create"

---

## 4. HABILITAR AUTHENTICATION

**Dónde hacerlo:**
- En Firebase Console → Tu Proyecto → "Build" → "Authentication"

**Pasos:**
1. Click en "Get started"
2. Proveedores a habilitar:
   - **Email/Password:** Click en "Email/Password", actívalo, y click "Save"
   - **Google:** Click en "Google", selecciona tu email, y click "Save"

---

## 5. OBTENER CREDENCIALES

**Dónde hacerlo:**
- En Firebase Console → Tu Proyecto → Icono de Engranaje (⚙️) en la parte superior izquierda → "Project settings"

**Qué copiar:**
En la sección "Your apps", bajo "Web apps", encontrarás una sección como esta:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "ecomap-xxxx.firebaseapp.com",
  projectId: "ecomap-xxxx",
  storageBucket: "ecomap-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234efgh5678"
};
```

---

## 6. ACTUALIZAR ARCHIVO .env

**Qué archivo modificar:**
- `/ecomap-basureros-el-salvador/.env`

**Qué líneas modificar:**
Reemplaza los valores de ejemplo con los obtenidos de Firebase:

```
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=ecomap-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ecomap-xxxx
VITE_FIREBASE_STORAGE_BUCKET=ecomap-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234efgh5678
```

---

## 7. VERIFICAR INSTALACIÓN

Una vez completados los pasos anteriores:

1. Abre la terminal en la carpeta del proyecto
2. Ejecuta: `npm install`
3. Ejecuta: `npm run dev`
4. Accede a: `http://localhost:5173`

Si ves la aplicación funcionando, ¡todo está correcto! ✅

---

## 🔒 NOTAS DE SEGURIDAD

⚠️ **NUNCA** subas archivos con credenciales reales a GitHub.
- El archivo `.env` ya está en `.gitignore` (protegido)
- Mantén tus API Keys privadas y seguras
- En producción, usa variables de entorno seguras del servidor

---

## ❓ PROBLEMAS COMUNES

### "Error: Firebase app not initialized"
- Verifica que el archivo `.env` existe y tiene las credenciales correctas
- Asegúrate de que copiaste los valores exactamente

### "Permission denied in Firestore"
- Esto es normal en modo test. No cambies las reglas de seguridad por ahora
- En producción, debes implementar reglas de seguridad apropiadas

### No puedo iniciar sesión con Google
- Verifica que Google Authentication está habilitado en Firebase Console
- El dominio localhost:5173 debería estar autorizado automáticamente

---

## 📚 REFERENCIAS

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Guía de React + Firebase](https://firebase.google.com/docs/web/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

---

Una vez completada esta configuración, el proyecto estará listo para usarse. ¡Buena suerte! 🚀

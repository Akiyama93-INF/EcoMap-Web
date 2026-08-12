# 🌎 EcoMap — Mapa Ecológico de El Salvador

**EcoMap** es una plataforma web progresiva y aplicación Android que permite a ciudadanos reportar, visualizar y gestionar puntos ambientales críticos en El Salvador mediante un mapa interactivo en tiempo real.

El objetivo es facilitar la participación ciudadana en la identificación de problemas ambientales, manteniendo un sistema organizado de reportes con validaciones, imágenes, seguimiento comunitario, perfiles de usuario y funcionamiento offline.

🌐 **Sitio web:** [https://ecomapwebproyect.netlify.app](https://ecomapwebproyect.netlify.app)  
📱 **APK Android:** disponible en [Releases](../../releases)

---

## ✨ Características principales

### 🗺️ Mapa interactivo
- Visualización de El Salvador mediante OpenStreetMap (modo claro) y CartoDB Dark Matter (modo oscuro)
- Navegación con Leaflet y restricción geográfica estricta al territorio salvadoreño
- Detección de ubicación del usuario con marcador animado de doble pulso
- Tiles oscuros sincronizados automáticamente con el tema de la aplicación
- Buscador de lugares con AbortController, debounce optimizado, deduplicación de resultados y filtrado por tipo de entidad
- **Mapa interno del campus INSA** con plano real en coordenadas CRS.Simple — scope completamente independiente del mapa nacional

### 📝 Sistema de reportes
- Creación de reportes con categoría, descripción, ubicación e imagen
- Pin de ubicación sincronizado en tiempo real con las coordenadas exactas del reporte
- GPS de alta precisión (`enableHighAccuracy: true`, sin caché) disponible directamente desde el formulario
- **9 categorías disponibles:**
  - 🗑️ Basurero clandestino
  - ♻️ Punto ecológico
  - ⚠️ Incidente ambiental
  - 🏞️ Río contaminado
  - 💡 Poste de luz dañado
  - 🚰 Chorro público dañado
  - 🔧 Tubería dañada
  - 🚧 Obstrucción vial
- Subtypes por categoría con campos de infraestructura especializados
- Vista previa de imágenes antes de enviar
- Validación de archivos: JPG, PNG, WEBP — máximo 5 MB
- Detección de reportes cercanos (radio de 30 m) para evitar duplicados
- Coordenadas exactas para todos los tipos de reporte — los sitios públicos deben ser localizables

### 📷 Cámara nativa en Android
- Botón **Tomar foto** — abre la cámara trasera nativa del dispositivo vía `@capacitor/camera`
- Botón **Galería** — accede al selector de fotos del sistema
- En el navegador web usa `input[capture=environment]` como fallback
- Detección automática del entorno (nativo vs. web)

### 🔄 Ciclo de vida de reportes

```
Nuevo reporte → Pendiente → Confirmado (votos) → Resuelto
```

- 🟡 **Pendiente** — recién creado
- 🟢 **Confirmado** — validado por la comunidad
- 🔵 **Resuelto** — atendido por el creador

El cambio a "Resuelto" solicita confirmación explícita antes de ejecutarse para evitar cierres accidentales.

### 👥 Sistema colaborativo
- Confirmaciones comunitarias: un voto por usuario mediante `arrayUnion`
- Botón contextual según categoría del reporte
- Control de acciones según propietario del reporte
- Sistema de comentarios en tiempo real con Firestore subcollections
- Validación mínima de 3 caracteres en comentarios con contador visible

### 👤 Perfiles de usuario
- Nombre de usuario personalizable (displayName)
- **Foto de perfil:** upload directo a Cloudinary, sincronizada en Firebase Auth y Firestore
- Avatar con inicial del nombre como fallback cuando no hay foto
- Foto visible en la navbar en todo momento
- Contador de reportes enviados por el usuario
- Resolución automática de nombres en reportes antiguos (sin sobrescribir Firestore)

### 🌙 Modo oscuro completo
- Tema global compartido con `ThemeContext`
- Tiles del mapa cambian automáticamente entre OSM y CartoDB Dark Matter
- Variables CSS para todos los colores — popups de Leaflet, formularios y sidebar incluidos
- Popup del mapa correctamente tematizado en modo oscuro

### 📶 Modo offline
- Firebase IndexedDB Persistence: reportes disponibles sin internet
- Listener `onSnapshot` para sincronización automática al reconectarse
- Banner de aviso cuando no hay conexión
- Validación que impide subir imágenes sin conexión

### 🔒 Seguridad
- Reglas de Firestore: solo usuarios autenticados pueden crear reportes
- Validación de ownership en servidor antes de modificar el estado de un reporte
- Solo el propietario puede modificar o eliminar su reporte
- Variables de entorno para todas las credenciales sensibles
- Restricción geográfica estricta: operación exclusiva dentro de El Salvador

---

## 🛠️ Tecnologías utilizadas

| Área | Tecnología |
|---|---|
| Frontend | React 18 + Vite + CSS Variables |
| Mapa nacional | Leaflet + React Leaflet + OpenStreetMap |
| Mapa INSA | Leaflet CRS.Simple + plano PNG del campus |
| Tiles oscuros | CartoDB Dark Matter |
| Base de datos | Firebase Firestore (tiempo real + offline) |
| Autenticación | Firebase Auth (Google + email/contraseña) |
| Imágenes | Cloudinary |
| Geolocalización | Nominatim API (limitado a El Salvador) |
| App móvil | Capacitor 8 + Android Studio |
| Cámara nativa | @capacitor/camera |

---

## 📁 Estructura del proyecto

```
src/
├── assets/           # Recursos gráficos
├── components/       # Componentes reutilizables
│   └── map/          # Componentes específicos del mapa
├── context/          # ThemeContext — tema global
├── firebase/         # Configuración e inicialización de Firebase
├── hooks/            # Hooks personalizados
│   ├── useAuth.js
│   ├── useCameraNative.js
│   ├── useGeolocation.js
│   ├── useNominatim.js
│   ├── useReports.js
│   ├── useTheme.js
│   └── useUserProfile.js
├── pages/            # Páginas principales
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Profile.jsx
├── styles/           # CSS globales y por componente
├── utils/            # Categorías, privacidad, helpers
├── App.jsx
└── main.jsx
```

---

## 📦 Instalación

### Requisitos
- Node.js 18+
- npm
- Android Studio (opcional, para APK)

### Clonar repositorio
```bash
git clone https://github.com/Akiyama93-INF/EcoMap-Web.git
cd EcoMap-Web
```

### Instalar dependencias
```bash
npm install
```

### Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

### Ejecutar en desarrollo
```bash
npm run dev
```
Abrir: `http://localhost:5173`

---

## 🔥 Configuración Firebase

### Authentication
- Google (OAuth)
- Email y contraseña

### Firestore — colección `reports`
```javascript
{
  userId:            string,
  userName:          string,        // displayName resuelto automáticamente
  category:          string,
  reportType:        string,
  subtypes:          string[],
  description:       string,
  lat:               number,
  lng:               number,
  scope:             'nacional' | 'insa',
  imageUrl:          string | null,
  status:            'pending' | 'confirmed' | 'resolved',
  confirmations:     string[],
  confirmationCount: number,
  resolvedBy:        string | null,
  resolvedAt:        timestamp | null,
  createdAt:         timestamp,
  updatedAt:         timestamp,
}
```

### Firestore — colección `users`
```javascript
{
  displayName: string,
  email:       string,
  photoURL:    string | null,
  createdAt:   timestamp,
  updatedAt:   timestamp,
}
```

### Reglas de seguridad
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null
        && (resource.data.userId == request.auth.uid
            || request.resource.data.keys().hasOnly([
                'confirmations', 'confirmationCount',
                'status', 'updatedAt', 'resolvedBy', 'resolvedAt'
               ]));
      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

---

## ☁️ Configuración Cloudinary

Cloudinary almacena las imágenes de los reportes y fotos de perfil.

- Plan gratuito suficiente para el volumen del proyecto
- Optimización automática de imágenes
- Menor carga sobre la cuota de Firebase

---

## 🚀 Build de producción web

```bash
npm run build
npm run preview
```

---

## 📱 Build Android (APK)

```bash
npm run build
npx cap sync android
```

Desde Android Studio: **Build → Generate Signed Bundle / APK → APK → release**

El APK firmado queda en:
```
android/app/build/outputs/apk/release/app-release.apk
```

**Permisos configurados en AndroidManifest.xml:**
- `CAMERA` — cámara nativa para reportes
- `READ_MEDIA_IMAGES` — galería (Android 13+)
- `READ_EXTERNAL_STORAGE` — galería (Android 12 e inferior)
- `ACCESS_FINE_LOCATION` — geolocalización precisa
- `ACCESS_COARSE_LOCATION` — geolocalización aproximada
- `INTERNET` — Firebase y Cloudinary

---

## 🤝 Contribuir

1. Crear un Fork
2. Crear una rama:
```bash
git checkout -b feature/NuevaFuncion
```
3. Realizar cambios y hacer commit:
```bash
git commit -m "feat: descripción del cambio"
```
4. Enviar Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 📧 Contacto

**Equipo EcoMap** — Instituto Nacional de Santa Ana (INSA), Especialidad ITSI 2° "H"

Correo: ecomap.proyecto@gmail.com

---

## 📋 Historial de versiones

### 🌎 EcoMap v3.2.0 — 10 de agosto de 2026
Correcciones de precisión, rendimiento y seguridad.

- Pin de ubicación sincronizado con las coordenadas exactas del reporte
- Removido el desplazamiento de privacidad en marcadores de sitios públicos — los reportes ahora aparecen en su ubicación real
- Consulta de reportes filtrada por scope directamente en Firestore (mejora de rendimiento)
- Buscador de lugares mejorado con deduplicación y filtrado por tipo de entidad
- Validación de ownership en servidor antes de cambiar el estado de un reporte
- Corregida doble escritura de `createdAt` en login con Google
- Confirmación explícita antes de marcar un reporte como resuelto
- Validación mínima y contador de caracteres en comentarios
- Radio de detección de duplicados ajustado de 50 m a 30 m

### 🌎 EcoMap v3.1.0
Mapa interno del campus INSA con CRS.Simple y plano PNG real. Arquitectura dual-scope (nacional / INSA) con estadísticas independientes por alcance. Autenticación con Google OAuth. Notificaciones push con Firebase Cloud Messaging y Capacitor. Sistema de comentarios en tiempo real con subcollections de Firestore. Compartir reportes por WhatsApp. Reverse geocoding con Nominatim. Subida de foto de perfil con Cloudinary.

### 🌎 EcoMap v3.0.0
Primera versión completa con APK Android, cámara nativa, perfiles con foto, modo oscuro total, 9 categorías de reporte incluyendo infraestructura urbana, sistema colaborativo de confirmaciones y seguridad de producción.

Construido para facilitar la participación ciudadana y mejorar la gestión de problemas ambientales en El Salvador.

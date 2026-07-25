#EcoMap — Mapa Ecológico de El Salvador

**EcoMap** es una plataforma web progresiva que permite a ciudadanos reportar, visualizar y gestionar puntos ambientales críticos en El Salvador mediante un mapa interactivo en tiempo real.

El objetivo es facilitar la participación ciudadana en la identificación de problemas ambientales, manteniendo un sistema organizado de reportes con validaciones, imágenes, seguimiento comunitario y funcionamiento offline.

🌐 **Sitio web:** [https://ecomapwebproyect.netlify.app](https://ecomapwebproyect.netlify.app)

---

## ✨ Características principales

### 🗺️ Mapa interactivo
- Visualización de El Salvador mediante OpenStreetMap (modo claro) y CartoDB Dark Matter (modo oscuro)
- Navegación con Leaflet y restricción geográfica estricta al territorio salvadoreño
- Detección de ubicación del usuario con marcador animado de doble pulso
- Tiles oscuros sincronizados automáticamente con el tema de la aplicación
- Buscador de lugares con AbortController y debounce optimizado para evitar peticiones duplicadas

### 📝 Sistema de reportes
- Creación de reportes con categoría, descripción, ubicación e imagen
- Categorías disponibles:
  - 🗑️ Basurero clandestino
  - ♻️ Punto ecológico
  - ⚠️ Incidente ambiental
  - 🏞️ Río contaminado *(nuevo)*
- Subtypes por categoría (materiales aceptados, tipo de contaminación, etc.)
- Vista previa de imágenes antes de enviar
- Validación de archivos: JPG, PNG, WEBP — máximo 5 MB
- Detección de reportes cercanos para evitar duplicados
- Coordenadas aproximadas para reportes en categorías sensibles (privacidad)

### 🔄 Ciclo de vida de reportes

```
Nuevo reporte → Pendiente → Confirmado (2 votos) → Resuelto
```

- 🟡 **Pendiente** — recién creado
- 🟢 **Confirmado** — validado por la comunidad
- 🔵 **Resuelto** — atendido por el creador (`Marcar como limpio` para basureros)

### 👥 Sistema colaborativo
- Confirmaciones comunitarias: un voto por usuario mediante `arrayUnion`
- Botón contextual según categoría del reporte
- Control de acciones según propietario del reporte

### 🌙 Modo oscuro
- Tema global compartido con `ThemeContext` entre todos los componentes
- Tiles del mapa cambian automáticamente entre OSM y CartoDB Dark Matter
- Variables CSS para todos los colores — compatible con dark mode en popups y formularios

### 📶 Modo offline
- Firebase IndexedDB Persistence: reportes cargados disponibles sin internet
- Listener `onSnapshot` para sincronización automática al reconectarse
- Banner de aviso cuando no hay conexión
- Validación que impide subir imágenes sin conexión (Cloudinary requiere internet)

### 🔒 Seguridad
- Reglas de Firestore: solo usuarios autenticados pueden crear reportes
- El `userId` del reporte debe coincidir con el del usuario autenticado
- Solo el propietario puede editar o eliminar su reporte
- Variables de entorno para todas las credenciales
- Restricción geográfica: operación exclusiva dentro de El Salvador

---

## 🛠️ Tecnologías utilizadas

| Área | Tecnología |
|---|---|
| Frontend | React 18 + Vite + CSS Variables |
| Mapa | Leaflet + React Leaflet + OpenStreetMap |
| Tiles oscuros | CartoDB Dark Matter |
| Base de datos | Firebase Firestore (tiempo real + offline) |
| Autenticación | Firebase Auth (email/contraseña + Google) |
| Imágenes | Cloudinary (almacenamiento gratuito) |
| Geolocalización | Nominatim API (limitado a El Salvador) |
| App móvil | Capacitor + Android Studio |

---

## 📁 Estructura del proyecto

```
src/
├── assets/           # Recursos gráficos
├── components/       # Componentes reutilizables
│   └── map/          # Componentes específicos del mapa
├── context/          # ThemeContext — tema global
├── firebase/         # Configuración e inicialización de Firebase
├── hooks/            # Hooks personalizados (useTheme, useReports, useNominatim...)
├── pages/            # Páginas principales (Home, Login, Register)
├── styles/           # Archivos CSS globales y por componente
├── utils/            # Categorías, privacidad, helpers
├── App.jsx
└── main.jsx
```

---

## 📦 Instalación

### Requisitos
- Node.js 16+
- npm
- Android Studio *(opcional, para versión móvil)*

### Clonar repositorio
```bash
git clone <repository-url>
cd EcoMap
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
- Email y contraseña
- Google

### Firestore — colección `reports`
```javascript
{
  userId:            string,
  userName:          string,
  category:          string,
  reportType:        string,
  subtypes:          string[],
  description:       string,
  lat:               number,
  lng:               number,
  imageUrl:          string | null,
  status:            'pending' | 'confirmed' | 'resolved',
  confirmations:     string[],   // userIds
  confirmationCount: number,
  resolvedBy:        string | null,
  resolvedAt:        timestamp | null,
  createdAt:         timestamp,
  updatedAt:         timestamp,
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
  }
}
```

---

## ☁️ Configuración Cloudinary

Cloudinary almacena las imágenes de los reportes de forma independiente a Firebase.

**Ventajas:**
- Plan gratuito suficiente para el volumen del proyecto
- Optimización automática de imágenes
- Menor carga sobre la cuota de Firebase

---

## 🚀 Build de producción

```bash
npm run build
npm run preview
```

---

## 📱 Construcción Android

```bash
npm run build
npx cap sync
npx cap open android
```

Desde Android Studio se genera la APK firmada para distribución.

**Permisos configurados:**
- Ubicación
- Cámara
- Internet

---

## 🛣️ Futuras mejoras

- 👤 Panel de perfil de usuario con nombre visible
- 🛡️ Roles administrativos para moderación
- 📊 Estadísticas ambientales por zona y categoría
- 🔔 Push notifications con Firebase Cloud Messaging
- 💬 Comentarios en reportes
- 🗺️ Mapa de calor de zonas críticas
- 📈 Dashboard de análisis para instituciones
- 🔎 Filtros avanzados en el mapa

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

## 🌎 EcoMap v2.1.0

Plataforma web estable con modo offline, modo oscuro completo, sistema colaborativo y seguridad de producción.

Construido para facilitar la participación ciudadana y mejorar la gestión de problemas ambientales en El Salvador.

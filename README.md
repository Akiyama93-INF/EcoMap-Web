# 🌎 EcoMap — Mapa Ecológico de El Salvador

**EcoMap** es una plataforma web y aplicación Android que permite a ciudadanos reportar, visualizar y gestionar puntos ambientales críticos en El Salvador mediante un mapa interactivo en tiempo real.

El objetivo es facilitar la participación ciudadana en la identificación de problemas ambientales, con un sistema organizado de reportes, validaciones comunitarias, imágenes, comentarios, perfiles de usuario y funcionamiento offline.

🌐 **Sitio web:** [https://ecomapwebproyect.netlify.app](https://ecomapwebproyect.netlify.app)
📱 **APK Android:** disponible en [Releases](../../releases)

---

## ✨ Características principales

### 🗺️ Mapas interactivos
- Mapa nacional de El Salvador con OpenStreetMap (claro) y CartoDB Dark Matter (oscuro)
- Navegación con Leaflet y restricción geográfica estricta al territorio salvadoreño
- Detección de ubicación del usuario con marcador animado de doble pulso
- Buscador de lugares con debounce, deduplicación y filtrado por tipo de entidad
- **Mapa interno del campus INSA** con plano real en coordenadas CRS.Simple — scope completamente independiente del mapa nacional

### 🔍 Búsqueda en tiempo real
- Input de búsqueda integrado en la lista de reportes
- Busca simultáneamente en descripción, categoría, nombre de usuario y departamento
- **Resaltado visual** de las coincidencias directamente en cada tarjeta
- Contador dinámico: "3 de 12" cuando hay búsqueda activa
- Atajo de teclado `/` para enfocar el input, `Escape` para limpiar
- Estado vacío inteligente con botón para limpiar la búsqueda

### 📝 Sistema de reportes
- Creación de reportes con categoría, descripción, ubicación e imagen
- GPS de alta precisión disponible directamente desde el formulario
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
- Detección de reportes cercanos (radio de 30 m) para evitar duplicados
- Filtros por categoría con contadores y ordenamiento por fecha o confirmaciones

### 📤 Compartir por WhatsApp
- Botón de WhatsApp en cada tarjeta de reporte
- **Deep link directo al reporte:** el link abre EcoMap, vuela al marcador y abre el popup automáticamente
- Mensaje enriquecido con categoría, departamento, confirmaciones, fecha y descripción truncada
- Al abrir el deep link, el param `?reportId=` se limpia del URL con `history.replaceState`

### 🔄 Ciclo de vida de reportes

```
Nuevo reporte → Pendiente → Confirmado (votos) → Resuelto
```

- 🟡 **Pendiente** — recién creado
- 🟢 **Confirmado** — validado por la comunidad
- 🔵 **Resuelto** — atendido por el creador

El cambio a "Resuelto" solicita confirmación explícita antes de ejecutarse.

### 👥 Sistema colaborativo
- Confirmaciones comunitarias: un voto por usuario
- Sistema de comentarios en tiempo real con Firestore subcollections
- Eliminación de comentarios propios
- Validación mínima de 3 caracteres con contador visible

### 👤 Perfiles de usuario
- Nombre de usuario personalizable
- Foto de perfil con upload a Cloudinary, sincronizada en Firebase Auth y Firestore
- Avatar con inicial del nombre como fallback
- **Historial de reportes propios** con estado, descripción y fecha — cargado con query directa sin descargar toda la base de datos
- Contador de reportes enviados

### 📊 Panel de estadísticas
- Vista por scope: Nacional, INSA o combinada
- Tarjetas de totales: pendientes, confirmados, resueltos con tasas
- Barras por categoría y departamento (nacional) / zonas del campus (INSA)
- Reporte más confirmado destacado
- Estado vacío con CTA que lleva al mapa correspondiente

### 🌙 Modo oscuro completo
- Tema global con `ThemeContext`
- Tiles del mapa cambian automáticamente
- Variables CSS para todos los colores incluyendo popups de Leaflet

### 📶 Modo offline
- Firebase IndexedDB Persistence: reportes disponibles sin internet
- Sincronización automática al reconectarse
- Banner de aviso y validación que impide subir imágenes sin conexión

### 📷 Cámara nativa en Android
- Tomar foto con cámara trasera nativa vía `@capacitor/camera`
- Galería con selector del sistema
- Fallback automático a `input[capture]` en navegador web

### 🔒 Seguridad
- Reglas de Firestore: solo usuarios autenticados pueden crear reportes
- Validación de ownership en servidor antes de modificar el estado
- Variables de entorno para todas las credenciales
- Restricción geográfica estricta a El Salvador

---

## 🛠️ Tecnologías

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
| Notificaciones | Firebase Cloud Messaging + @capacitor/push-notifications |

---

## 📁 Estructura del proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── map/              # SearchBar, LocationButton, MapFlyTo, MapControls
│   ├── MarkerList.jsx    # Lista de reportes con búsqueda y filtros
│   ├── ReportForm.jsx    # Formulario de creación de reportes
│   ├── ReportPopup.jsx   # Modal de detalle con comentarios
│   ├── Navbar.jsx        # Navegación con NavLink activo
│   └── ...
├── context/              # ThemeContext — tema global
├── firebase/             # Config, Auth, Firestore, Cloudinary, Notifications
├── hooks/                # useAuth, useReports, useTheme, useCameraNative...
├── pages/
│   ├── Home.jsx          # Mapa + sidebar (scope nacional o INSA)
│   ├── Nacional.jsx      # Scope nacional
│   ├── INSA.jsx          # Scope campus INSA
│   ├── Estadisticas.jsx  # Panel de estadísticas dual-scope
│   ├── Profile.jsx       # Perfil con historial de reportes
│   ├── Login.jsx
│   ├── Register.jsx
│   └── NotFound.jsx      # 404 con identidad de EcoMap
├── styles/               # CSS globales y por componente
├── utils/                # categories.js, privacy.js, helpers.js
├── App.jsx               # Rutas con lazy loading y Suspense
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
Crear un archivo `.env` en la raíz:

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

## 🚀 Build de producción web

```bash
npm run build
```

Netlify detecta el push a `main` y hace el deploy automáticamente.

---

## 📱 Build Android (APK firmado)

```bash
npm run build
npx cap sync android
```

Desde Android Studio: **Build → Generate Signed Bundle / APK → APK → release**

El APK firmado queda en:
```
android/app/release/app-release.apk
```

**Permisos en AndroidManifest.xml:**
- `CAMERA` — cámara nativa
- `READ_MEDIA_IMAGES` — galería (Android 13+)
- `READ_EXTERNAL_STORAGE` — galería (Android 12 e inferior)
- `ACCESS_FINE_LOCATION` — geolocalización precisa
- `ACCESS_COARSE_LOCATION` — geolocalización aproximada
- `INTERNET` — Firebase y Cloudinary

---

## 🔥 Estructura Firestore

### Colección `reports`
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

### Colección `users`
```javascript
{
  displayName: string,
  email:       string,
  photoURL:    string | null,
  createdAt:   timestamp,
  updatedAt:   timestamp,
}
```

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama: `git checkout -b feature/NuevaFuncion`
3. Commit: `git commit -m "feat: descripción del cambio"`
4. Pull Request a `main`

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 📧 Contacto

**Equipo EcoMap** — Instituto Nacional de Santa Ana (INSA), Especialidad ITSI 2° "H"
Correo: ecomap.proyecto@gmail.com

---

## 📋 Historial de versiones

### 🌎 EcoMap v3.3.0 — 16 de agosto de 2026
Búsqueda en tiempo real, rendimiento y pulido visual.

- 🔍 Búsqueda por texto en la lista de reportes con resaltado de coincidencias, atajo `/` y contador dinámico
- 🔗 WhatsApp con deep link directo al reporte y mensaje enriquecido con departamento, confirmaciones y fecha
- 📋 Historial de reportes propios en la página de perfil
- 🗺️ Página 404 con identidad de EcoMap — marcador animado, GPS falso y cuadrícula de mapa
- 🚀 Lazy loading de todas las páginas con React.lazy + Suspense
- ✅ NavLink activo en navbar con indicador visual
- 🌿 Estado vacío enriquecido en Estadísticas con CTA contextual
- 📉 getReportsByUser en perfil — ya no descarga todos los reportes de Firestore
- 🌐 SEO mejorado — metatags completas, Open Graph y canonical en index.html

### 🌎 EcoMap v3.2.0 — 10 de agosto de 2026
Correcciones de precisión, rendimiento y seguridad.

- Pin de ubicación sincronizado con las coordenadas exactas del reporte
- Consulta de reportes filtrada por scope directamente en Firestore
- Buscador de lugares mejorado con deduplicación y filtrado por tipo de entidad
- Validación de ownership en servidor antes de cambiar el estado de un reporte
- Confirmación explícita antes de marcar un reporte como resuelto
- Radio de detección de duplicados ajustado a 30 m

### 🌎 EcoMap v3.1.0
Mapa interno del campus INSA con CRS.Simple. Arquitectura dual-scope. Google OAuth. Notificaciones push con FCM. Comentarios en tiempo real. Compartir por WhatsApp. Reverse geocoding con Nominatim. Foto de perfil con Cloudinary.

### 🌎 EcoMap v3.0.0
Primera versión completa con APK Android, cámara nativa, perfiles con foto, modo oscuro, 9 categorías de reporte, sistema colaborativo de confirmaciones y seguridad de producción.

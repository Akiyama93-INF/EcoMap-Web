# 🌎 EcoMap — Mapa Ecológico de El Salvador

**EcoMap** es una plataforma web y aplicación Android que permite a ciudadanos reportar, visualizar, confirmar y dar seguimiento a problemas ambientales e incidencias de infraestructura en El Salvador mediante mapas interactivos.

El proyecto combina un mapa nacional con un mapa institucional del **Instituto Nacional de Santa Ana (INSA)**, reportes geolocalizados, autenticación, imágenes, participación comunitaria, perfiles de usuario, estadísticas y funciones móviles.

🌐 **Sitio web:** https://ecomapwebproyect.netlify.app  
📱 **APK Android:** disponible en [Releases](../../releases)

---

## ✨ Características principales

### 🗺️ Mapas y navegación

- Mapa nacional basado en **Leaflet + OpenStreetMap**
- Modo oscuro con tiles **CartoDB Dark Matter**
- Restricción geográfica de las búsquedas y reportes al territorio de El Salvador
- Geolocalización del usuario mediante GPS
- Botón **Mi ubicación** compacto integrado al mapa
- Buscador de lugares mediante **Nominatim**
- Búsqueda con debounce, estados de carga, errores, resultados vacíos y cierre del listado
- Selección de una ubicación directamente desde los resultados del buscador
- Marcadores interactivos con información detallada de cada reporte
- Navegación mediante las rutas `/nacional` y `/insa`

### 📱 Experiencia móvil

- Layout **split-screen** en móvil: mapa en la mitad superior, lista de reportes en la inferior, ambos visibles simultáneamente
- Seleccionar un reporte de la lista hace **flyTo** en el mapa en tiempo real
- Feedback visual al seleccionar un reporte — glow verde animado en el ítem
- Botón flotante para volver al inicio de la pantalla
- Saludo personalizado en la barra de navegación cuando hay sesión activa
- Barra de navegación inferior fija para acceso rápido a las secciones principales

### 🏫 Mapa institucional del INSA

EcoMap cuenta con un segundo ámbito completamente independiente del mapa nacional:

- Plano real del campus del **Instituto Nacional de Santa Ana**
- Implementado con **Leaflet `CRS.Simple`**
- Coordenadas internas basadas en el plano del campus
- Reportes independientes mediante el campo `scope`
- Categoría específica de **Basura botada**
- Estadísticas propias del campus
- Visualización y navegación sin utilizar los tiles geográficos nacionales

### 📝 Sistema de reportes

Los usuarios autenticados pueden crear reportes indicando:

- Categoría
- Subtipo, cuando corresponde
- Descripción
- Ubicación
- Fotografía opcional

Características del formulario:

- GPS de alta precisión
- Selección de ubicación sobre el mapa
- Vista previa de imágenes
- Validación de JPG, PNG y WEBP
- Tamaño máximo de imagen de 5 MB
- Detección de reportes cercanos para reducir duplicados
- Campos especializados para determinados tipos de infraestructura
- Subtipos específicos para puntos ecológicos, ríos, postes, chorros públicos, tuberías y obstrucciones viales

### 📋 Categorías nacionales

EcoMap dispone actualmente de **8 categorías nacionales**:

- 🗑️ Basurero clandestino
- ♻️ Punto ecológico
- ⚠️ Incidente ambiental
- 🏞️ Río contaminado
- 💡 Poste de luz dañado
- 🚰 Chorro público dañado
- 🔧 Tubería dañada
- 🚧 Obstrucción vial

El mapa institucional del INSA utiliza además una categoría exclusiva:

- 🗑️ Basura botada

### 🔄 Estado y seguimiento de reportes

Los reportes siguen un flujo de seguimiento comunitario:

```text
Nuevo reporte → Pendiente → Confirmado → Resuelto
```

- 🟡 **Pendiente** — reporte recién creado o todavía sin suficientes confirmaciones
- 🟢 **Confirmado** — la comunidad ha validado que el problema continúa presente
- 🔵 **Resuelto** — el propietario del reporte lo marca como atendido

El sistema valida que el usuario sea propietario antes de modificar el estado de un reporte.

### 👥 Participación comunitaria

- Confirmaciones de reportes mediante un voto por usuario
- Contador de confirmaciones
- Prevención de confirmaciones duplicadas
- Comentarios en tiempo real mediante subcolecciones de Firestore
- Nombre y fotografía del autor en los comentarios
- Eliminación de comentarios únicamente por su autor
- Validación mínima de caracteres al publicar comentarios
- Información temporal del estado del reporte
- Dirección obtenida mediante reverse geocoding cuando está disponible
- Barra visual con fotografía, ubicación y confirmaciones

### 👤 Perfiles de usuario

La sección `/perfil` permite:

- Personalizar el nombre mostrado
- Cambiar la fotografía de perfil
- Subir la fotografía directamente a Cloudinary
- Sincronizar `photoURL` y `displayName` con Firebase
- Mostrar avatar con inicial como fallback
- Consultar el historial de reportes propios

#### 📊 Tu contribución

El perfil incluye estadísticas personales:

- Reportes enviados
- Reportes pendientes
- Reportes confirmados
- Reportes resueltos
- Confirmaciones recibidas de otros usuarios
- Mensaje de contribución basado en la actividad realizada

### 📈 Estadísticas

La sección `/estadisticas` permite analizar los reportes por ámbito:

- **Nacional**
- **INSA**
- **Todos**

Para el ámbito nacional se muestran datos agrupados por departamentos de El Salvador.

Para INSA se utilizan zonas internas del plano del campus.

Cuando se selecciona **Todos**, las estadísticas combinan los reportes nacionales e institucionales manteniendo identificado su ámbito de origen.

### 👋 Experiencia de bienvenida

EcoMap incorpora un modal de bienvenida para visitantes nuevos.

El modal explica:

1. Cómo seleccionar la ubicación de un problema
2. Cómo describir y fotografiar el reporte
3. Cómo participar mediante confirmaciones comunitarias

El visitante puede:

- Crear una cuenta gratuitamente
- Continuar explorando el mapa sin registrarse

La bienvenida se muestra una sola vez por navegador utilizando `localStorage`.

### 🔐 Autenticación

Se admiten dos métodos:

- Correo electrónico y contraseña
- Google — selector nativo en Android, popup en web

El inicio de sesión con Google en Android utiliza `@codetrix-studio/capacitor-google-auth`, que abre el selector de cuentas directamente dentro de la app sin redirigir al navegador externo.

El registro mediante correo incluye:

- Nombre
- Correo electrónico
- Contraseña
- Confirmación de contraseña
- Validación de campos obligatorios
- Validación de nombre mínimo
- Validación de contraseña mínima
- Comprobación de coincidencia de contraseñas

### 📷 Cámara nativa en Android

- Botón **Tomar foto** mediante `@capacitor/camera`
- Acceso a la galería del dispositivo
- Fallback mediante `input[capture=environment]` en navegador
- Detección automática de plataforma nativa o web

### 🔔 Notificaciones móviles

En Android se utiliza **Firebase Cloud Messaging** mediante Capacitor para:

- Solicitar permiso de notificaciones
- Registrar el dispositivo
- Guardar el token FCM asociado al usuario
- Recibir notificaciones en primer plano
- Detectar cuando una notificación es seleccionada

### 🌙 Modo oscuro

- Tema global mediante `ThemeContext`
- Cambio automático de tiles del mapa
- Variables CSS para mantener la interfaz consistente
- Popups, formularios, navegación y componentes adaptados al tema

### 📶 Funcionamiento con conectividad limitada

- Suscripciones de Firestore mediante `onSnapshot`
- Datos de Firestore disponibles mediante su mecanismo de persistencia cuando está configurado
- Indicador visual cuando el dispositivo está sin conexión
- Prevención de nuevos envíos de imágenes cuando no hay conexión

### ⚡ Rendimiento

Las páginas principales se cargan mediante **lazy loading**:

- `Home`, `Nacional`, `INSA`, `Login`, `Register`, `Profile`, `Estadisticas`, `NotFound`

Esto reduce el contenido que debe cargarse inicialmente y permite descargar cada página cuando realmente se necesita.

### 🔒 Seguridad

- Reglas de Firestore para controlar operaciones de usuarios autenticados
- Validación de ownership antes de modificar estados
- Solo el propietario puede modificar o eliminar su reporte
- Solo el autor puede eliminar sus propios comentarios
- Credenciales mediante variables de entorno
- Restricción geográfica de la operación nacional a El Salvador
- Validaciones tanto en la interfaz como en las operaciones de Firebase

---

## 🛠️ Tecnologías utilizadas

| Área | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Enrutamiento | React Router DOM |
| Estilos | CSS / CSS Variables |
| Mapa nacional | Leaflet + React Leaflet + OpenStreetMap |
| Mapa INSA | Leaflet `CRS.Simple` + plano PNG |
| Tiles oscuros | CartoDB Dark Matter |
| Base de datos | Firebase Firestore |
| Autenticación | Firebase Authentication |
| Imágenes | Cloudinary |
| Geolocalización / búsqueda | Nominatim API |
| Aplicación móvil | Capacitor 8 + Android |
| Google Auth nativo | `@codetrix-studio/capacitor-google-auth` |
| Cámara | `@capacitor/camera` |
| Notificaciones | `@capacitor/push-notifications` |
| Build | Vite |

---

## 📁 Estructura del proyecto

```text
EcoMap-Web/
├── android/                  # Proyecto Android de Capacitor
├── public/
│   └── insa-campus-map.png   # Plano del campus INSA
├── src/
│   ├── components/
│   │   ├── map/              # Controles y funciones del mapa nacional
│   │   ├── INSAMapView.jsx   # Mapa institucional INSA
│   │   ├── MapView.jsx       # Mapa nacional
│   │   ├── MarkerList.jsx    # Lista de reportes con búsqueda y filtros
│   │   ├── ReportForm.jsx    # Formulario de reportes
│   │   ├── ReportPopup.jsx   # Detalle y seguimiento del reporte
│   │   ├── ScrollToTopButton.jsx
│   │   ├── WelcomeModal.jsx  # Bienvenida inicial
│   │   └── ...
│   ├── context/
│   │   └── ThemeContext.jsx
│   ├── firebase/
│   │   ├── authService.js
│   │   ├── cloudinaryService.js
│   │   ├── firestoreService.js
│   │   ├── notificationService.js
│   │   ├── profileService.js
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCameraNative.js
│   │   ├── useGeolocation.js
│   │   ├── useNominatim.js
│   │   ├── useReports.js
│   │   ├── useTheme.js
│   │   └── useUserProfile.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Nacional.jsx
│   │   ├── INSA.jsx
│   │   ├── Estadisticas.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── NotFound.jsx
│   ├── styles/
│   │   ├── components/
│   │   └── pages/
│   ├── utils/
│   │   ├── categories.js
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── privacy.js
│   ├── App.jsx
│   └── main.jsx
├── capacitor.config.json
├── package.json
└── README.md
```

---

## 📦 Instalación

### Requisitos

- Node.js 18+
- npm
- Android Studio, únicamente si se desea generar o modificar la aplicación Android

### Clonar el repositorio

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

> `VITE_FIREBASE_STORAGE_BUCKET` forma parte de la configuración del proyecto Firebase, pero las imágenes de EcoMap se almacenan en **Cloudinary**, no mediante Firebase Storage.

### Ejecutar en desarrollo

```bash
npm run dev
```

Abrir:

```text
http://localhost:5173
```

### Comprobar el proyecto

Lint:

```bash
npm run lint
```

Build de producción:

```bash
npm run build
```

Vista previa:

```bash
npm run preview
```

---

## 🔥 Configuración Firebase

EcoMap utiliza Firebase para autenticación, base de datos en tiempo real y notificaciones.

### Authentication

Métodos utilizados:

- Google — nativo en Android, popup en web
- Correo electrónico y contraseña

### Firestore — `reports`

Estructura principal:

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
  status:            string,
  confirmations:     string[],
  confirmationCount: number,
  resolvedBy:        string | null,
  resolvedAt:        timestamp | null,
  createdAt:         timestamp,
  updatedAt:         timestamp
}
```

El campo `scope` permite mantener separados los reportes del mapa nacional y del campus INSA.

### Comentarios

Los comentarios se almacenan como subcolección de cada reporte:

```text
reports/{reportId}/comments/{commentId}
```

Estructura:

```javascript
{
  userId:    string,
  userName:  string,
  photoURL:  string | null,
  text:      string,
  createdAt: timestamp
}
```

### Firestore — `users`

```javascript
{
  displayName: string,
  email:       string,
  photoURL:    string | null,
  fcmToken:    string | null,
  createdAt:   timestamp,
  updatedAt:   timestamp
}
```

### Seguridad

Las reglas de Firestore deben configurarse de acuerdo con las operaciones reales de la aplicación. Como mínimo:

- Lectura de reportes según la política pública definida por el proyecto
- Creación únicamente por usuarios autenticados
- Validación del propietario al modificar reportes
- Eliminación únicamente por el propietario
- Protección de los comentarios frente a modificaciones de otros usuarios
- Escritura del perfil únicamente por su propietario

---

## ☁️ Configuración Cloudinary

Cloudinary almacena:

- Fotografías de los reportes
- Fotografías de perfil

Variables necesarias:

```env
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

Las imágenes se suben mediante `cloudinaryService.js` y se utiliza la URL segura (`secure_url`) devuelta por Cloudinary.

---

## 🚀 Build de producción web

```bash
npm run build
```

Para probar localmente la versión generada:

```bash
npm run preview
```

La aplicación puede desplegarse en servicios compatibles con Vite y React, como Netlify.

---

## 📱 Build Android

EcoMap utiliza Capacitor para empaquetar la aplicación web como aplicación Android.

### Generar la aplicación

```bash
npm run build
npx cap sync android
```

Abrir el proyecto en Android Studio:

```bash
npx cap open android
```

Desde Android Studio:

```text
Build → Generate Signed Bundle / APK → APK
```

El APK de release se genera en:

```text
android/app/build/outputs/apk/release/app-release.apk
```

### Permisos utilizados

- `CAMERA`
- `READ_MEDIA_IMAGES`
- `READ_EXTERNAL_STORAGE` en versiones compatibles
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `INTERNET`
- Permisos de notificaciones requeridos por la versión de Android y Capacitor

---

## 🧭 Rutas principales

| Ruta | Función |
|---|---|
| `/` | Página principal |
| `/nacional` | Mapa nacional |
| `/insa` | Mapa institucional INSA |
| `/estadisticas` | Estadísticas |
| `/perfil` | Perfil y contribuciones |
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `*` | Página 404 |

---

## 🤝 Contribuir

1. Crear un Fork.
2. Crear una rama:

```bash
git checkout -b feature/NuevaFuncion
```

3. Realizar los cambios.
4. Ejecutar las comprobaciones:

```bash
npm run lint
npm run build
```

5. Crear el commit:

```bash
git commit -m "feat: descripción del cambio"
```

6. Enviar un Pull Request.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 📧 Contacto

**Equipo EcoMap** — Instituto Nacional de Santa Ana (INSA), Especialidad ITSI 2° "H"

---

## 📋 Historial de versiones

### 🌎 EcoMap v3.5.5 — Agosto de 2026

Mejoras de experiencia móvil, correcciones críticas de autenticación y rediseño de la interfaz principal.

- Login con Google **nativo en Android** mediante `@codetrix-studio/capacitor-google-auth` — el selector de cuentas abre dentro de la app sin salir a Chrome
- Fix botón "Iniciando sesión" quedaba bloqueado en móvil al usar Google
- Layout **split-screen** en móvil: mapa arriba, lista abajo, ambos visibles al mismo tiempo
- Seleccionar un reporte de la lista hace **flyTo** en el mapa en tiempo real
- Feedback visual al seleccionar reporte — glow verde animado
- Saludo personalizado en la navbar móvil cuando hay sesión activa
- Botón flotante para volver al inicio de la pantalla
- Botón **Mi ubicación** compacto en móvil — ya no ocupa todo el ancho
- Eliminado el footer descriptivo innecesario
- Eliminado el cuadro de bienvenida del sidebar — la lista ocupa ese espacio directamente

### 🌎 EcoMap v3.2.6 — Agosto de 2026

Actualización centrada en experiencia de usuario, perfiles, seguimiento de reportes, navegación y rendimiento.

- Nuevo **modal de bienvenida** para visitantes nuevos
- Opción para crear una cuenta o continuar explorando sin registrarse
- Perfil de usuario ampliado con sección **Tu contribución**
- Estadísticas personales de reportes pendientes, confirmados y resueltos
- Conteo de confirmaciones recibidas por los reportes del usuario
- Cambio y subida de fotografías de perfil mediante Cloudinary
- Popup de reportes rediseñado con información de estado y contexto temporal
- Sistema de comentarios en tiempo real dentro de los reportes
- Eliminación de comentarios restringida al autor
- Buscador de lugares con estados de carga, error y resultados vacíos mejorados
- Estadísticas separadas para los ámbitos Nacional, INSA y Todos
- Lazy loading de las páginas principales

### 🌎 EcoMap v3.2.0 — 10 de agosto de 2026

Correcciones de precisión, rendimiento y seguridad.

- Pin de ubicación sincronizado con las coordenadas exactas del reporte
- Eliminado el desplazamiento de privacidad en marcadores de sitios públicos
- Consulta de reportes filtrada por `scope`
- Validación de ownership antes de cambiar el estado de un reporte
- Corregida la doble escritura de `createdAt` en login con Google
- Radio de detección de duplicados ajustado de 50 m a 30 m

### 🌎 EcoMap v3.1.0

Mapa interno del campus INSA con `CRS.Simple` y plano PNG real. Arquitectura dual-scope (nacional / INSA), autenticación con Google OAuth, notificaciones push mediante Firebase Cloud Messaging y Capacitor, sistema de comentarios en tiempo real, compartir reportes por WhatsApp, reverse geocoding con Nominatim y subida de fotografías de perfil con Cloudinary.

### 🌎 EcoMap v3.0.0

Primera versión completa con APK Android, cámara nativa, perfiles con fotografía, modo oscuro, categorías de reporte de infraestructura urbana, sistema colaborativo de confirmaciones y seguridad de producción.

---

**EcoMap**  
*Tecnología para identificar, documentar y dar seguimiento a problemas que afectan nuestro entorno.*

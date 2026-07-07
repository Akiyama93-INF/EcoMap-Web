SITIO WEB ANTES QUE TODO:https://ecomapwebproyect.netlify.app/



# 🌱 EcoMap - Mapa Ecológico de El Salvador

**EcoMap** es una plataforma web y aplicación móvil que permite reportar, visualizar y gestionar puntos ecológicos y basureros clandestinos en El Salvador mediante un mapa interactivo.

El objetivo es facilitar la participación ciudadana en la identificación de problemas ambientales, manteniendo un sistema organizado de reportes con validaciones, imágenes y seguimiento comunitario.

---

# 📋 Características principales

## 🗺️ Mapa interactivo

* ✅ Visualización del mapa de El Salvador mediante OpenStreetMap.
* ✅ Navegación con Leaflet.
* ✅ Detección de ubicación del usuario.
* ✅ Restricción geográfica para operar únicamente dentro de El Salvador.
* ✅ Visualización de reportes existentes.

## 📝 Sistema de reportes

* ✅ Creación de reportes con:

  * Categoría.
  * Descripción.
  * Ubicación.
  * Imagen.
* ✅ Vista previa de imágenes antes de enviar.
* ✅ Validación de archivos:

  * JPG.
  * PNG.
  * WEBP.
  * Máximo 5 MB.
* ✅ Detección de reportes cercanos para evitar duplicados.
* ✅ Validación contra contenido vacío o spam.

## 🔄 Gestión de estados

Los reportes cuentan con un ciclo de vida:

```
Nuevo reporte
      ↓
Pendiente
      ↓
2 confirmaciones comunitarias
      ↓
Confirmado
      ↓
Resuelto por el creador
```

Estados disponibles:

* 🟡 Pendiente.
* 🟢 Confirmado.
* 🔵 Resuelto.

## 👤 Usuarios

* ✅ Registro e inicio de sesión mediante Firebase Authentication.
* ✅ Gestión de usuarios identificados.
* ✅ Control de acciones según propietario del reporte.

## 📷 Imágenes

* ✅ Subida y gestión de imágenes mediante Cloudinary.
* ✅ Optimización del almacenamiento multimedia.
* ❌ No utiliza Firebase Storage.

## 📱 Aplicación Android

EcoMap también está disponible como aplicación Android mediante Capacitor.

Incluye:

* ✅ Icono personalizado.
* ✅ Splash Screen.
* ✅ Permisos de ubicación.
* ✅ Permisos de cámara.
* ✅ APK firmada para distribución.

---

# 🛠️ Tecnologías utilizadas

## Frontend

* React 18
* Vite
* React Router
* JavaScript ES6+
* CSS

## Mapas

* Leaflet
* React Leaflet
* OpenStreetMap

## Backend y servicios

* Firebase Authentication
* Firebase Firestore
* Cloudinary

## Aplicación móvil

* Capacitor
* Android Studio

---

# 📦 Instalación

## Requisitos

* Node.js 16+
* npm
* Android Studio (opcional, para versión móvil)

---

## Clonar repositorio

```bash
git clone <repository-url>

cd EcoMap
```

---

## Instalar dependencias

```bash
npm install
```

---

## Configuración de variables de entorno

Crear un archivo:

```
.env
```

con las credenciales necesarias:

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

---

## Ejecutar en desarrollo

```bash
npm run dev
```

Abrir:

```
http://localhost:5173
```

---

# 🔥 Configuración Firebase

Servicios utilizados:

## Authentication

Métodos:

* Email/Password.
* Google.

## Firestore

Colección principal:

```
reports
```

Ejemplo:

```javascript
{
  userId: string,
  userName: string,
  category: string,
  description: string,
  lat: number,
  lng: number,
  imageUrl: string,
  status: string,
  confirmations: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

# ☁️ Configuración Cloudinary

Cloudinary se utiliza para almacenar imágenes de reportes.

Ventajas:

* Menor carga sobre Firebase.
* Optimización automática de imágenes.
* Gestión independiente de archivos multimedia.

---

# 📁 Estructura del proyecto

```
src/
├── assets/          # Recursos gráficos
├── components/      # Componentes reutilizables
├── firebase/        # Configuración Firebase
├── hooks/           # Hooks personalizados
├── pages/           # Páginas principales
├── services/        # Servicios externos
├── styles/          # Archivos CSS
├── utils/            # Funciones auxiliares
├── App.jsx
└── main.jsx
```

---

# 🚀 Build de producción

Generar versión optimizada:

```bash
npm run build
```

Vista previa:

```bash
npm run preview
```

---

# 📱 Construcción Android

Comandos principales:

```bash
npm run build

npx cap sync

npx cap open android
```

Desde Android Studio se puede generar la APK firmada.

---

# 🔒 Consideraciones de seguridad

EcoMap implementa:

* Validación de archivos.
* Control de usuarios.
* Restricciones geográficas.
* Protección de ubicación sensible.
* Variables de entorno para credenciales.
* Separación entre frontend, base de datos y almacenamiento multimedia.

---

# 🛣️ Futuras mejoras

Posibles funcionalidades:

* 👤 Panel de usuario.
* 🛡️ Roles administrativos.
* 📊 Estadísticas ambientales.
* 🔔 Sistema de notificaciones.
* 💬 Comentarios en reportes.
* ⭐ Sistema de reputación.
* 🔎 Búsqueda avanzada.
* 📈 Dashboard de análisis.

---

# 🤝 Contribuir

Las contribuciones son bienvenidas.

Proceso:

1. Crear un Fork.
2. Crear una rama:

```bash
git checkout -b feature/NuevaFuncion
```

3. Realizar cambios.
4. Crear commit:

```bash
git commit -m "Añadir nueva funcionalidad"
```

5. Enviar Pull Request.

---

# 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

# 📧 Contacto

Equipo de desarrollo EcoMap.

Para consultas, sugerencias o colaboración:

* Correo oficial del proyecto.
* Repositorio GitHub.

---

## 🌎 EcoMap v1.0

Primera versión estable con plataforma web y aplicación Android.

Construido para facilitar la participación ciudadana y mejorar la gestión de problemas ambientales en El Salvador.

# Historial de EcoMap

## v3.5.6 — 25 de octubre de 2026

- Versión web y del repositorio actualizada a 3.5.6 en el paquete y el lockfile, sin cambiar dependencias.
- Descripción ampliada a reportes ambientales, comunitarios y de infraestructura; metadato de licencia MIT.
- CI con Node.js 22, caché de npm, instalación reproducible, lint, pruebas y build en push y Pull Requests a `main`.
- Guía de contribución, código de conducta y plantillas en español para errores, propuestas y Pull Requests.
- README con versiones web y Android diferenciadas, badge de CI y enlaces a la documentación de colaboración.
- Alcance y recomendaciones pendientes documentados en `docs/maintenance-v3.5.6.md`.

Android permanece en **3.5.5**. Se conserva la licencia MIT y su autoría. Esta actualización no modifica funcionalidades, servicios externos ni configuración nativa; no crea una Release ni publica una APK.

## Actualización web — 24 de octubre de 2026

- Detalle lateral y ancho ajustable para explorar reportes en escritorio.
- Filtros sincronizados entre mapa y lista y panel móvil expandible.
- Estadísticas con periodos, evolución temporal y exportación CSV.
- Perfil con actividad y ajustes separados, búsqueda y paginación del historial.
- Estados consistentes, mejoras de accesibilidad y pruebas de regresión.

Esta actualización web mantiene la versión `3.5.5` declarada en `package.json`. No implica una nueva publicación del APK.

## Versiones anteriores

Las siguientes notas conservan el historial documentado por el proyecto.

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

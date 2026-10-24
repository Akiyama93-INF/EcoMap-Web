# Configuración de servicios

## Firebase

Configura las variables de `.env.example` con los valores públicos de la aplicación web del proyecto Firebase. Habilita Authentication para correo/contraseña y Google, y registra los dominios autorizados utilizados en desarrollo y despliegue. Las vistas previas de Netlify también necesitan una configuración de servicios compatible con su dominio para probar el acceso con Google.

La aplicación inicializa Firestore con persistencia IndexedDB cuando el navegador lo permite. Los mapas, las direcciones y las subidas de imágenes necesitan conectividad; la disponibilidad de algunos datos en caché no equivale a funcionamiento completo sin conexión.

### Modelo de datos

| Ubicación | Contenido |
| --- | --- |
| `reports/{reportId}` | Autor, categoría, subtipos, descripción, ubicación, ámbito, fotografía, estado, confirmaciones y fechas. |
| `reports/{reportId}/comments/{commentId}` | Autor, nombre, foto, texto y fecha del comentario. |
| `users/{userId}` | Nombre público, correo, foto, token de notificaciones y fechas del perfil. |

Los reportes nacionales utilizan `lat` y `lng` geográficos. Los de INSA utilizan coordenadas del plano de 1295 × 1024 y `scope: 'insa'`. El ámbito nacional utiliza `scope: 'nacional'`; algunas lecturas mantienen compatibilidad con registros históricos sin ámbito.

El estado mostrado se calcula con `src/utils/reportFilters.js`: un reporte resuelto conserva esa prioridad; un estado confirmado o confirmaciones existentes se muestran como confirmado; los demás se muestran como pendientes. El servicio crea reportes con el estado almacenado `active` y admite marcar el reporte propio como `resolved`.

### Reglas y permisos

Las validaciones del cliente comprueban la autenticación, la autoría y algunos campos antes de escribir. La protección de los datos debe definirse también en las reglas desplegadas de Firestore.

El archivo `firestore.rules` de este repositorio contiene **un fragmento de solicitudes de resolución**, no un conjunto completo listo para desplegar. Necesita contexto, integración y revisión. No describe por sí solo las reglas activas del proyecto Firebase. El despliegue de Netlify no aplica este archivo.

Comprueba los permisos de reportes, comentarios y perfiles con cuentas de prueba antes de cambiar las reglas del proyecto. Este repositorio no incluye un procedimiento completo de despliegue de reglas mediante Firebase CLI.

## Cloudinary

Configura `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET`. El preset debe permitir el flujo de subida utilizado por el cliente y tener las restricciones de archivos correspondientes.

Se utiliza la URL segura devuelta por Cloudinary para fotografías de reportes y perfiles. La interfaz acepta JPG, PNG o WebP de hasta 5 MB. No añadas el API secret de Cloudinary a variables `VITE_*`.

## Android y notificaciones

El identificador de aplicación y las opciones de Capacitor están en `capacitor.config.json`. Revisa la configuración de Google Auth, las huellas de firma y los archivos de Firebase del entorno Android antes de generar una versión distribuible.

La cámara y Firebase Cloud Messaging requieren sus permisos y configuración nativa. La publicación de la web no reemplaza la sincronización, compilación y distribución del APK.

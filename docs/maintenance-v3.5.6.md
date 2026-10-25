# Mantenimiento web v3.5.6

La versión web y del repositorio pasa de **3.5.5 a 3.5.6**. Android conserva **3.5.5** (`versionCode` 7). Esta actualización abarca metadatos, documentación, plantillas de colaboración y CI; no cambia la aplicación, sus dependencias ni los servicios.

## Comprobaciones automatizadas

El workflow [CI](../.github/workflows/ci.yml) utiliza Node.js 22 y caché de npm. En push a `main` y Pull Requests hacia `main` ejecuta:

```bash
npm ci --legacy-peer-deps
npm run lint
npm test
npm run build
```

Solo solicita permiso `contents: read`. No utiliza secretos, no ejecuta la aplicación ni conecta las pruebas a Firebase o Cloudinary. Tampoco contiene pasos de despliegue, sincronización de Capacitor o compilación de APK. Las integraciones de hosting existentes se administran por separado.

Las pruebas actuales cubren utilidades de filtros y estadísticas. No sustituyen las verificaciones de interfaz, autenticación, permisos o integración con servicios y Android.

## Pendientes para próximas actualizaciones

- Definir un canal privado de moderación y un procedimiento para revisar decisiones; actualizar el [código de conducta](../CODE_OF_CONDUCT.md).
- Definir un canal privado para comunicar vulnerabilidades y documentar una política de seguridad.
- Revisar por separado las dependencias y sus avisos de seguridad. Esta actualización conserva el árbol del lockfile y no constituye una auditoría de vulnerabilidades.
- La instalación advierte sobre paquetes obsoletos, entre ellos ESLint 8 y algunas dependencias transitivas. Evaluar su actualización por separado, con sus pruebas de compatibilidad.
- El build web emite una advertencia por un bloque JavaScript superior a 500 kB minificado. Evaluar su división y rendimiento en un trabajo posterior; no se cambia la configuración ni el código de la aplicación para ocultar el aviso.
- La [guía de servicios](services-setup.md) ya advierte que `firestore.rules` es un fragmento, no un conjunto completo listo para desplegar. Cualquier revisión de reglas debe realizarse en un trabajo independiente con un entorno de prueba.
- Mantener una revisión independiente de las integraciones y archivos de configuración Android ya versionados antes de distribuir un nuevo APK. No se modifican en este mantenimiento.

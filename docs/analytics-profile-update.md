# Estadísticas y perfil

## Interfaz

Ambas pantallas usan superficies neutras, tipografía jerarquizada, bordes discretos y estados identificados con texto. Los estilos comunes están limitados a `.workspace`; los estilos de formularios ya no utilizan selectores globales como `.form-group` o `.submit-btn`.

El perfil distribuye identidad y contenido en dos columnas de escritorio. Las pestañas separan actividad y ajustes, conservando búsquedas y cambios de nombre sin guardar al alternar entre ellas. En teléfono el contenido se apila y usa un único desplazamiento de documento.

## Estadísticas

- Una suscripción de reportes compartida por los filtros, en lugar de consultas duplicadas al alternar entre ámbitos.
- Ámbitos Nacional, Campus INSA y Todos. Los registros sin ámbito se consideran nacionales por compatibilidad.
- Todo el historial o últimos 30, 90 y 365 días. Se filtra por creación, desde medianoche de El Salvador y contando el día actual. Se omiten fechas futuras; los registros sin fecha solo se incluyen en el total histórico.
- Evolución de registros diarios para 30 días y mensuales para los demás periodos. El gráfico histórico muestra los últimos 12 meses; el total histórico puede incluir registros anteriores. Se puede consultar el gráfico como datos textuales.
- Estados actuales y tasa de resolución sobre los reportes de la selección. No se presentan como resoluciones realizadas durante el periodo ni como una verificación externa.
- Categorías, participación comunitaria del campus, comparación de ámbitos y departamentos guardados en los reportes nacionales. No se infieren departamentos mediante rectángulos solapados ni se asignan lugares a coordenadas del campus.
- Exportación CSV de la selección con cinco columnas: categoría, descripción, ámbito, estado y fecha. Escapa comillas, conserva saltos de línea y neutraliza prefijos de fórmulas.
- Diferencia entre carga, error de consulta, falta de conexión y selección sin datos.

## Perfil

- Búsqueda, filtros por estado y ámbito, orden por fecha y paginación de diez elementos con enlaces directos al reporte correcto.
- Estado de carga, error con reintento y ausencia de reportes diferenciados.
- Nombre público con validación, descarte y bloqueo de guardados duplicados.
- Foto JPG, PNG o WebP de hasta 5 MB. La vista previa temporal se libera al sustituirla, cancelarla o desmontar la pantalla.
- La actualización de foto conserva el nombre ya guardado y sincroniza `photoURL` con Firebase Auth y Firestore. Las llamadas de actualización de nombre que omiten la foto la conservan. La navegación se actualiza después de guardar.
- Un avatar que no carga muestra la inicial. Las respuestas tardías de consultas se ignoran al abandonar la cuenta.
- Las pruebas visuales del perfil usaron datos de ejemplo, sin escrituras en cuentas reales. Los archivos de esa vista de prueba no forman parte de la aplicación.

## Validación

`npm run lint`, `npm test` y `npm run build`. Las pruebas incluyen fechas de Firestore, límites de día en El Salvador, registros sin fecha, categorías INSA, conteos, búsqueda y exportación CSV.

Revisar las pantallas a 1440 px y 390 px. Comprobar filtros, estados vacíos y de error, paginación, pestañas con teclado y temas claro/oscuro. Antes de producción, probar guardado de nombre y foto con una cuenta de prueba y comprobar el APK Android. Estas operaciones requieren un inicio de sesión real y acceso a los servicios configurados.

# Comodidad en escritorio y compatibilidad móvil

El mapa permite consultar un reporte en el panel lateral a partir de 1025 px de ancho. Se puede ajustar el panel entre 340 y 560 px, restaurarlo a 400 px u ocultarlo para ampliar el mapa. Su ancho máximo se limita al 45 % del espacio disponible.

En teléfonos y tabletas se conservan la lista expandible y el detalle modal. Escape cierra el detalle; el modal mantiene el foco dentro de sus controles y restaura el desplazamiento de la página al cerrarse. Las preferencias de ancho de escritorio no modifican el diseño móvil.

## Estados

La lista, el detalle, el perfil y las estadísticas usan `getReportStatus`. Un reporte resuelto conserva esa prioridad. Los reportes con estado `confirmed` o con confirmaciones se muestran como confirmados. Los demás, incluido el estado histórico `active` sin confirmaciones, se muestran como pendientes. Esto no migra ni modifica documentos de Firestore.

El detalle toma el reporte actualizado de la suscripción del mapa. Los errores al actualizar su estado o consultar comentarios se muestran en la interfaz. Los comentarios recibidos no desplazan automáticamente al usuario fuera de lo que está leyendo. El plano INSA no envía sus coordenadas internas al servicio de direcciones GPS.

## Verificación

```sh
npm run lint
npm test
npm run build
```

La instalación conserva las versiones ya fijadas en el lockfile. `prop-types` se declara como dependencia directa para validar las propiedades de los componentes en desarrollo. No se desactivaron reglas de lint.

Revisión manual recomendada antes de publicar:

- Escritorio: seleccionar tarjeta, consultar el detalle junto al mapa y volver a la lista conservando filtros.
- Ajustar ancho con teclado, restaurar, ocultar y volver a mostrar el panel.
- Comprobar 1024 y 1025 px, sin desbordamiento horizontal ni controles de escritorio en móvil.
- Teléfono: expandir la lista, abrir el detalle, recorrer los controles con Tab y cerrarlo con Escape o con el botón.
- Comprobar ambos mapas y que INSA muestre una ubicación del campus.
- Con una cuenta de prueba: comentar, confirmar y resolver un reporte propio. Estas operaciones escriben en Firebase y requieren una verificación específica antes de una publicación de producción.

La compilación web no sustituye la comprobación del APK en un dispositivo Android.

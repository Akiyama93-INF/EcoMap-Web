# Contribuir a EcoMap

EcoMap reúne reportes ciudadanos sobre problemas ambientales, comunitarios y de infraestructura en El Salvador y el campus INSA. Puedes colaborar corrigiendo documentación, reportando errores, proponiendo mejoras o enviando código. No necesitas experiencia previa en proyectos abiertos.

Lee el [código de conducta](CODE_OF_CONDUCT.md). El proyecto se distribuye bajo la [licencia MIT](LICENSE); conserva los avisos de autoría al reutilizarlo.

## Preparar el entorno

Necesitas Git, Node.js 22 y npm. La CI utiliza Node.js 22; el README admite versiones superiores compatibles. Android Studio solo es necesario para trabajos específicos de Android.

Si no tienes permiso de escritura, crea un **fork** (una copia en tu cuenta) desde GitHub y clona esa copia. Si tienes permiso, clona el repositorio original:

```bash
git clone https://github.com/Akiyama93-INF/EcoMap-Web.git
cd EcoMap-Web
npm ci --legacy-peer-deps
```

Para un fork, sustituye la URL por la de tu copia. `npm ci` instala las versiones del lockfile; `--legacy-peer-deps` mantiene la compatibilidad del árbol actual de Capacitor y Google Auth. No actualices dependencias como efecto secundario de otro cambio.

Copia [`.env.example`](.env.example) a `.env` con tu editor y completa la configuración de un entorno de desarrollo propio. Consulta la [instalación](README.md#instalación) y la [guía de servicios](docs/services-setup.md). No compartas credenciales, archivos `.env`, claves de firma ni datos personales en commits, capturas o incidencias. Las variables `VITE_*` son visibles en el cliente y no deben contener secretos de servidor.

```bash
npm run dev
```

Abre la dirección que muestre Vite, normalmente `http://localhost:5173`. Las pruebas unitarias y la compilación no necesitan conectarse a Firebase o Cloudinary. Probar las funciones que dependen de esos servicios sí requiere un entorno propio; no uses datos de producción para experimentar.

## Crear una rama y un Pull Request

1. Sincroniza tu rama `main` con el repositorio original antes de comenzar. En un fork puedes usar **Sync fork** en GitHub y después `git pull --ff-only origin main` desde tu `main` local.
2. Crea una rama con un nombre descriptivo:

   ```bash
   git switch -c docs/mejorar-instalacion
   ```

3. Realiza un cambio centrado en un objetivo. Respeta los patrones existentes y añade o ajusta pruebas cuando cambie un comportamiento.
4. Ejecuta las comprobaciones indicadas abajo y revisa `git diff` y `git status`.
5. Añade explícitamente los archivos de tu cambio, crea un commit descriptivo y publica tu rama. Por ejemplo, para una edición del README:

   ```bash
   git add README.md
   git commit -m "docs: aclarar la instalación local"
   git push -u origin docs/mejorar-instalacion
   ```

6. Abre un **Pull Request** desde tu rama hacia `Akiyama93-INF/EcoMap-Web:main`. Explica el problema, el cambio, las áreas afectadas y las comprobaciones realizadas usando la plantilla. Si una comprobación falla o no puedes ejecutarla, incluye el motivo.
7. Atiende los comentarios de revisión con nuevos commits en la misma rama. El equipo mantenedor revisará la propuesta antes de fusionarla.

Para cambios grandes, abre primero una propuesta en [Issues](https://github.com/Akiyama93-INF/EcoMap-Web/issues) y acuerda su alcance.

## Comprobar la calidad

```bash
npm run lint
npm test
npm run build
```

- **Lint:** comprueba JavaScript y JSX en `src/` con ESLint.
- **Pruebas:** usan `node:test` sobre filtros, estados, fechas, estadísticas y CSV, sin llamadas a servicios externos.
- **Build:** genera `dist/`; no incluyas ese directorio ni `node_modules/` en el commit.

[GitHub Actions](https://github.com/Akiyama93-INF/EcoMap-Web/actions/workflows/ci.yml) repite la instalación y esas comprobaciones con Node.js 22 en los Pull Requests hacia `main` y los push a `main`. No utiliza secretos ni realiza despliegues.

Mantén los cambios pequeños, usa nombres claros, conserva la accesibilidad y documenta los ajustes de configuración sin valores privados. No elimines pruebas ni desactives reglas para ocultar un fallo. Para cambios visuales, revisa escritorio y móvil e incluye capturas sin información privada. Una compilación web no sustituye una prueba del APK en dispositivo.

## Reportar errores y proponer mejoras

Busca primero si existe una incidencia similar. En [Issues](https://github.com/Akiyama93-INF/EcoMap-Web/issues/new/choose), elige la plantilla de error o de funcionalidad.

Para un error, describe los pasos para reproducirlo, el resultado esperado y el obtenido, la plataforma, el navegador y la versión web o Android. Añade capturas o mensajes de error si ayudan, retirando información privada. Para una propuesta, explica el problema que resuelve y el beneficio para los usuarios.

El canal privado para comunicar vulnerabilidades y el canal de moderación están pendientes de definir. No publiques detalles explotables, credenciales ni datos personales en incidencias públicas; consulta las [recomendaciones pendientes](docs/maintenance-v3.5.6.md).

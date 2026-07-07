# 🗑️ EcoMap - Basureros El Salvador

Plataforma web para reportar basureros clandestinos en El Salvador mediante un mapa interactivo.

## 📋 Características

- ✅ Visualizar mapa interactivo de El Salvador con OpenStreetMap
- ✅ Seleccionar ubicaciones exactas en el mapa
- ✅ Reportar basureros clandestinos con descripción e imágenes
- ✅ Autenticación con Firebase (Email y Google)
- ✅ Base de datos Firestore para almacenar reportes
- ✅ Almacenamiento de imágenes en Firebase Storage
- ✅ Visualizar reportes de otros usuarios
- ✅ Interfaz responsiva y moderna

## 🛠️ Tecnologías

- **Frontend:** React 18 + Vite
- **Enrutamiento:** React Router
- **Mapas:** Leaflet + React Leaflet + OpenStreetMap
- **Backend:** Firebase (Firestore, Storage, Authentication)
- **Estilos:** CSS Modules y CSS puro

## 📦 Instalación

### Requisitos previos

- Node.js 16+ y npm

### Pasos de instalación

1. Clonar el repositorio:
   ```bash
   git clone <repository-url>
   cd ecomap-basureros-el-salvador
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar Firebase:
   - Copiar `.env.example` a `.env`
   - Completar las variables de entorno con tus credenciales de Firebase

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Acceder a `http://localhost:5173`

## 🔧 Configuración de Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar:
   - **Firestore Database** (modo test para desarrollo)
   - **Cloud Storage**
   - **Authentication** (Email/Password y Google)
3. Obtener las credenciales en Configuración del Proyecto
4. Completar el archivo `.env` con las credenciales

### Estructura de Firestore

Colección: `reports`
```
{
  userId: string,
  userName: string,
  category: string,
  description: string,
  lat: number,
  lng: number,
  imageUrl: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 📁 Estructura del Proyecto

```
src/
├── assets/           # Imágenes y recursos
├── components/       # Componentes reutilizables
├── firebase/         # Configuración y servicios de Firebase
├── hooks/            # Hooks personalizados
├── pages/            # Páginas de la aplicación
├── services/         # Servicios (Firebase, API)
├── styles/           # Estilos CSS
├── utils/            # Utilidades y constantes
├── App.jsx          # Componente principal
└── main.jsx         # Punto de entrada
```

## 🚀 Desarrollo

Para continuar el desarrollo:

1. Ver archivos con comentarios `TODO` para funcionalidades pendientes
2. Implementar funcionalidades en orden de prioridad
3. Mantener la estructura modular y escalable

## 📝 Próximas Funcionalidades

- [ ] Panel de usuario con historial de reportes
- [ ] Filtros y búsqueda avanzada
- [ ] Paginación de reportes
- [ ] Sistema de reputación
- [ ] Comentarios en reportes
- [ ] Notificaciones
- [ ] Estadísticas y análisis
- [ ] Exportar reportes

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 📧 Contacto

Para preguntas o sugerencias, contactar al equipo de desarrollo.

---

**Nota:** Este es un proyecto en desarrollo. Algunas funcionalidades aún no están completamente implementadas.

// App.jsx — Rutas principales de EcoMap
// v3.4.1:
//   - handleRedirectResult al montar: captura resultado de Google login en APK
//   - ScrollToTopButton global

import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/firebaseInit'
import notificationService from './firebase/notificationService'
import authService from './firebase/authService'

import Navbar           from './components/Navbar'
import Footer           from './components/Footer'
import WelcomeModal     from './components/WelcomeModal'
import Loading          from './components/Loading'
import ScrollToTopButton from './components/ScrollToTopButton'

// Paginas cargadas bajo demanda
const Home         = lazy(() => import('./pages/Home'))
const Nacional     = lazy(() => import('./pages/Nacional'))
const INSA         = lazy(() => import('./pages/INSA'))
const Login        = lazy(() => import('./pages/Login'))
const Register     = lazy(() => import('./pages/Register'))
const Profile      = lazy(() => import('./pages/Profile'))
const Estadisticas = lazy(() => import('./pages/Estadisticas'))
const NotFound     = lazy(() => import('./pages/NotFound'))

import './styles/App.css'

// Componente interno que puede usar useNavigate
function AppContent() {
  const navigate = useNavigate()

  useEffect(() => {
    // Captura el resultado del redirect de Google (solo aplica en APK/Capacitor)
    // En web getRedirectResult devuelve null de inmediato sin efecto secundario
    authService.handleRedirectResult()
      .then((user) => {
        if (user) navigate('/')
      })
      .catch(() => {
        // Silenciar — no hay redirect pendiente o el usuario canceló
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        notificationService.inicializar(user.uid)
      }
    })
    return () => unsub()
  }, [])

  return (
    <div className="app-container">
      <Navbar />
      <WelcomeModal />

      <main className="main-content">
        <Suspense fallback={<Loading message="Cargando..." />}>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/nacional"    element={<Nacional />} />
            <Route path="/insa"        element={<INSA />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/perfil"      element={<Profile />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="*"            element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      
      <ScrollToTopButton />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App

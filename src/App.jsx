// App.jsx — Rutas principales de EcoMap
// v3.2.6: lazy loading de paginas para reducir bundle inicial

import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/firebaseInit'
import notificationService from './firebase/notificationService'

import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import WelcomeModal  from './components/WelcomeModal'
import Loading       from './components/Loading'

// Paginas cargadas bajo demanda — solo cuando el usuario navega a esa ruta
const Home         = lazy(() => import('./pages/Home'))
const Nacional     = lazy(() => import('./pages/Nacional'))
const INSA         = lazy(() => import('./pages/INSA'))
const Login        = lazy(() => import('./pages/Login'))
const Register     = lazy(() => import('./pages/Register'))
const Profile      = lazy(() => import('./pages/Profile'))
const Estadisticas = lazy(() => import('./pages/Estadisticas'))
const NotFound     = lazy(() => import('./pages/NotFound'))

import './styles/App.css'

function App() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        notificationService.inicializar(user.uid)
      }
    })

    return () => unsub()
  }, [])

  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">

          <Navbar />
          <WelcomeModal />

          <main className="main-content">
            <Suspense fallback={<Loading message="Cargando..." />}>
            <Routes>

              {/* Página principal */}
              <Route path="/" element={<Home />} />

              {/* Subpáginas de EcoMap */}
              <Route path="/nacional" element={<Nacional />} />
              <Route path="/insa" element={<INSA />} />

              {/* Cuenta */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/perfil" element={<Profile />} />

              {/* Estadísticas */}
              <Route path="/estadisticas" element={<Estadisticas />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>
            </Suspense>
          </main>

          <Footer />

        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
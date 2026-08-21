// App.jsx — v3.4.4
// - Eliminado handleRedirectResult (ya no se necesita con plugin nativo)

import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/firebaseInit'
import notificationService from './firebase/notificationService'

import Navbar            from './components/Navbar'
import WelcomeModal      from './components/WelcomeModal'
import Loading           from './components/Loading'
import ScrollToTopButton from './components/ScrollToTopButton'

const Home         = lazy(() => import('./pages/Home'))
const Nacional     = lazy(() => import('./pages/Nacional'))
const INSA         = lazy(() => import('./pages/INSA'))
const Login        = lazy(() => import('./pages/Login'))
const Register     = lazy(() => import('./pages/Register'))
const Profile      = lazy(() => import('./pages/Profile'))
const Estadisticas = lazy(() => import('./pages/Estadisticas'))
const NotFound     = lazy(() => import('./pages/NotFound'))

import './styles/App.css'

function AppContent() {
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
            <Route path="/"             element={<Home />} />
            <Route path="/nacional"     element={<Nacional />} />
            <Route path="/insa"         element={<INSA />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/perfil"       element={<Profile />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="*"             element={<NotFound />} />
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

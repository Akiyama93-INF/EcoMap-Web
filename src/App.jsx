// App.jsx — Rutas principales de EcoMap

import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/firebaseInit'
import notificationService from './firebase/notificationService'

import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import WelcomeModal  from './components/WelcomeModal'

import Home          from './pages/Home'
import Nacional      from './pages/Nacional'
import INSA          from './pages/INSA'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Profile       from './pages/Profile'
import Estadisticas  from './pages/Estadisticas'
import NotFound      from './pages/NotFound'

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
          </main>

          <Footer />

        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
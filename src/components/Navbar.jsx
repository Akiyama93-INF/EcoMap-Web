// Navbar — Fase 2
// Reemplaza el emoji por el logo oficial del proyecto

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import authService from '../firebase/authService'
import useTheme from '../hooks/useTheme'
import '../styles/components/Navbar.css'

function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.jpg" alt="EcoMap" className="navbar-logo-img" />
          <span className="navbar-logo-text">EcoMap - Juntos por un El Salvador más limpio</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Inicio</Link>
          <button
            onClick={toggleTheme}
            className="navbar-btn theme-btn"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {!loading && (
            <>
              {user ? (
                <>
                  <span className="navbar-user">{user.email}</span>
                  <button onClick={handleLogout} className="navbar-btn logout-btn">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="navbar-link">Iniciar sesión</Link>
                  <Link to="/register" className="navbar-btn register-btn">Registrarse</Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

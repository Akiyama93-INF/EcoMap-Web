// Navbar — Fase 3
// Muestra displayName en lugar de email, avatar con inicial, enlace a /perfil

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import authService from '../firebase/authService'
import useTheme from '../hooks/useTheme'
import UserAvatar from './UserAvatar'
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

  // Nombre a mostrar: displayName → parte del email antes del @
  const displayName = user?.displayName || user?.email?.split('@')[0] || ''

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link to="/" className="navbar-logo">
          <img
            src="/logo.jpg"
            alt="EcoMap"
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">
            <span className="navbar-logo-full">EcoMap - Juntos por un El Salvador más limpio</span>
            <span className="navbar-logo-short">EcoMap</span>
          </span>
        </Link>

        <div className="navbar-menu">

<Link to="/nacional" className="navbar-link">
  EcoMap Nacional
</Link>

<Link to="/insa" className="navbar-link">
  EcoMap INSA
</Link>

<Link to="/estadisticas" className="navbar-link">
  Estadísticas
</Link>

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
                  <Link to="/perfil" className="navbar-user-link">
                    <UserAvatar
                      name={displayName}
                      size={32}
                      photoURL={user?.photoURL}
                    />
                    <span className="navbar-user">
                      {displayName}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="navbar-btn logout-btn"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="navbar-link"
                  >
                    Iniciar sesión
                  </Link>

                  <Link
                    to="/register"
                    className="navbar-btn register-btn"
                  >
                    Registrarse
                  </Link>
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
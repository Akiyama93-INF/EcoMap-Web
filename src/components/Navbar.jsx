import React, { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import authService from '../firebase/authService'
import UserAvatar from './UserAvatar'
import '../styles/components/Navbar.css'

function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const displayName = user?.displayName || user?.email?.split('@')[0] || ''

  // Solo mostrar el saludo en las páginas del mapa
  const isMapPage =
    location.pathname === '/' ||
    location.pathname === '/nacional' ||
    location.pathname === '/insa'

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">

          <Link to="/" className="navbar-logo">
            <img src="/logo.jpg" alt="EcoMap" className="navbar-logo-img" />
            <span className="navbar-logo-text">
              <span className="navbar-logo-full">EcoMap</span>
              <span className="navbar-logo-short">EcoMap</span>
            </span>
          </Link>

          {/* Saludo — solo visible en móvil cuando hay sesión y se está en el mapa */}
          {!loading && user && isMapPage && (
            <span className="navbar-greeting">
              Hola, {displayName}
            </span>
          )}

          {/* Menu horizontal — solo visible en desktop */}
          <div className="navbar-menu navbar-menu--desktop">
            <NavLink to="/nacional" className={({ isActive }) => isActive ? 'navbar-link navbar-link--active' : 'navbar-link'}>
              EcoMap Nacional
            </NavLink>
            <NavLink to="/insa" className={({ isActive }) => isActive ? 'navbar-link navbar-link--active' : 'navbar-link'}>
              EcoMap INSA
            </NavLink>
            <NavLink to="/estadisticas" className={({ isActive }) => isActive ? 'navbar-link navbar-link--active' : 'navbar-link'}>
              Estadísticas
            </NavLink>

            {!loading && (
              <>
                {user ? (
                  <Link to="/perfil" className="navbar-user-link">
                    <UserAvatar name={displayName} size={32} photoURL={user?.photoURL} />
                    <span className="navbar-user">{displayName}</span>
                  </Link>
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

      {/* Barra de navegación inferior — solo visible en móvil */}
      <nav className="bottom-nav">
        <NavLink to="/nacional" className={({ isActive }) => isActive ? 'bottom-nav-item bottom-nav-item--active' : 'bottom-nav-item'}>
          <span className="bottom-nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z"/><path d="M9 3v16M15 5v16"/></svg></span>
          <span className="bottom-nav-label">Nacional</span>
        </NavLink>

        <NavLink to="/insa" className={({ isActive }) => isActive ? 'bottom-nav-item bottom-nav-item--active' : 'bottom-nav-item'}>
          <span className="bottom-nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6M9 10h6"/></svg></span>
          <span className="bottom-nav-label">INSA</span>
        </NavLink>

        <NavLink to="/estadisticas" className={({ isActive }) => isActive ? 'bottom-nav-item bottom-nav-item--active' : 'bottom-nav-item'}>
          <span className="bottom-nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 3v18h17M8 17v-5M13 17V7M18 17V4"/></svg></span>
          <span className="bottom-nav-label">Estadísticas</span>
        </NavLink>

        {!loading && (
          user ? (
            <NavLink to="/perfil" className={({ isActive }) => isActive ? 'bottom-nav-item bottom-nav-item--active' : 'bottom-nav-item'}>
              <span className="bottom-nav-icon">
                <UserAvatar name={displayName} size={24} photoURL={user?.photoURL} />
              </span>
              <span className="bottom-nav-label">Perfil</span>
            </NavLink>
          ) : (
            <NavLink to="/login" className={({ isActive }) => isActive ? 'bottom-nav-item bottom-nav-item--active' : 'bottom-nav-item'}>
              <span className="bottom-nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg></span>
              <span className="bottom-nav-label">Iniciar sesión</span>
            </NavLink>
          )
        )}
      </nav>
    </>
  )
}

export default Navbar

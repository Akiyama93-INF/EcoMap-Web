import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/pages/NotFound.css'

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>Lo sentimos, la página que buscas no existe.</p>
        <Link to="/" className="back-link">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFound

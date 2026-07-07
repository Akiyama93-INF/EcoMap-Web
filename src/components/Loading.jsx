import React from 'react'
import '../styles/components/Loading.css'

function Loading({ message = 'Cargando...' }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  )
}

export default Loading

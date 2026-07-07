import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../firebase/authService'
import '../styles/pages/Login.css'

// TODO: Implementar validaciones avanzadas
// TODO: Implementar manejo de errores detallado
// TODO: Implementar "Recordarme"

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Email y contraseña son requeridos')
      }

      await authService.login(formData.email, formData.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginWithGoogle = async () => {
    try {
      setError(null)
      setIsLoading(true)
      await authService.loginWithGoogle()
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Iniciar Sesión</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="divider">O</div>

        <button onClick={handleLoginWithGoogle} disabled={isLoading} className="google-btn">
          Iniciar sesión con Google
        </button>

        <p className="auth-link">
          ¿No tienes cuenta? <Link to="/register">Registrarse</Link>
        </p>
      </div>
    </div>
  )
}

export default Login

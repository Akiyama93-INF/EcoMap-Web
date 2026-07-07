import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../firebase/authService'
import '../styles/pages/Register.css'

// TODO: Implementar validaciones de contraseña más estrictas
// TODO: Implementar confirmación de email
// TODO: Implementar captcha

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        throw new Error('Todos los campos son requeridos')
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      await authService.register(formData.email, formData.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterWithGoogle = async () => {
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
        <h1>Crear Cuenta</h1>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirma tu contraseña"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="divider">O</div>

        <button onClick={handleRegisterWithGoogle} disabled={isLoading} className="google-btn">
          Registrarse con Google
        </button>

        <p className="auth-link">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default Register

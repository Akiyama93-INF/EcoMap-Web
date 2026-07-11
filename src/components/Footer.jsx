import React from 'react'
import '../styles/components/Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>EcoMap</h3>
          <p>Plataforma para reportar puntos tanto como basureros clandestinos y puntos ecologicos en El Salvador, realizado por estudiantes
            del Instituto Nacional de Santa Ana (INSA) de la especialidad ITSI 2° "H" como parte de su proyecto tecnológico.
          </p>
        </div>

        <div className="footer-section">
          <h4>Contactanos</h4>
          <ul>
            <li>Equipo EcoMap

Para consultas relacionadas con el proyecto:

<h4>ecomap.proyecto@gmail.com</h4>
          </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} EcoMap. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer

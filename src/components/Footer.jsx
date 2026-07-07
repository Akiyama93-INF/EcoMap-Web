import React from 'react'
import '../styles/components/Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>EcoMap</h3>
          <p>Plataforma para reportar basureros clandestinos en El Salvador, realizado por estudiantes
            del Instituto Nacional de Santa Ana (INSA) de la especialidad ITSI 2° "H" como parte de su proyecto tecnológico.
          </p>
        </div>

        <div className="footer-section">
          <h4>Contactanos</h4>
          <ul>
             <h4>RELLENAR CAMPOS AL FINAL</h4>
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

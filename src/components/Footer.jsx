import React from 'react'
import '../styles/components/Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>EcoMap</h3>
          <p>EcoMap es una plataforma colaborativa para el reporte y visualización de incidencias ambientales en El Salvador. Desarrollada por estudiantes del Instituto Nacional de Santa Ana (INSA) como proyecto tecnológico para fomentar la participación ciudadana y el cuidado del medio ambiente.
          </p>
        </div>

        <div className="footer-section">
          <h4>Contactanos</h4>
          <ul>
            <li>
¿Tienes dudas, sugerencias o encontraste un problema en EcoMap?
Estamos disponibles para ayudarte.

<a href="mailto:ecomap.proyecto@gmail.com" class="contact-email">
    
<br></br>ecomap.proyecto@gmail.com
</a>
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

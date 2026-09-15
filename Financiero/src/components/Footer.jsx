import './Footer.css'

function Footer() {
  const anioActual = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-name">SOFTWARE FINANCIERO</span>
          <p>Institución Universitaria Tecnológico de Antioquia — Medellín</p>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h4>Proyecto</h4>
            <p>SOFTWARE FINANCIERO</p>
            <p>Año: 2026</p>
          </div>
          <div className="footer-col">
            <h4>Universidad</h4>
            <p>Institución Universitaria Tecnológico de Antioquia</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {anioActual} SOFTWARE FINANCIERO. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer

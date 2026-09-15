import './Contacto.css'

function Contacto() {
  return (
    <section className="contacto">
      <div className="section-inner">
        <p className="eyebrow eyebrow-dark">Contacto</p>
        <h2 className="section-title">Hablemos del proyecto</h2>
        <div className="contacto-grid">
          <div className="contacto-col">
            <h4>Proyecto</h4>
            <p>SOFTWARE FINANCIERO</p>
            <p>Año: 2026</p>
          </div>
          <div className="contacto-col">
            <h4>Universidad</h4>
            <p>Institución Universitaria Tecnológico de Antioquia — Medellín</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contacto

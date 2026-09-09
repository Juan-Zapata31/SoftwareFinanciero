import './Problema.css'

const puntos = [
  { numero: 1, texto: 'Información financiera dispersa y difícil de consultar' },
  { numero: 2, texto: 'Poca visibilidad del riesgo legal y financiero' },
  { numero: 3, texto: 'Informes que toman tiempo generar manualmente' },
]

function Problema() {
  return (
    <section className="problema" id="proyecto">
      <div className="section-inner">
        <p className="eyebrow eyebrow-dark">Sobre el proyecto</p>
        <h2 className="section-title">¿Qué problema resolvemos?</h2>
        <div className="problema-grid">
          <div className="problema-texto">
            <p>
              Muchas pequeñas y medianas empresas administran su dinero de forma dispersa:
              en cuadernos, hojas de cálculo sueltas o de memoria. Esto dificulta saber con
              certeza cuánto se tiene, cuánto se debe y cuánto deben, y aumenta el riesgo de
              errores y de incumplimientos legales como el SARLAFT.
            </p>
            <p>
              <strong>Software Financiero</strong> está dirigido a administradores y
              equipos financieros de empresas que necesitan centralizar el control de su
              dinero, evaluar riesgos y generar informes confiables sin depender de procesos
              manuales dispersos.
            </p>
          </div>
          <div className="problema-cards">
            {puntos.map((punto) => (
              <div className="mini-card" key={punto.numero}>
                <span className="mini-card-num">{punto.numero}</span>
                <p>{punto.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Problema

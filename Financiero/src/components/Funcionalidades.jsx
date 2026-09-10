import './Funcionalidades.css'

const funcionalidades = [
  {
    icono: '$',
    titulo: 'Ingreso de dinero',
    descripcion: 'Registra los pagos recibidos por cliente, cuenta bancaria y método de pago.',
  },
  {
    icono: '$',
    titulo: 'Gastos',
    descripcion: 'Administra nómina, alquiler, servicios en la nube y equipos tecnológicos.',
  },
  {
    icono: '%',
    titulo: 'Análisis de riesgos',
    descripcion: 'Evalúa riesgos legales y financieros conforme al sistema SARLAFT.',
  },
  {
    icono: '=',
    titulo: 'Balance general',
    descripcion: 'Genera informes descargables filtrados por fecha y servicio.',
  },
  {
    icono: 'i',
    titulo: 'Estado de cuenta',
    descripcion: 'Consulta saldo corriente, ahorros y CDT de tu cuenta bancaria empresarial.',
  },
  {
    icono: '>',
    titulo: 'Cuentas por cobrar y pagar',
    descripcion: 'Haz seguimiento al estado de lo que te deben y de lo que debes pagar.',
  },
]

function Funcionalidades() {
  return (
    <section className="funcionalidades" id="funcionalidades">
      <div className="section-inner">
        <p className="eyebrow">Funcionalidades</p>
        <h2 className="section-title section-title-light">
          Todo el control de tu dinero, en un solo panel
        </h2>

        <div className="func-grid">
          {funcionalidades.map((func) => (
            <article className="func-card" key={func.titulo}>
              <div className="func-icon">{func.icono}</div>
              <h3>{func.titulo}</h3>
              <p>{func.descripcion}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Funcionalidades

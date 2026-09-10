import './Hero.css'

function Hero() {
  const irABienvenida = () => {
    document.getElementById('bienvenida')?.scrollIntoView({ behavior: 'smooth' })
    document.getElementById('nombreUsuario')?.focus()
  }

  const irAProyecto = () => {
    document.getElementById('proyecto')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="inicio">
      <div className="hero-inner">
        <p className="eyebrow">Gestión financiera empresarial</p>
        <h1>
          SOFTWARE
          <br />
          FINANCIERO
        </h1>
        <p className="hero-desc">
          Una plataforma para administrar el dinero de tu empresa en un solo lugar:
          ingresos, gastos, riesgos, balances y cuentas por cobrar y pagar, con la
          información clara y al día.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={irABienvenida}>
            Iniciar sesión
          </button>
          <button className="btn btn-secondary" onClick={irAProyecto}>
            Conocer más
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero

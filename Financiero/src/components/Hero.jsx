import { useNavigate } from 'react-router-dom'
import './Hero.css'

function Hero({ onUsuarioNuevo }) {
  const navigate = useNavigate()

  const irAProyecto = () => {
    navigate('/proyecto')
  }

  return (
    <section className="hero group relative overflow-hidden" id="inicio">
      <div
        aria-hidden="true"
        className="hero-background pointer-events-none absolute inset-0 scale-105 bg-left transition-[background-position,transform] duration-700 ease-out group-hover:bg-right group-hover:scale-110 group-hover:translate-x-2 motion-reduce:transition-none"
      />
      <div className="hero-inner relative z-10 mx-auto max-w-[820px]">
        <p className="eyebrow">Gestión financiera empresarial</p>
        <h1 className="!mb-7 !text-white text-[2.6rem] leading-[0.98] [font-family:var(--font-display)] [font-weight:400] uppercase tracking-[0.01em] sm:text-6xl md:text-7xl">
          SOFTWARE
          <br />
          <span className="text-[var(--cyan-300)]">FINANCIERO</span>
        </h1>
        <p className="mx-auto !mb-8 !mt-0 max-w-[560px] text-base leading-7 text-white/90 sm:text-[1.05rem]">
          Una plataforma para administrar el dinero de tu empresa en un solo lugar:
          ingresos, gastos, riesgos, balances y cuentas por cobrar y pagar, con la
          información clara y al día.
        </p>
        <div className="flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:flex-wrap">
          <button
            className="w-full min-w-[190px] max-w-[300px] cursor-pointer rounded-md border-0 bg-[var(--cyan-500)] px-6 py-4 text-[0.95rem] uppercase tracking-[0.03em] text-[var(--teal-950)] [font-family:var(--font-display)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--cyan-300)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cyan-300)] active:translate-y-0 motion-reduce:transition-none sm:w-auto"
            onClick={onUsuarioNuevo}
          >
            Usuario nuevo
          </button>
          <button
            className="w-full min-w-[190px] max-w-[300px] cursor-pointer rounded-md border border-white/55 bg-transparent px-6 py-4 text-[0.95rem] uppercase tracking-[0.03em] text-white [font-family:var(--font-display)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--cyan-300)] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cyan-300)] active:translate-y-0 motion-reduce:transition-none sm:w-auto"
            onClick={irAProyecto}
          >
            Conocer más
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero

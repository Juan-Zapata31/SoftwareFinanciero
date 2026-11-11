import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import './Problema.css'

const cargosInventados = [
  'Gerente Financiero',
  'Analista de Riesgos',
  'Contador Senior',
  'Coordinador de Tesorería',
  'Auditor Interno',
  'Especialista en Inversiones',
  'Analista de Cartera',
  'Jefe de Contabilidad',
  'Asesor Financiero',
  'Controller Financiero',
]

function Problema() {
  const [empleados, setEmpleados] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const temporizadorRef = useRef(null)

  useEffect(() => () => clearTimeout(temporizadorRef.current), [])

  const obtenerEmpleados = async () => {
    clearTimeout(temporizadorRef.current)
    setCargando(true)
    setError('')

    try {
      const { data } = await axios.get('https://jsonplaceholder.typicode.com/users')
      setEmpleados(data)
    } catch (errorSolicitud) {
      setError(errorSolicitud.response?.data?.message || 'Ocurrió un error al obtener los nombres de empleados.')
      setEmpleados([])
    } finally {
      setCargando(false)
      temporizadorRef.current = setTimeout(() => {
        setEmpleados([])
        setError('')
      }, 5000)
    }
  }

  return (
    <section className="problema bg-[var(--bg-light)]" id="proyecto">
      <div className="section-inner">
        <p className="eyebrow eyebrow-dark">Sobre nosotros</p>
        <h2 className="section-title">Conoce a nuestro equipo</h2>

        <div className="mt-4">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-md border-0 bg-[var(--teal-700)] px-7 py-3.5 text-[0.95rem] uppercase tracking-[0.03em] text-white [font-family:var(--font-display)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--teal-950)] hover:shadow-[0_8px_18px_rgba(18,61,67,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan-500)] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            onClick={obtenerEmpleados}
            disabled={cargando}
          >
            {cargando ? 'Cargando...' : 'Obtener nombres de empleados'}
          </button>

          {error && <p className="empleados-error">{error}</p>}

          {empleados.length > 0 && (
            <ul className="mt-6 grid list-none grid-cols-1 gap-4 p-0 min-[501px]:grid-cols-2 min-[861px]:grid-cols-3">
              {empleados.map((empleado, indice) => (
                <li className="flex flex-col gap-1 rounded-md border-l-4 border-[var(--cyan-500)] bg-white px-[1.1rem] py-[0.9rem] shadow-[0_4px_14px_rgba(18,61,67,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(18,61,67,0.12)] motion-reduce:transition-none" key={empleado.id}>
                  <span className="text-[0.95rem] font-semibold text-[var(--ink)]">{empleado.name}</span>
                  <span className="text-[0.85rem] text-[var(--teal-700)]">
                    {cargosInventados[indice % cargosInventados.length]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default Problema
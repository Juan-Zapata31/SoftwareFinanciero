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
    <section className="problema" id="proyecto">
      <div className="section-inner">
        <p className="eyebrow eyebrow-dark">Sobre nosotros</p>
        <h2 className="section-title">Conoce a nuestro equipo</h2>

        <div className="empleados-bloque">
          <button
            type="button"
            className="btn btn-primary"
            onClick={obtenerEmpleados}
            disabled={cargando}
          >
            {cargando ? 'Cargando...' : 'Obtener nombres de empleados'}
          </button>

          {error && <p className="empleados-error">{error}</p>}

          {empleados.length > 0 && (
            <ul className="empleados-lista">
              {empleados.map((empleado, indice) => (
                <li key={empleado.id}>
                  <span className="empleado-nombre">{empleado.name}</span>
                  <span className="empleado-cargo">
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
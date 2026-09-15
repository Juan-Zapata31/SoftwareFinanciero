import { useState } from 'react'
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

  const obtenerEmpleados = async () => {
    setCargando(true)
    setError('')

    try {
      const respuesta = await fetch('https://jsonplaceholder.typicode.com/users')
      if (!respuesta.ok) {
        throw new Error('No se pudo obtener la lista de empleados.')
      }
      const datos = await respuesta.json()
      setEmpleados(datos)
    } catch {
      setError('Ocurrió un error al obtener los nombres de empleados.')
      setEmpleados([])
    } finally {
      setCargando(false)
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
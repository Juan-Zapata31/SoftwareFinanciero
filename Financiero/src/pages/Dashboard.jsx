import { useEffect, useMemo, useState } from 'react'
import apiClient from '../services/api.js'
import { INCOME_DATA_CHANGED } from '../services/incomeEvents.js'
import './Dashboard.css'

const API_URL = import.meta.env.VITE_API_URL
const CUENTA_NO_APLICA = 'No aplica'
const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})
const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
})
const coloresMetodo = {
  transferencia: '#168b96',
  efectivo: '#42bdc8',
  tarjeta: '#376b9c',
  otro: '#343c75',
}
const metodosPago = {
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
}
const colorMetodo = (metodo) => coloresMetodo[metodo] || coloresMetodo.otro

function fechaBogotaIso(fecha) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(fecha)
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]))
  const { year: anio, month: mes, day: dia } = valores
  return `${anio}-${mes}-${dia}`
}

function fechaUtc(iso) {
  return new Date(`${iso}T00:00:00Z`)
}

function fechaIsoUtc(fecha) {
  return fecha.toISOString().slice(0, 10)
}

function obtenerRango(periodo, hoy) {
  const fin = fechaUtc(hoy)
  let inicio = fechaUtc(hoy)

  if (periodo === 'semana') {
    inicio.setUTCDate(inicio.getUTCDate() - ((inicio.getUTCDay() + 6) % 7))
  } else if (periodo === 'mes') {
    inicio.setUTCDate(1)
  }

  return { desde: fechaIsoUtc(inicio), hasta: fechaIsoUtc(fin) }
}

function resumirIngresos(ingresos, desde, hasta) {
  const diariosPorMetodo = new Map()
  const metodos = new Map()
  let total = 0
  let cantidad = 0

  ingresos.forEach((ingreso) => {
    const fecha = String(ingreso.fechaPago).slice(0, 10)
    if (fecha < desde || fecha > hasta) return

    const valor = Number(ingreso.valor)
    if (!Number.isFinite(valor)) return

    total += valor
    cantidad += 1
    const metodo = ingreso.metodoPago || 'otro'
    metodos.set(metodo, (metodos.get(metodo) || 0) + valor)
    if (!diariosPorMetodo.has(metodo)) diariosPorMetodo.set(metodo, new Map())
    const diarios = diariosPorMetodo.get(metodo)
    diarios.set(fecha, (diarios.get(fecha) || 0) + valor)
  })

  return { total, cantidad, diariosPorMetodo, metodos }
}

function obtenerTendencia(diariosPorMetodo, desde, hasta) {
  const inicio = fechaUtc(desde)
  const fin = fechaUtc(hasta)
  const dias = Math.floor((fin - inicio) / 86400000) + 1
  const periodo = dias <= 14 ? 'dia' : dias <= 90 ? 'semana' : 'mes'
  const acumuladosPorMetodo = new Map()

  diariosPorMetodo.forEach((diarios, metodo) => {
    const acumulados = new Map()

    diarios.forEach((valor, fecha) => {
      const dia = fechaUtc(fecha)
      let clave = fecha

      if (periodo === 'semana') {
        dia.setUTCDate(dia.getUTCDate() - ((dia.getUTCDay() + 6) % 7))
        clave = fechaIsoUtc(dia)
      } else if (periodo === 'mes') {
        clave = fecha.slice(0, 7)
      }

      acumulados.set(clave, (acumulados.get(clave) || 0) + valor)
    })

    acumuladosPorMetodo.set(metodo, acumulados)
  })

  const claves = []
  const cursor = new Date(inicio)

  if (periodo === 'semana') {
    cursor.setUTCDate(cursor.getUTCDate() - ((cursor.getUTCDay() + 6) % 7))
  } else if (periodo === 'mes') {
    cursor.setUTCDate(1)
  }

  while (cursor <= fin) {
    claves.push(periodo === 'mes' ? cursor.toISOString().slice(0, 7) : cursor.toISOString().slice(0, 10))
    if (periodo === 'dia') cursor.setUTCDate(cursor.getUTCDate() + 1)
    else if (periodo === 'semana') cursor.setUTCDate(cursor.getUTCDate() + 7)
    else cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  return claves.map((fecha) => ({
      fecha,
      valores: Object.fromEntries(
        [...acumuladosPorMetodo.entries()].map(([metodo, acumulados]) => [
          metodo,
          acumulados.get(fecha) || 0,
        ]),
      ),
      etiqueta:
        periodo === 'mes'
          ? new Intl.DateTimeFormat('es-CO', { month: 'short', year: '2-digit', timeZone: 'UTC' })
              .format(fechaUtc(`${fecha}-01`))
          : formatoFecha.format(fechaUtc(fecha)),
    }))
}

function graficoLinea(puntos, metodos) {
  if (puntos.length === 0) return null

  const ancho = 640
  const alto = 240
  const margen = { arriba: 18, derecha: 14, abajo: 42, izquierda: 70 }
  const valores = puntos.flatMap((punto) => Object.values(punto.valores))
  const maximo = Math.max(...valores, 1)
  const minimo = Math.min(...valores, 0)
  const rango = maximo - minimo || 1
  const coordenadas = metodos.map((metodo) => ({
    metodo,
    puntos: puntos.map((punto, indice) => ({
      ...punto,
      x:
        margen.izquierda +
        (indice * (ancho - margen.izquierda - margen.derecha)) / Math.max(puntos.length - 1, 1),
      y:
        margen.arriba +
        ((maximo - punto.valores[metodo]) * (alto - margen.arriba - margen.abajo)) / rango,
    })),
  }))
  const divisiones = [0, 1, 2, 3].map((indice) => ({
    valor: maximo - (indice * (maximo - minimo)) / 3,
    y: margen.arriba + (indice * (alto - margen.arriba - margen.abajo)) / 3,
  }))
  const etiquetas = puntos.length <= 6
    ? puntos.map((punto, indice) => ({ punto, indice }))
    : [0, Math.floor((puntos.length - 1) / 2), puntos.length - 1].map((indice) => ({
        punto: puntos[indice],
        indice,
      }))

  return (
    <>
      <svg
        className="dashboard-line-chart"
        viewBox={`0 0 ${ancho} ${alto}`}
        role="img"
        aria-label="Evolución de ingresos por método de pago"
      >
        {divisiones.map((division) => (
          <g key={division.y}>
            <line
              x1={margen.izquierda}
              x2={ancho - margen.derecha}
              y1={division.y}
              y2={division.y}
              className="chart-grid"
            />
            <text x={margen.izquierda - 10} y={division.y + 4} textAnchor="end" className="chart-axis">
              {new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(
                division.valor,
              )}
            </text>
          </g>
        ))}
        {coordenadas.map(({ metodo, puntos: serie }) => (
          <g key={metodo}>
            <polyline
              points={serie.map(({ x, y }) => `${x},${y}`).join(' ')}
              className="chart-line"
              style={{ stroke: colorMetodo(metodo) }}
            />
            {serie.map((punto) => (
              <circle
                key={`${metodo}-${punto.fecha}`}
                cx={punto.x}
                cy={punto.y}
                r="4"
                className="chart-point"
                style={{ fill: colorMetodo(metodo) }}
              >
                <title>{`${metodosPago[metodo] || metodo} · ${punto.etiqueta}: ${formatoMoneda.format(
                  punto.valores[metodo],
                )}`}</title>
              </circle>
            ))}
          </g>
        ))}
        {etiquetas.map(({ punto, indice }) => (
          <text
            key={punto.fecha}
            x={coordenadas[0].puntos[indice].x}
            y={alto - 12}
            textAnchor="middle"
            className="chart-axis"
          >
            {punto.etiqueta}
          </text>
        ))}
      </svg>
      <ul className="trend-legend" aria-label="Leyenda de métodos de pago">
        {metodos.map((metodo) => (
          <li key={metodo}>
            <span className="legend-dot" style={{ backgroundColor: colorMetodo(metodo) }} />
            <span>{metodosPago[metodo] || metodo}</span>
          </li>
        ))}
      </ul>
    </>
  )
}

function Dashboard() {
  const hoy = fechaBogotaIso(new Date())
  const rangoInicial = obtenerRango('hoy', hoy)
  const [periodo, setPeriodo] = useState('hoy')
  const [desde, setDesde] = useState(rangoInicial.desde)
  const [hasta, setHasta] = useState(rangoInicial.hasta)
  const [ingresos, setIngresos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorDescarga, setErrorDescarga] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarIngresos() {
      try {
        if (!API_URL) {
          throw new Error('Falta configurar VITE_API_URL en el archivo .env del frontend.')
        }
        const respuesta = await apiClient.get(`${API_URL.replace(/\/+$/, '')}/ingresos`)
        if (activo) {
          setIngresos(respuesta.data)
          setError('')
        }
      } catch (errorSolicitud) {
        if (activo) {
          setError(
            errorSolicitud.response?.data?.message ||
              errorSolicitud.message ||
              'No fue posible consultar los ingresos.',
          )
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    function actualizarAlVolver() {
      if (document.visibilityState === 'visible') cargarIngresos()
    }

    cargarIngresos()
    window.addEventListener(INCOME_DATA_CHANGED, cargarIngresos)
    window.addEventListener('focus', actualizarAlVolver)
    document.addEventListener('visibilitychange', actualizarAlVolver)
    return () => {
      activo = false
      window.removeEventListener(INCOME_DATA_CHANGED, cargarIngresos)
      window.removeEventListener('focus', actualizarAlVolver)
      document.removeEventListener('visibilitychange', actualizarAlVolver)
    }
  }, [])

  const rangoValido = desde && hasta && desde <= hasta
  const resumen = useMemo(
    () => (rangoValido ? resumirIngresos(ingresos, desde, hasta) : null),
    [ingresos, desde, hasta, rangoValido],
  )
  const tendencia = useMemo(
    () => (resumen ? obtenerTendencia(resumen.diariosPorMetodo, desde, hasta) : []),
    [resumen, desde, hasta],
  )
  const metodosOrdenados = useMemo(
    () =>
      resumen
        ? [...resumen.metodos.entries()].sort(([, valorA], [, valorB]) => valorB - valorA)
        : [],
    [resumen],
  )
  const totalMetodos = resumen
    ? metodosOrdenados.reduce((suma, [, valor]) => suma + valor, 0)
    : 0
  const etiquetaPeriodo =
    periodo === 'hoy'
      ? 'Hoy'
      : periodo === 'semana'
        ? 'Esta semana'
        : periodo === 'mes'
          ? 'Este mes'
          : 'Periodo personalizado'

  function cambiarPeriodo(nuevoPeriodo) {
    setPeriodo(nuevoPeriodo)
    if (nuevoPeriodo !== 'personalizado') {
      const rango = obtenerRango(nuevoPeriodo, fechaBogotaIso(new Date()))
      setDesde(rango.desde)
      setHasta(rango.hasta)
    }
  }

  function descargarReporte() {
    if (!resumen) return
    setErrorDescarga('')

    try {
      const columnas = [
        'ID ingreso',
        'ID usuario',
        'Cliente',
        'Correo del cliente',
        'Cuenta bancaria',
        'Método de pago',
        'Fecha de pago',
        'Valor (COP)',
        'Observación',
        'Fecha de registro',
      ]
      const filas = ingresos
        .filter((ingreso) => {
          const fecha = String(ingreso.fechaPago).slice(0, 10)
          return fecha >= desde && fecha <= hasta
        })
        .map((ingreso) => [
          ingreso.id,
          ingreso.usuarioId,
          ingreso.cliente,
          ingreso.clienteEmail,
          ingreso.cuentaBancaria == null ? CUENTA_NO_APLICA : String(ingreso.cuentaBancaria),
          metodosPago[ingreso.metodoPago] || ingreso.metodoPago,
          String(ingreso.fechaPago).slice(0, 10),
          ingreso.valor,
          ingreso.observacion || '',
          ingreso.creadoEn ? new Date(ingreso.creadoEn).toLocaleString('es-CO') : '',
        ])
      const escaparCampo = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`
      const contenido = `\uFEFF${[columnas, ...filas]
        .map((fila) => fila.map(escaparCampo).join(','))
        .join('\r\n')}`
      const archivo = new Blob([contenido], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(archivo)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = `ReporteIngresos_${fechaBogotaIso(new Date())}.csv`
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('No fue posible generar el reporte de ingresos en CSV:', error)
      setErrorDescarga('No fue posible descargar el reporte CSV. Intenta nuevamente.')
    }
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow eyebrow-dark">Vista general</p>
          <h1>Panel de ingresos</h1>
          <p className="dashboard-intro">Consulta la totalidad de ingresos del periodo que elijas.</p>
        </div>
        <div className="dashboard-download-action">
          <button
            type="button"
            className="dashboard-download"
            onClick={descargarReporte}
            disabled={!rangoValido || cargando || Boolean(error)}
          >
            <span>Descargar</span>
            <span className="download-icon" aria-hidden="true">↓</span>
          </button>
          {errorDescarga && <p className="download-feedback download-feedback-error" role="alert">{errorDescarga}</p>}
        </div>
      </div>

      <section className="dashboard-filters" aria-label="Filtros del panel">
        <div className="filter-periods" role="group" aria-label="Periodo de consulta">
          {[
            ['hoy', 'Hoy'],
            ['personalizado', 'Personalizado'],
          ].map(([valor, texto]) => (
            <button
              type="button"
              key={valor}
              className={`filter-period${periodo === valor ? ' selected' : ''}`}
              aria-pressed={periodo === valor}
              onClick={() => cambiarPeriodo(valor)}
            >
              {texto}
            </button>
          ))}
        </div>
        {periodo === 'personalizado' && (
          <div className="filter-dates">
            <label>
              Desde
              <input
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(evento) => setDesde(evento.target.value)}
              />
            </label>
            <label>
              Hasta
              <input
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(evento) => setHasta(evento.target.value)}
              />
            </label>
          </div>
        )}
      </section>

      <section className="dashboard-total" aria-live="polite">
        <div>
          <p className="dashboard-total-label">Total de ingresos · {etiquetaPeriodo}</p>
          {cargando ? (
            <p className="dashboard-total-value">Cargando...</p>
          ) : error ? (
            <p className="dashboard-error" role="alert">{error}</p>
          ) : !rangoValido ? (
            <p className="dashboard-error" role="alert">La fecha inicial debe ser anterior a la fecha final.</p>
          ) : (
            <>
              <p className="dashboard-total-value">{formatoMoneda.format(resumen.total)}</p>
              <p className="dashboard-total-caption">
                {resumen.cantidad} {resumen.cantidad === 1 ? 'ingreso registrado' : 'ingresos registrados'}
                {' · '}{formatoFecha.format(fechaUtc(desde))} – {formatoFecha.format(fechaUtc(hasta))}
              </p>
            </>
          )}
        </div>
        <div className="total-decoration" aria-hidden="true">
          <span>Σ</span>
        </div>
      </section>

      <div className="dashboard-charts">
        <section className="dashboard-chart-card">
          <div className="chart-card-heading">
            <div>
              <h2>Distribución por método</h2>
              <p>Composición de los ingresos del periodo</p>
            </div>
          </div>
          {cargando || error || !rangoValido ? null : totalMetodos === 0 ? (
            <p className="chart-empty">No hay ingresos registrados en este periodo.</p>
          ) : (
            <div className="payment-chart">
              <div
                className="payment-donut"
                role="img"
                aria-label={`Distribución de ${formatoMoneda.format(totalMetodos)} por método de pago`}
                style={{
                  background: `conic-gradient(${metodosOrdenados
                    .map(([metodo, valor], indice) => {
                      const anterior = metodosOrdenados
                        .slice(0, indice)
                        .reduce((suma, [, monto]) => suma + monto, 0)
                      const inicio = (anterior / totalMetodos) * 100
                      const fin = ((anterior + valor) / totalMetodos) * 100
                      return `${colorMetodo(metodo)} ${inicio}% ${fin}%`
                    })
                    .join(', ')})`,
                }}
              >
                <div className="payment-donut-center">
                  <span>{metodosOrdenados.length}</span>
                  <small>métodos</small>
                </div>
              </div>
              <ul className="payment-legend">
                {metodosOrdenados.map(([metodo, valor]) => (
                  <li key={metodo}>
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: colorMetodo(metodo) }}
                    />
                    <span className="legend-name">{metodosPago[metodo] || metodo}</span>
                    <strong>{formatoMoneda.format(valor)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="dashboard-chart-card">
          <div className="chart-card-heading">
            <div>
              <h2>Evolución de ingresos</h2>
              <p>Ingresos registrados a lo largo del periodo</p>
            </div>
          </div>
          {cargando || error || !rangoValido ? null : tendencia.length === 0 || metodosOrdenados.length === 0 ? (
            <p className="chart-empty">No hay ingresos registrados en este periodo.</p>
          ) : (
            graficoLinea(tendencia, metodosOrdenados.map(([metodo]) => metodo))
          )}
        </section>
      </div>
      <p className="dashboard-footnote">
        El total se calcula con los ingresos registrados según su fecha de pago.
      </p>
    </section>
  )
}

export default Dashboard

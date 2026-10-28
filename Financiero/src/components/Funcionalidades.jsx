import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import apiClient from '../services/api.js'
import './Funcionalidades.css'

const funcionalidades = [
  {
    icono: '$',
    titulo: 'Ingreso de dinero',
    descripcion: 'Registra los pagos recibidos por cliente, cuenta bancaria y método de pago.',
  },
]

const accionesUsuarios = [
  {
    icono: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="2.2" />
        <path d="m16 16 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
    titulo: 'Consultar usuarios',
    descripcion: 'Revisa los usuarios registrados en el sistema.',
    accion: 'consultar',
  },
  {
    icono: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
        <path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    titulo: 'Eliminar usuarios',
    descripcion: 'Selecciona y elimina un usuario registrado.',
    accion: 'eliminar',
  },
  {
    icono: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
        <path d="m15 5 4 4M4 20l4.2-.9L19.2 8a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    titulo: 'Modificar usuarios',
    descripcion: 'Edita los datos de un usuario existente.',
    accion: 'modificar',
  },
]

const API_URL = import.meta.env.VITE_API_URL
const DEMORA_CIERRE_TARJETA = 10000
const CUENTA_NO_APLICA = 'No aplica'
const ingresoVacio = {
  usuarioId: '',
  cuentaBancaria: '',
  metodoPago: '',
  fechaPago: '',
  valor: '',
  observacion: '',
}
const formatoMoneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
})
const formatoFecha = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
const fechaComoDiaCalendario = (valor) => {
  const fecha = new Date(`${String(valor).slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(fecha.getTime()) ? 'Fecha inválida' : formatoFecha.format(fecha)
}

function Funcionalidades() {
  const dialogoConfirmacionRef = useRef(null)
  const dialogoIngresoRef = useRef(null)
  const panelIngresoRef = useRef(null)
  const panelAccionRef = useRef(null)
  const temporizadorCierreRef = useRef(null)
  const temporizadorCierreIngresoRef = useRef(null)
  const [accionActiva, setAccionActiva] = useState('')
  const [ingresoAbierto, setIngresoAbierto] = useState(false)
  const [abriendoIngreso, setAbriendoIngreso] = useState(false)
  const [cerrandoIngreso, setCerrandoIngreso] = useState(false)
  const [alturaIngreso, setAlturaIngreso] = useState(0)
  const [listaIngresosAbierta, setListaIngresosAbierta] = useState(false)
  const [mensajeIngreso, setMensajeIngreso] = useState('')
  const [errorIngreso, setErrorIngreso] = useState('')
  const [errorListaIngresos, setErrorListaIngresos] = useState('')
  const [ingresos, setIngresos] = useState([])
  const [datosIngreso, setDatosIngreso] = useState(ingresoVacio)
  const [ingresoEditando, setIngresoEditando] = useState(null)
  const [ingresoAEliminar, setIngresoAEliminar] = useState(null)
  const [cargandoIngresos, setCargandoIngresos] = useState(false)
  const [guardandoIngreso, setGuardandoIngreso] = useState(false)
  const [eliminandoIngreso, setEliminandoIngreso] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [cargandoClientes, setCargandoClientes] = useState(false)
  const [errorClientes, setErrorClientes] = useState('')
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('')
  const [datosUsuario, setDatosUsuario] = useState({ name: '', lastName: '', email: '' })
  const [cargando, setCargando] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [abriendoPanel, setAbriendoPanel] = useState(false)
  const [cerrandoPanel, setCerrandoPanel] = useState(false)
  const [alturaPanel, setAlturaPanel] = useState(0)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(
    () => () => {
      clearTimeout(temporizadorCierreRef.current)
      clearTimeout(temporizadorCierreIngresoRef.current)
    },
    [],
  )

  useLayoutEffect(() => {
    const panel = panelIngresoRef.current
    if (!ingresoAbierto || !panel) return

    setAlturaIngreso(panel.getBoundingClientRect().height)
    setAbriendoIngreso(true)
  }, [ingresoAbierto])

  useLayoutEffect(() => {
    const panel = panelAccionRef.current
    if (!accionActiva || !panel) return

    setAlturaPanel(panel.getBoundingClientRect().height)
    setAbriendoPanel(true)
  }, [accionActiva])

  useEffect(() => {
    const dialogo = dialogoConfirmacionRef.current
    if (!dialogo) return

    if (mostrarConfirmacion && !dialogo.open) {
      dialogo.showModal()
    } else if (!mostrarConfirmacion && dialogo.open) {
      dialogo.close()
    }
  }, [mostrarConfirmacion])

  useEffect(() => {
    const dialogo = dialogoIngresoRef.current
    if (!dialogo) return

    if (ingresoAEliminar && !dialogo.open) {
      dialogo.showModal()
    } else if (!ingresoAEliminar && dialogo.open) {
      dialogo.close()
    }
  }, [ingresoAEliminar])

  const obtenerIngresos = async () => {
    if (!API_URL) {
      throw new Error('Falta configurar VITE_API_URL en el archivo .env del frontend.')
    }

    const respuesta = await apiClient.get(`${API_URL.replace(/\/+$/, '')}/ingresos`)
    setIngresos(respuesta.data)
    return respuesta.data
  }

  const cerrarIngresoAutomaticamente = () => {
    clearTimeout(temporizadorCierreIngresoRef.current)
    temporizadorCierreIngresoRef.current = setTimeout(() => {
      const panel = panelIngresoRef.current
      if (!panel) return

      setListaIngresosAbierta(false)
      setAbriendoIngreso(false)
      setAlturaIngreso(panel.getBoundingClientRect().height)
      setCerrandoIngreso(true)
    }, DEMORA_CIERRE_TARJETA)
  }

  const desplegarFormularioIngreso = async () => {
    clearTimeout(temporizadorCierreIngresoRef.current)
    if (ingresoAbierto) {
      setListaIngresosAbierta(false)
      if (cerrandoIngreso) {
        setCerrandoIngreso(false)
        setAlturaIngreso(panelIngresoRef.current?.getBoundingClientRect().height || 0)
        setAbriendoIngreso(true)
      } else {
        setAbriendoIngreso(false)
        setAlturaIngreso(panelIngresoRef.current?.getBoundingClientRect().height || 0)
        setCerrandoIngreso(true)
      }
      return
    }

    setErrorClientes('')
    setCargandoClientes(true)
    setCerrandoIngreso(false)
    setMensajeIngreso('')
    try {
      await obtenerUsuarios()
    } catch (errorSolicitud) {
      setErrorClientes(
        errorSolicitud.response?.data?.message ||
          errorSolicitud.message ||
          'No fue posible consultar los usuarios.',
      )
    } finally {
      setCargandoClientes(false)
      setIngresoAbierto(true)
    }
  }

  const manejarFinCierreIngreso = (evento) => {
    if (evento.target !== evento.currentTarget) return

    if (evento.animationName === 'income-panel-open') {
      setAbriendoIngreso(false)
    } else if (evento.animationName === 'income-panel-close' && cerrandoIngreso) {
      setIngresoAbierto(false)
      setAbriendoIngreso(false)
      setCerrandoIngreso(false)
      setAlturaIngreso(0)
    }
  }

  const desplegarListaIngresos = async () => {
    if (listaIngresosAbierta) {
      setListaIngresosAbierta(false)
      return
    }

    setListaIngresosAbierta(true)
    setErrorListaIngresos('')
    setCargandoIngresos(true)
    try {
      await obtenerIngresos()
    } catch (errorSolicitud) {
      setErrorListaIngresos(
        errorSolicitud.response?.data?.message ||
          errorSolicitud.message ||
          'No fue posible consultar los ingresos.',
      )
    } finally {
      setCargandoIngresos(false)
    }
  }

  const guardarIngreso = async (evento) => {
    evento.preventDefault()
    setErrorIngreso('')
    setErrorListaIngresos('')
    setGuardandoIngreso(true)

    try {
      if (!API_URL) {
        throw new Error('Falta configurar VITE_API_URL en el archivo .env del frontend.')
      }

      const url = `${API_URL.replace(/\/+$/, '')}/ingresos`
      if (ingresoEditando) {
        await apiClient.put(`${url}/${encodeURIComponent(ingresoEditando)}`, datosIngreso)
        setMensajeIngreso('Ingreso actualizado correctamente.')
      } else {
        await apiClient.post(url, datosIngreso)
        setMensajeIngreso('Ingreso guardado correctamente.')
      }

      setDatosIngreso(ingresoVacio)
      setIngresoEditando(null)
      if (listaIngresosAbierta) {
        try {
          await obtenerIngresos()
        } catch (errorSolicitud) {
          setErrorListaIngresos(
            errorSolicitud.response?.data?.message ||
              errorSolicitud.message ||
              'El ingreso se guardó, pero no fue posible actualizar la consulta.',
          )
        }
      }
      cerrarIngresoAutomaticamente()
    } catch (errorSolicitud) {
      setErrorIngreso(
        errorSolicitud.response?.data?.message ||
          errorSolicitud.message ||
          'No fue posible guardar el ingreso.',
      )
    } finally {
      setGuardandoIngreso(false)
    }
  }

  const editarIngreso = (ingreso) => {
    setIngresoEditando(String(ingreso.id))
    setDatosIngreso({
      usuarioId: String(ingreso.usuarioId),
      cuentaBancaria:
        ingreso.metodoPago === 'transferencia' ? ingreso.cuentaBancaria : CUENTA_NO_APLICA,
      metodoPago: ingreso.metodoPago,
      fechaPago: String(ingreso.fechaPago).slice(0, 10),
      valor: String(ingreso.valor),
      observacion: ingreso.observacion ?? '',
    })
    setErrorIngreso('')
    setMensajeIngreso('')
    document.getElementById('income-client')?.focus()
  }

  const confirmarEliminarIngreso = async () => {
    if (!ingresoAEliminar) return
    if (!API_URL) {
      setErrorIngreso('Falta configurar VITE_API_URL en el archivo .env del frontend.')
      setIngresoAEliminar(null)
      return
    }

    setEliminandoIngreso(true)
    setErrorIngreso('')
    setMensajeIngreso('')
    try {
      await apiClient.delete(
        `${API_URL.replace(/\/+$/, '')}/ingresos/${encodeURIComponent(ingresoAEliminar.id)}`,
      )
      setIngresos((ingresosActuales) =>
        ingresosActuales.filter((ingreso) => ingreso.id !== ingresoAEliminar.id),
      )
      if (String(ingresoEditando) === String(ingresoAEliminar.id)) {
        setIngresoEditando(null)
        setDatosIngreso(ingresoVacio)
      }
      setMensajeIngreso('Ingreso eliminado correctamente.')
      setIngresoAEliminar(null)
      cerrarIngresoAutomaticamente()
    } catch (errorSolicitud) {
      setIngresoAEliminar(null)
      setErrorIngreso(
        errorSolicitud.response?.data?.message ||
          'No fue posible eliminar el ingreso.',
      )
    } finally {
      setEliminandoIngreso(false)
    }
  }

  const obtenerUsuarios = async () => {
    if (!API_URL) {
      throw new Error('Falta configurar VITE_API_URL en el archivo .env del frontend.')
    }

    const respuesta = await apiClient.get(`${API_URL.replace(/\/+$/, '')}/users`)
    setUsuarios(respuesta.data)
    return respuesta.data
  }

  const abrirAccion = async (accion) => {
    clearTimeout(temporizadorCierreRef.current)
    setAccionActiva(accion)
    setAbriendoPanel(false)
    setCerrandoPanel(false)
    setUsuarioSeleccionado('')
    setDatosUsuario({ name: '', lastName: '', email: '' })
    setError('')
    setMensaje('')
    setCargando(true)

    try {
      await obtenerUsuarios()
      if (accion === 'consultar') {
        cerrarPanelDespuesDe(DEMORA_CIERRE_TARJETA)
      } else if (accion === 'eliminar' || accion === 'modificar') {
        cerrarPanelDespuesDe(DEMORA_CIERRE_TARJETA)
      }
    } catch (errorSolicitud) {
      setError(
        errorSolicitud.response?.data?.message ||
          errorSolicitud.message ||
          'No fue posible conectar con el servidor.',
      )
    } finally {
      setCargando(false)
    }
  }

  const cerrarPanelDespuesDe = (demora = DEMORA_CIERRE_TARJETA) => {
    clearTimeout(temporizadorCierreRef.current)
    temporizadorCierreRef.current = setTimeout(() => {
      setAbriendoPanel(false)
      setAlturaPanel(panelAccionRef.current?.getBoundingClientRect().height || 0)
      setCerrandoPanel(true)
    }, demora)
  }

  const manejarFinCierrePanel = (evento) => {
    if (evento.target !== evento.currentTarget) return

    if (evento.animationName === 'user-action-panel-open') {
      setAbriendoPanel(false)
    } else if (evento.animationName === 'user-action-panel-close' && cerrandoPanel) {
      setAccionActiva('')
      setAbriendoPanel(false)
      setCerrandoPanel(false)
    }
  }

  const seleccionarUsuario = (id) => {
    clearTimeout(temporizadorCierreRef.current)
    setUsuarioSeleccionado(id)
    const usuario = usuarios.find((elemento) => String(elemento.id) === id)
    setDatosUsuario(
      usuario
        ? { name: usuario.name, lastName: usuario.lastName, email: usuario.email }
        : { name: '', lastName: '', email: '' },
    )
    setError('')
    setMensaje('')

    if (!id && (accionActiva === 'eliminar' || accionActiva === 'modificar')) {
      cerrarPanelDespuesDe(DEMORA_CIERRE_TARJETA)
    }
  }

  const manejarEliminacion = async (evento) => {
    evento.preventDefault()
    if (!usuarioSeleccionado) {
      setError('Selecciona un usuario para eliminar.')
      return
    }

    setError('')
    setMostrarConfirmacion(true)
  }

  const confirmarEliminacion = async () => {
    setCargando(true)
    setError('')
    setMensaje('')
    try {
      await apiClient.delete(
        `${API_URL.replace(/\/+$/, '')}/users/${encodeURIComponent(usuarioSeleccionado)}`,
      )
      setUsuarios((usuariosActuales) =>
        usuariosActuales.filter((elemento) => String(elemento.id) !== usuarioSeleccionado),
      )
      setMensaje('Usuario eliminado correctamente.')
      setUsuarioSeleccionado('')
      setMostrarConfirmacion(false)
      cerrarPanelDespuesDe()
    } catch (errorSolicitud) {
      setMostrarConfirmacion(false)
      setError(
        errorSolicitud.response?.data?.message || 'No fue posible eliminar el usuario.',
      )
    } finally {
      setCargando(false)
    }
  }

  const manejarModificacion = async (evento) => {
    evento.preventDefault()
    if (!usuarioSeleccionado) {
      setError('Selecciona un usuario para modificar.')
      return
    }

    setCargando(true)
    setError('')
    setMensaje('')
    try {
      const respuesta = await apiClient.put(
        `${API_URL.replace(/\/+$/, '')}/users/${encodeURIComponent(usuarioSeleccionado)}`,
        datosUsuario,
      )
      setUsuarios((usuariosActuales) =>
        usuariosActuales.map((usuario) =>
          String(usuario.id) === usuarioSeleccionado ? respuesta.data.user : usuario,
        ),
      )
      setMensaje('Usuario actualizado correctamente.')
      cerrarPanelDespuesDe()
    } catch (errorSolicitud) {
      setError(
        errorSolicitud.response?.data?.message || 'No fue posible actualizar el usuario.',
      )
    } finally {
      setCargando(false)
    }
  }

  const usuarioPorEliminar = usuarios.find(
    (usuario) => String(usuario.id) === usuarioSeleccionado,
  )

  return (
    <section className="funcionalidades" id="funcionalidades">
      <div className="section-inner">
        <p className="eyebrow">Funcionalidades</p>
        <h2 className="section-title section-title-light">
          Todo el control de tu dinero, en un solo panel
        </h2>

        <div className="func-grid">
          {funcionalidades.map((func) => (
            func.titulo === 'Ingreso de dinero' ? (
              <button
                className="func-card func-card-action"
                key={func.titulo}
                type="button"
                onClick={desplegarFormularioIngreso}
                aria-expanded={ingresoAbierto && !cerrandoIngreso}
                aria-controls="income-registration"
              >
                <span className="func-icon" aria-hidden="true">{func.icono}</span>
                <span className="func-card-title">{func.titulo}</span>
                <span className="func-card-description">{func.descripcion}</span>
                <span className="income-toggle-label">
                  {ingresoAbierto ? 'Cerrar formulario' : 'Abrir formulario'}
                  <span className={`income-toggle-arrow${ingresoAbierto ? ' open' : ''}`} aria-hidden="true">
                    ▾
                  </span>
                </span>
              </button>
            ) : (
              <article className="func-card" key={func.titulo}>
                <div className="func-icon">{func.icono}</div>
                <h3>{func.titulo}</h3>
                <p>{func.descripcion}</p>
              </article>
            )
          ))}
          {accionesUsuarios.map((func) => (
            <button
              className="func-card func-card-action"
              key={func.accion}
              type="button"
              onClick={() => abrirAccion(func.accion)}
              aria-expanded={accionActiva === func.accion}
            >
              <span className="func-icon" aria-hidden="true">{func.icono}</span>
              <span className="func-card-title">{func.titulo}</span>
              <span className="func-card-description">{func.descripcion}</span>
            </button>
          ))}
        </div>

        {ingresoAbierto && (
          <section
            ref={panelIngresoRef}
            className={`income-registration${abriendoIngreso ? ' income-registration-abriendo' : ''}${cerrandoIngreso ? ' income-registration-cerrando' : ''}`}
            style={abriendoIngreso || cerrandoIngreso ? { '--altura-income-panel': `${alturaIngreso}px` } : undefined}
            onAnimationEnd={manejarFinCierreIngreso}
            id="income-registration"
            aria-labelledby="income-registration-title"
          >
            <h3 id="income-registration-title">
              {ingresoEditando ? 'Editar ingreso:' : 'Nuevo registro:'}
            </h3>
            <form className="income-registration-form" onSubmit={guardarIngreso}>
              <div className="income-registration-fields">
                <label htmlFor="income-client">Cliente:</label>
                <select
                  id="income-client"
                  name="usuarioId"
                  required
                  disabled={cargandoClientes || usuarios.length === 0}
                  value={datosIngreso.usuarioId}
                  onChange={(evento) =>
                    setDatosIngreso({ ...datosIngreso, usuarioId: evento.target.value })
                  }
                >
                  <option value="" disabled>
                    {cargandoClientes
                      ? 'Cargando usuarios...'
                      : usuarios.length
                        ? 'Selecciona un cliente'
                        : 'No hay usuarios registrados'}
                  </option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.name} {usuario.lastName} — {usuario.email}
                    </option>
                  ))}
                </select>

                <label htmlFor="income-account">Cuenta bancaria:</label>
                <input
                  id="income-account"
                  name="cuentaBancaria"
                  maxLength={100}
                  required
                  disabled={['efectivo', 'tarjeta'].includes(datosIngreso.metodoPago)}
                  value={datosIngreso.cuentaBancaria}
                  onChange={(evento) =>
                    setDatosIngreso({ ...datosIngreso, cuentaBancaria: evento.target.value })
                  }
                />

                <label htmlFor="income-method">Método de pago:</label>
                <select
                  id="income-method"
                  name="metodoPago"
                  required
                  value={datosIngreso.metodoPago}
                  onChange={(evento) => {
                    const metodoPago = evento.target.value
                    setDatosIngreso((datosActuales) => ({
                      ...datosActuales,
                      metodoPago,
                      cuentaBancaria:
                        metodoPago === 'transferencia'
                          ? datosActuales.cuentaBancaria === CUENTA_NO_APLICA
                            ? ''
                            : datosActuales.cuentaBancaria
                          : CUENTA_NO_APLICA,
                    }))
                  }}
                >
                  <option value="" disabled>Selecciona un método</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>

                <label htmlFor="income-date">Fecha de pago:</label>
                <input
                  id="income-date"
                  name="fechaPago"
                  type="date"
                  required
                  value={datosIngreso.fechaPago}
                  onChange={(evento) =>
                    setDatosIngreso({ ...datosIngreso, fechaPago: evento.target.value })
                  }
                />

                <label htmlFor="income-amount">Valor del ingreso:</label>
                <input
                  id="income-amount"
                  name="valor"
                  type="number"
                  min="0.01"
                  max="999999999999.99"
                  step="0.01"
                  required
                  value={datosIngreso.valor}
                  onChange={(evento) =>
                    setDatosIngreso({ ...datosIngreso, valor: evento.target.value })
                  }
                />

                <label htmlFor="income-observation">Observación:</label>
                <input
                  id="income-observation"
                  name="observacion"
                  maxLength={10000}
                  value={datosIngreso.observacion}
                  onChange={(evento) =>
                    setDatosIngreso({ ...datosIngreso, observacion: evento.target.value })
                  }
                />
              </div>

              {errorClientes && (
                <p className="income-registration-error" role="alert">{errorClientes}</p>
              )}
              {!cargandoClientes && !errorClientes && usuarios.length === 0 && (
                <p className="income-registration-error" role="status">
                  Registra un usuario antes de crear un ingreso.
                </p>
              )}
              {errorIngreso && <p className="income-registration-error" role="alert">{errorIngreso}</p>}
              {mensajeIngreso && <p className="income-registration-message" role="status">{mensajeIngreso}</p>}

              <div className="income-registration-actions">
                {ingresoEditando && (
                  <button
                    className="income-cancel-button"
                    type="button"
                    onClick={() => {
                      setIngresoEditando(null)
                      setDatosIngreso(ingresoVacio)
                      setErrorIngreso('')
                      setMensajeIngreso('')
                    }}
                  >
                    Cancelar edición
                  </button>
                )}
                <button
                  className="income-save-button"
                  type="submit"
                  disabled={guardandoIngreso}
                >
                  {guardandoIngreso
                    ? 'Guardando...'
                    : ingresoEditando
                      ? 'Guardar cambios'
                      : 'Guardar'}
                </button>
              </div>
            </form>

            <button
              type="button"
              className="income-list-toggle"
              onClick={desplegarListaIngresos}
              aria-expanded={listaIngresosAbierta}
              aria-controls="income-list"
            >
              <span>
                {listaIngresosAbierta ? 'Ocultar ingresos registrados' : 'Ver ingresos registrados'}
              </span>
              <span
                className={`income-toggle-arrow${listaIngresosAbierta ? ' open' : ''}`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>

            {listaIngresosAbierta && (
              <section className="income-list" id="income-list" aria-labelledby="income-list-title">
                <h3 id="income-list-title">Ingresos registrados</h3>
              {cargandoIngresos && <p role="status">Consultando ingresos...</p>}
              {errorListaIngresos && <p className="income-registration-error" role="alert">{errorListaIngresos}</p>}
              {!cargandoIngresos && !errorListaIngresos && ingresos.length === 0 && (
                <p>Aún no hay ingresos registrados.</p>
              )}
              {!cargandoIngresos && ingresos.length > 0 && (
                <div className="income-table-wrapper">
                  <table className="income-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Cuenta bancaria</th>
                        <th>Método de pago</th>
                        <th>Valor</th>
                        <th>Observación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingresos.map((ingreso) => (
                        <tr key={ingreso.id}>
                          <td>{fechaComoDiaCalendario(ingreso.fechaPago)}</td>
                          <td>{ingreso.cliente}</td>
                          <td>{ingreso.cuentaBancaria}</td>
                          <td>{ingreso.metodoPago}</td>
                          <td>{formatoMoneda.format(Number(ingreso.valor))}</td>
                          <td>{ingreso.observacion || '—'}</td>
                          <td>
                            <div className="income-row-actions">
                              <button
                                type="button"
                                onClick={() => editarIngreso(ingreso)}
                                aria-label={`Editar ingreso de ${ingreso.cliente}`}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="income-delete-button"
                                onClick={() => setIngresoAEliminar(ingreso)}
                                aria-label={`Eliminar ingreso de ${ingreso.cliente}`}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </section>
            )}

            <dialog
              ref={dialogoIngresoRef}
              className="delete-confirm-dialog"
              onCancel={() => setIngresoAEliminar(null)}
            >
              {ingresoAEliminar && (
                <>
                  <p>
                    ¿Eliminar el ingreso de <strong>{ingresoAEliminar.cliente}</strong> por{' '}
                    <strong>{formatoMoneda.format(Number(ingresoAEliminar.valor))}</strong>?
                  </p>
                  <div className="delete-confirm-actions">
                    <button
                      type="button"
                      onClick={() => setIngresoAEliminar(null)}
                      disabled={eliminandoIngreso}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmarEliminarIngreso}
                      disabled={eliminandoIngreso}
                    >
                      {eliminandoIngreso ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </>
              )}
            </dialog>
          </section>
        )}

        {accionActiva && (
          <section
            ref={panelAccionRef}
            className={`user-action-panel${abriendoPanel ? ' user-action-panel-abriendo' : ''}${cerrandoPanel ? ' user-action-panel-cerrando' : ''}`}
            style={abriendoPanel || cerrandoPanel ? { '--altura-panel': `${alturaPanel}px` } : undefined}
            onAnimationEnd={manejarFinCierrePanel}
            aria-labelledby="user-action-title"
          >
            <div className="user-action-heading">
              <h3 id="user-action-title">
                {accionesUsuarios.find((accion) => accion.accion === accionActiva).titulo}
              </h3>
              <button
                type="button"
                className="user-action-close"
                onClick={() => {
                  clearTimeout(temporizadorCierreRef.current)
                  setAccionActiva('')
                  setCerrandoPanel(false)
                }}
                aria-label="Cerrar panel"
              >
                ×
              </button>
            </div>

            {cargando && <p role="status">Cargando...</p>}
            {error && <p className="user-action-error" role="alert">{error}</p>}
            {mensaje && <p className="user-action-success" role="status">{mensaje}</p>}

            {!cargando && !error && accionActiva === 'consultar' && (
              usuarios.length === 0 ? (
                <p>No hay usuarios registrados.</p>
              ) : (
                <div className="user-table-wrapper">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Correo electrónico</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                          <td>{usuario.name}</td>
                          <td>{usuario.lastName}</td>
                          <td>{usuario.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {!cargando && (accionActiva === 'eliminar' || accionActiva === 'modificar') && (
              usuarios.length === 0 ? (
                <p>No hay usuarios registrados.</p>
              ) : (
                <form
                  className="user-action-form"
                  onSubmit={accionActiva === 'eliminar' ? manejarEliminacion : manejarModificacion}
                >
                  <label htmlFor="usuarioSeleccionado">Usuario:</label>
                  <select
                    id="usuarioSeleccionado"
                    value={usuarioSeleccionado}
                    onChange={(evento) => seleccionarUsuario(evento.target.value)}
                    required
                  >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.name} {usuario.lastName} — {usuario.email}
                      </option>
                    ))}
                  </select>

                  {accionActiva === 'modificar' && usuarioSeleccionado && (
                    <>
                      <label htmlFor="nombreModificado">Nombre:</label>
                      <input
                        id="nombreModificado"
                        value={datosUsuario.name}
                        onChange={(evento) =>
                          setDatosUsuario({ ...datosUsuario, name: evento.target.value })
                        }
                        maxLength={50}
                        required
                      />
                      <label htmlFor="apellidoModificado">Apellido:</label>
                      <input
                        id="apellidoModificado"
                        value={datosUsuario.lastName}
                        onChange={(evento) =>
                          setDatosUsuario({ ...datosUsuario, lastName: evento.target.value })
                        }
                        maxLength={50}
                        required
                      />
                      <label htmlFor="correoModificado">Correo electrónico:</label>
                      <input
                        id="correoModificado"
                        type="email"
                        value={datosUsuario.email}
                        onChange={(evento) =>
                          setDatosUsuario({ ...datosUsuario, email: evento.target.value })
                        }
                        maxLength={100}
                        required
                      />
                    </>
                  )}

                  <button className="btn btn-primary" type="submit" disabled={cargando}>
                    {accionActiva === 'eliminar' ? 'Eliminar usuario' : 'Guardar cambios'}
                  </button>
                </form>
              )
            )}

            <dialog
              ref={dialogoConfirmacionRef}
              className="delete-confirm-dialog"
              onCancel={() => setMostrarConfirmacion(false)}
            >
              {accionActiva === 'eliminar' && usuarioPorEliminar && (
                <>
                  <p>
                    ¿Eliminar a <strong>{usuarioPorEliminar.name} {usuarioPorEliminar.lastName}</strong>?
                  </p>
                  <div className="delete-confirm-actions">
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmacion(false)}
                      disabled={cargando}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmarEliminacion}
                      disabled={cargando}
                    >
                      {cargando ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </>
              )}
            </dialog>

          </section>
        )}
      </div>
    </section>
  )
}

export default Funcionalidades

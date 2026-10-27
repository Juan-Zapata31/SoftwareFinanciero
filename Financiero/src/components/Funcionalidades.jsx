import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
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

function Funcionalidades() {
  const dialogoConfirmacionRef = useRef(null)
  const panelAccionRef = useRef(null)
  const temporizadorCierreRef = useRef(null)
  const [accionActiva, setAccionActiva] = useState('')
  const [ingresoAbierto, setIngresoAbierto] = useState(false)
  const [mensajeIngreso, setMensajeIngreso] = useState('')
  const [usuarios, setUsuarios] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('')
  const [datosUsuario, setDatosUsuario] = useState({ name: '', lastName: '', email: '' })
  const [cargando, setCargando] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [cerrandoPanel, setCerrandoPanel] = useState(false)
  const [alturaPanel, setAlturaPanel] = useState(0)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => () => clearTimeout(temporizadorCierreRef.current), [])

  useEffect(() => {
    const dialogo = dialogoConfirmacionRef.current
    if (!dialogo) return

    if (mostrarConfirmacion && !dialogo.open) {
      dialogo.showModal()
    } else if (!mostrarConfirmacion && dialogo.open) {
      dialogo.close()
    }
  }, [mostrarConfirmacion])

  const obtenerUsuarios = async () => {
    if (!API_URL) {
      throw new Error('Falta configurar VITE_API_URL en el archivo .env del frontend.')
    }

    const respuesta = await axios.get(`${API_URL.replace(/\/+$/, '')}/users`)
    setUsuarios(respuesta.data)
    return respuesta.data
  }

  const abrirAccion = async (accion) => {
    clearTimeout(temporizadorCierreRef.current)
    setAccionActiva(accion)
    setCerrandoPanel(false)
    setUsuarioSeleccionado('')
    setDatosUsuario({ name: '', lastName: '', email: '' })
    setError('')
    setMensaje('')
    setCargando(true)

    try {
      await obtenerUsuarios()
      if (accion === 'consultar') {
        cerrarPanelDespuesDe(2000)
      } else if (accion === 'eliminar' || accion === 'modificar') {
        cerrarPanelDespuesDe(2000)
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

  const cerrarPanelDespuesDe = (demora = 1000) => {
    clearTimeout(temporizadorCierreRef.current)
    temporizadorCierreRef.current = setTimeout(() => {
      setAlturaPanel(panelAccionRef.current?.getBoundingClientRect().height || 0)
      setCerrandoPanel(true)
    }, demora)
  }

  const manejarFinCierrePanel = (evento) => {
    if (
      evento.target === evento.currentTarget &&
      evento.animationName === 'user-action-panel-close' &&
      cerrandoPanel
    ) {
      setAccionActiva('')
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
      cerrarPanelDespuesDe(2000)
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
      await axios.delete(
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
      const respuesta = await axios.put(
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
                onClick={() => {
                  setIngresoAbierto(true)
                  setMensajeIngreso('')
                }}
                aria-expanded={ingresoAbierto}
                aria-controls={ingresoAbierto ? 'income-registration' : undefined}
              >
                <span className="func-icon" aria-hidden="true">{func.icono}</span>
                <span className="func-card-title">{func.titulo}</span>
                <span className="func-card-description">{func.descripcion}</span>
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
          <section className="income-registration" id="income-registration" aria-labelledby="income-registration-title">
            <h3 id="income-registration-title">Nuevo registro:</h3>
            <form
              className="income-registration-form"
              onSubmit={(evento) => {
                evento.preventDefault()
                setMensajeIngreso('La vista está lista, pero todavía no hay un servicio para guardar ingresos.')
              }}
            >
              <div className="income-registration-fields">
                <label htmlFor="income-client">Cliente:</label>
                <input id="income-client" name="cliente" autoComplete="organization" required />

                <label htmlFor="income-account">Cuenta bancaria:</label>
                <input id="income-account" name="cuentaBancaria" required />

                <label htmlFor="income-method">Método de pago:</label>
                <select id="income-method" name="metodoPago" defaultValue="" required>
                  <option value="" disabled>Selecciona un método</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>

                <label htmlFor="income-date">Fecha de pago:</label>
                <input id="income-date" name="fechaPago" type="date" required />

                <label htmlFor="income-observation">Observación:</label>
                <input id="income-observation" name="observacion" />
              </div>

              {mensajeIngreso && <p className="income-registration-message" role="status">{mensajeIngreso}</p>}

              <div className="income-registration-actions">
                <button
                  className="income-cancel-button"
                  type="button"
                  onClick={() => {
                    setIngresoAbierto(false)
                    setMensajeIngreso('')
                  }}
                >
                  Cancelar
                </button>
                <button className="income-save-button" type="submit">Guardar</button>
              </div>
            </form>
          </section>
        )}

        {accionActiva && (
          <section
            ref={panelAccionRef}
            className={`user-action-panel${cerrandoPanel ? ' user-action-panel-cerrando' : ''}`}
            style={cerrandoPanel ? { '--altura-panel': `${alturaPanel}px` } : undefined}
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

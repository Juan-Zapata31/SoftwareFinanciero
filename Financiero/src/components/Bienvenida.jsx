import { useEffect, useRef, useState } from 'react'
import apiClient from '../services/api.js'
import './Bienvenida.css'

function Bienvenida({ visible, onCerrar }) {
  const seccionRef = useRef(null)
  const nombreRef = useRef(null)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [cerrando, setCerrando] = useState(false)
  const [alturaSeccion, setAlturaSeccion] = useState(0)
  const temporizadorRef = useRef(null)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    return () => clearTimeout(temporizadorRef.current)
  }, [])

  useEffect(() => {
    if (visible) {
      clearTimeout(temporizadorRef.current)
      setCerrando(false)
      setMensaje('')
      seccionRef.current?.scrollIntoView({ behavior: 'smooth' })
      nombreRef.current?.focus({ preventScroll: true })
    }
  }, [visible])

  const manejarCambio = (setter) => (evento) => {
    setter(evento.target.value)
    clearTimeout(temporizadorRef.current)
    setError('')
    setMensaje('')
  }

  const mostrarError = (mensajeError) => {
    setError(mensajeError)
    clearTimeout(temporizadorRef.current)
    temporizadorRef.current = setTimeout(() => setError(''), 5000)
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    clearTimeout(temporizadorRef.current)
    setError('')
    setMensaje('')

    const nombreLimpio = nombre.trim()
    const apellidoLimpio = apellido.trim()
    const emailLimpio = email.trim()
    const soloLetras = /^[\p{L} ]+$/u
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!nombreLimpio) {
      mostrarError('El campo nombre no puede ir vacío')
      return
    }

    if (nombreLimpio.length < 2 || nombreLimpio.length > 50 || !soloLetras.test(nombreLimpio)) {
      mostrarError('El nombre debe tener entre 2 y 50 caracteres y solo puede contener letras y espacios.')
      return
    }

    if (!apellidoLimpio) {
      mostrarError('El campo apellido no puede ir vacío')
      return
    }

    if (apellidoLimpio.length < 2 || apellidoLimpio.length > 50 || !soloLetras.test(apellidoLimpio)) {
      mostrarError('El apellido debe tener entre 2 y 50 caracteres y solo puede contener letras y espacios.')
      return
    }

    if (!emailLimpio) {
      mostrarError('El campo correo electrónico no puede ir vacío')
      return
    }

    if (emailLimpio.length > 100 || !emailValido.test(emailLimpio)) {
      mostrarError('Escribe un correo electrónico válido de máximo 100 caracteres.')
      return
    }

    if (!API_URL) {
      mostrarError('Falta configurar VITE_API_URL en el archivo .env del frontend.')
      return
    }

    setGuardando(true)
    try {
      await apiClient.post(`${API_URL.replace(/\/+$/, '')}/users`, {
        name: nombreLimpio,
        lastName: apellidoLimpio,
        email: emailLimpio,
      })

      setNombre('')
      setApellido('')
      setEmail('')
      setMensaje(`Usuario guardado correctamente. ¡Bienvenido, ${nombreLimpio}!`)
      temporizadorRef.current = setTimeout(() => {
        setAlturaSeccion(seccionRef.current?.getBoundingClientRect().height || 0)
        setCerrando(true)
      }, 1000)
    } catch (errorSolicitud) {
      const mensajeError =
        errorSolicitud.response?.data?.message || 'No fue posible conectar con el servidor.'
      mostrarError(mensajeError)
    } finally {
      setGuardando(false)
    }
  }

  const manejarFinAnimacion = (evento) => {
    if (evento.target === evento.currentTarget && evento.animationName === 'bienvenida-cerrar') {
      onCerrar()
    }
  }

  if (!visible) return null

  return (
    <section
      className={`bienvenida${cerrando ? ' bienvenida-cerrando' : ''}`}
      id="bienvenida"
      ref={seccionRef}
      style={cerrando ? { '--altura-seccion': `${alturaSeccion}px` } : undefined}
      onAnimationEnd={manejarFinAnimacion}
    >
      <div className="bienvenida-card">
        <h2>Bienvenido(a)</h2>
        <form className="form-bienvenida" onSubmit={manejarEnvio} noValidate>
          <div className="form-bienvenida-field">
            <label htmlFor="nombreUsuario">Nombre:</label>
            <input
              type="text"
              id="nombreUsuario"
              name="nombreUsuario"
              ref={nombreRef}
              placeholder="Escribe tu nombre"
              value={nombre}
              maxLength={50}
              onChange={manejarCambio(setNombre)}
              disabled={Boolean(mensaje)}
              required
            />
          </div>
          <div className="form-bienvenida-field">
            <label htmlFor="apellidoUsuario">Apellido:</label>
            <input
              type="text"
              id="apellidoUsuario"
              name="apellidoUsuario"
              placeholder="Escribe tu apellido"
              value={apellido}
              maxLength={50}
              onChange={manejarCambio(setApellido)}
              disabled={Boolean(mensaje)}
              required
            />
          </div>
          <div className="form-bienvenida-field">
            <label htmlFor="emailUsuario">Correo electrónico:</label>
            <input
              type="email"
              id="emailUsuario"
              name="emailUsuario"
              placeholder="nombre@correo.com"
              value={email}
              maxLength={100}
              onChange={manejarCambio(setEmail)}
              disabled={Boolean(mensaje)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={guardando || cerrando || Boolean(mensaje)}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <p className="error-msg" aria-live="polite">{error}</p>
        </form>
        <p className="mensaje-dinamico" aria-live="polite">{mensaje}</p>
      </div>
    </section>
  )
}

export default Bienvenida

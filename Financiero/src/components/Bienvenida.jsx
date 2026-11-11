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
      className={`mx-auto flex justify-center px-6 py-14 sm:px-8${cerrando ? ' bienvenida-cerrando' : ''}`}
      id="bienvenida"
      ref={seccionRef}
      style={cerrando ? { '--altura-seccion': `${alturaSeccion}px` } : undefined}
      onAnimationEnd={manejarFinAnimacion}
    >
      <div className="w-full max-w-[560px] rounded-[10px] bg-white px-6 py-8 text-center shadow-[0_10px_30px_rgba(18,61,67,0.12)] sm:px-8 sm:py-9">
        <h2 className="!mb-5 text-2xl">Bienvenido(a)</h2>
        <form className="grid gap-4" onSubmit={manejarEnvio} noValidate>
          <div className="grid gap-2 text-left">
            <label className="text-left text-sm font-semibold text-[var(--ink-soft)]" htmlFor="nombreUsuario">Nombre:</label>
            <input
              className="w-full rounded-md border border-[#cfe0e2] bg-[var(--bg-light)] px-4 py-3 text-base text-[var(--ink)] [font-family:var(--font-body)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cyan-500)] disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="grid gap-2 text-left">
            <label className="text-left text-sm font-semibold text-[var(--ink-soft)]" htmlFor="apellidoUsuario">Apellido:</label>
            <input
              className="w-full rounded-md border border-[#cfe0e2] bg-[var(--bg-light)] px-4 py-3 text-base text-[var(--ink)] [font-family:var(--font-body)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cyan-500)] disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="grid gap-2 text-left">
            <label className="text-left text-sm font-semibold text-[var(--ink-soft)]" htmlFor="emailUsuario">Correo electrónico:</label>
            <input
              className="w-full rounded-md border border-[#cfe0e2] bg-[var(--bg-light)] px-4 py-3 text-base text-[var(--ink)] [font-family:var(--font-body)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--cyan-500)] disabled:cursor-not-allowed disabled:opacity-60"
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
            className="mt-1 inline-flex w-full cursor-pointer justify-center rounded-md border-0 bg-[var(--teal-700)] px-7 py-3.5 text-[0.95rem] uppercase tracking-[0.03em] text-white [font-family:var(--font-display)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--teal-950)] hover:shadow-[0_8px_18px_rgba(18,61,67,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan-500)] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
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

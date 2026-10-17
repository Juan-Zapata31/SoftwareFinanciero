import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import './Bienvenida.css'

function Bienvenida() {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const temporizadorRef = useRef(null)

  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    return () => clearTimeout(temporizadorRef.current)
  }, [])

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

    if (nombreLimpio.length < 2 || nombreLimpio.length > 50 || !soloLetras.test(nombreLimpio)) {
      mostrarError('El nombre debe tener entre 2 y 50 caracteres y solo puede contener letras y espacios.')
      return
    }

    if (apellidoLimpio.length < 2 || apellidoLimpio.length > 50 || !soloLetras.test(apellidoLimpio)) {
      mostrarError('El apellido debe tener entre 2 y 50 caracteres y solo puede contener letras y espacios.')
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
      await axios.post(`${API_URL.replace(/\/+$/, '')}/users`, {
        name: nombreLimpio,
        lastName: apellidoLimpio,
        email: emailLimpio,
      })

      setNombre('')
      setApellido('')
      setEmail('')
      setMensaje(`Bienvenido, ${nombreLimpio}. Gracias por visitar nuestro sistema.`)
      temporizadorRef.current = setTimeout(() => setMensaje(''), 5000)
    } catch (errorSolicitud) {
      const mensajeError =
        errorSolicitud.response?.data?.message || 'No fue posible conectar con el servidor.'
      mostrarError(mensajeError)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="bienvenida" id="bienvenida">
      <div className="bienvenida-card">
        <h2>Bienvenido(a)</h2>
        <form className="form-bienvenida" onSubmit={manejarEnvio} noValidate>
          <div className="form-bienvenida-field">
            <label htmlFor="nombreUsuario">Nombre:</label>
            <input
              type="text"
              id="nombreUsuario"
              name="nombreUsuario"
              placeholder="Escribe tu nombre"
              value={nombre}
              maxLength={50}
              onChange={manejarCambio(setNombre)}
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
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
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

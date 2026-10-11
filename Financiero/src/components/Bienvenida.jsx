import { useEffect, useRef, useState } from 'react'
import './Bienvenida.css'

function validarNombre(valor, campo = 'nombre') {
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
  if (valor.trim().length === 0) {
    return `Por favor escribe tu ${campo}.`
  }
  if (valor.trim().length < 2) {
    return `El ${campo} debe tener al menos 2 caracteres.`
  }
  if (!soloLetras.test(valor.trim())) {
    return `El ${campo} solo puede contener letras.`
  }
  return ''
}

function generarMensajeBienvenida(nombre) {
  return `Bienvenido, ${nombre}. Gracias por visitar nuestro sistema.`
}

function Bienvenida() {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const temporizadorRef = useRef(null)
  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => () => clearTimeout(temporizadorRef.current), [])

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

    const errorEncontrado =
      validarNombre(nombre) ||
      validarNombre(apellido, 'apellido') ||
      (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? 'Escribe un correo electrónico válido.'
        : '')

    if (errorEncontrado) {
      mostrarError(errorEncontrado)
      return
    }

    if (!API_URL) {
      mostrarError('Falta configurar VITE_API_URL en el archivo .env del frontend.')
      return
    }

    setGuardando(true)
    const nombreGuardado = nombre.trim()
    try {
      const respuesta = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nombreGuardado,
          lastName: apellido.trim(),
          email: email.trim(),
        }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.message || 'No fue posible guardar tus datos.')
      }

      setNombre('')
      setApellido('')
      setEmail('')
      setMensaje(generarMensajeBienvenida(nombreGuardado))
      temporizadorRef.current = setTimeout(() => setMensaje(''), 5000)
    } catch (errorSolicitud) {
      mostrarError(errorSolicitud.message || 'No fue posible conectar con el servidor.')
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

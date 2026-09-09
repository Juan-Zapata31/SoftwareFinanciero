import { useState } from 'react'
import './Bienvenida.css'

function validarNombre(valor) {
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
  if (valor.trim().length === 0) {
    return 'Por favor escribe tu nombre.'
  }
  if (valor.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.'
  }
  if (!soloLetras.test(valor.trim())) {
    return 'El nombre solo puede contener letras.'
  }
  return ''
}

function generarMensajeBienvenida(nombre) {
  return `Bienvenido, ${nombre}. Gracias por visitar nuestro sistema.`
}

function Bienvenida() {
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const manejarCambio = (evento) => {
    setNombre(evento.target.value)
    if (error) setError('')
  }

  const manejarEnvio = (evento) => {
    evento.preventDefault()
    const errorEncontrado = validarNombre(nombre)

    if (errorEncontrado) {
      setError(errorEncontrado)
      setMensaje('')
      return
    }

    setError('')
    setMensaje(generarMensajeBienvenida(nombre.trim()))
  }

  return (
    <section className="bienvenida" id="bienvenida">
      <div className="bienvenida-card">
        <h2>Bienvenido(a)</h2>
        <form className="form-bienvenida" onSubmit={manejarEnvio} noValidate>
          <label htmlFor="nombreUsuario">¿Cómo te llamas?</label>
          <div className="form-row">
            <input
              type="text"
              id="nombreUsuario"
              name="nombreUsuario"
              placeholder="Escribe tu nombre"
              value={nombre}
              onChange={manejarCambio}
            />
            <button type="submit" className="btn btn-primary">
              Ver mensaje
            </button>
          </div>
          <p className="error-msg" aria-live="polite">{error}</p>
        </form>
        <p className="mensaje-dinamico" aria-live="polite">{mensaje}</p>
      </div>
    </section>
  )
}

export default Bienvenida

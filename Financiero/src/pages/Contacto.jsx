import { useState } from 'react'
import './Contacto.css'

function validarNombre(valor, etiqueta) {
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
  if (valor.trim().length === 0) {
    return `Por favor escribe tu ${etiqueta}.`
  }
  if (valor.trim().length < 2) {
    return `El ${etiqueta} debe tener al menos 2 caracteres.`
  }
  if (!soloLetras.test(valor.trim())) {
    return `El ${etiqueta} solo puede contener letras.`
  }
  return ''
}

function validarEmail(valor) {
  const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (valor.trim().length === 0) {
    return 'Por favor escribe tu email.'
  }
  if (!formatoValido.test(valor.trim())) {
    return 'Escribe un email válido (ej: nombre@correo.com).'
  }
  return ''
}

function Contacto() {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)

  const manejarCambio = (campo, valor) => {
    if (campo === 'nombre') setNombre(valor)
    if (campo === 'apellido') setApellido(valor)
    if (campo === 'email') setEmail(valor)

    if (errores[campo]) {
      setErrores((previo) => ({ ...previo, [campo]: '' }))
    }
    if (enviado) setEnviado(false)
  }

  const manejarEnvio = (evento) => {
    evento.preventDefault()

    const nuevosErrores = {
      nombre: validarNombre(nombre, 'nombre'),
      apellido: validarNombre(apellido, 'apellido'),
      email: validarEmail(email),
    }

    setErrores(nuevosErrores)

    const hayErrores = Object.values(nuevosErrores).some((mensaje) => mensaje !== '')
    if (hayErrores) {
      setEnviado(false)
      return
    }

    setEnviado(true)
  }

  return (
    <section className="contacto">
      <div className="section-inner">
        <p className="eyebrow eyebrow-dark">Contacto</p>
        <h2 className="section-title">Hablemos del proyecto</h2>

        <div className="contacto-layout">
          <div className="contacto-grid">
            <div className="contacto-col">
              <h4>Proyecto</h4>
              <p>SOFTWARE FINANCIERO</p>
              <p>Año: 2026</p>
            </div>
            <div className="contacto-col">
              <h4>Universidad</h4>
              <p>Institución Universitaria Tecnológico de Antioquia — Medellín</p>
            </div>
          </div>

          <div className="contacto-card">
            <h3>Dejanos tus datos</h3>
            <p className="contacto-card-desc">
              Completa el formulario y te contactaremos para mostrarte la plataforma.
            </p>
            <form className="form-contacto" onSubmit={manejarEnvio} noValidate>
              <div className="form-field">
                <label htmlFor="contactoNombre">Nombre:</label>
                <input
                  type="text"
                  id="contactoNombre"
                  value={nombre}
                  onChange={(evento) => manejarCambio('nombre', evento.target.value)}
                />
                <p className="error-msg" aria-live="polite">{errores.nombre}</p>
              </div>

              <div className="form-field">
                <label htmlFor="contactoApellido">Apellido:</label>
                <input
                  type="text"
                  id="contactoApellido"
                  value={apellido}
                  onChange={(evento) => manejarCambio('apellido', evento.target.value)}
                />
                <p className="error-msg" aria-live="polite">{errores.apellido}</p>
              </div>

              <div className="form-field">
                <label htmlFor="contactoEmail">Email:</label>
                <input
                  type="email"
                  id="contactoEmail"
                  value={email}
                  onChange={(evento) => manejarCambio('email', evento.target.value)}
                />
                <p className="error-msg" aria-live="polite">{errores.email}</p>
              </div>

              <button type="submit" className="btn btn-primary">
                Enviar
              </button>

              <p className="mensaje-dinamico" aria-live="polite">
                {enviado
                  ? `¡Gracias, ${nombre}! Te contactaremos al correo ${email}.`
                  : ''}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contacto

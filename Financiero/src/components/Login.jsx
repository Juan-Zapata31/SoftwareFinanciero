import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import './LoginModal.css'

function LoginModal({ abierto, onCerrar, onIniciarSesion }) {
  const dialogoRef = useRef(null)
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (!dialogo) return

    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  async function enviarFormulario(evento) {
    evento.preventDefault()
    setError('')

    if (!API_URL) {
      setError('Falta configurar VITE_API_URL en el archivo .env del frontend.')
      return
    }

    setCargando(true)
    try {
      const respuesta = await axios.post(
        `${API_URL.replace(/\/+$/, '')}/auth/login`,
        { username: usuario, password: clave },
      )
      onIniciarSesion(respuesta.data.user.username, respuesta.data.token)
      setUsuario('')
      setClave('')
    } catch (errorPeticion) {
      setError(
        errorPeticion.response?.data?.message ||
          'No fue posible iniciar sesión. Verifica la conexión con el servidor.',
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <dialog
      ref={dialogoRef}
      className="login-dialog"
      aria-labelledby="login-title"
      onClose={onCerrar}
    >
      <div className="login-dialog-header">
        <div>
          <p className="eyebrow eyebrow-dark">Acceso administrativo</p>
          <h2 id="login-title">Iniciar sesión</h2>
        </div>
        <button
          type="button"
          className="login-close"
          aria-label="Cerrar formulario de inicio de sesión"
          onClick={onCerrar}
        >
          ×
        </button>
      </div>
      <form className="login-form" onSubmit={enviarFormulario}>
        <label htmlFor="login-username">Usuario</label>
        <input
          id="login-username"
          name="username"
          autoComplete="username"
          required
          value={usuario}
          onChange={(evento) => setUsuario(evento.target.value)}
        />
        <label htmlFor="login-password">Clave</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={clave}
          onChange={(evento) => setClave(evento.target.value)}
        />
        {error && <p className="login-error" role="alert">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={cargando}>
          {cargando ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </dialog>
  )
}

export default LoginModal

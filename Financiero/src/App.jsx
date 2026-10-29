import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Login from './components/Login.jsx'
import Inicio from './pages/Inicio.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Proyecto from './pages/Proyecto.jsx'
import FuncionalidadesPage from './pages/FuncionalidadesPage.jsx'
import Backend from './pages/Backend.jsx'
import './App.css'

function App() {
  const [usuario, setUsuario] = useState(() =>
    sessionStorage.getItem('authToken') ? sessionStorage.getItem('usuario') : null,
  )
  const [loginAbierto, setLoginAbierto] = useState(false)
  const API_URL = import.meta.env.VITE_API_URL

  function iniciarSesion(nombreUsuario, token) {
    sessionStorage.setItem('authToken', token)
    sessionStorage.setItem('usuario', nombreUsuario)
    setUsuario(nombreUsuario)
    setLoginAbierto(false)
  }

  async function cerrarSesion() {
    const token = sessionStorage.getItem('authToken')
    if (token && API_URL) {
      try {
        await axios.post(
          `${API_URL.replace(/\/+$/, '')}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        )
      } catch (error) {
        console.error('No fue posible invalidar la sesión en el servidor:', error)
      }
    }
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <div className="app-shell">
      <Header
        usuario={usuario}
        onIniciarSesion={() => setLoginAbierto(true)}
        onCerrarSesion={cerrarSesion}
      />
      <main className="app-main">
        {usuario ? (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/proyecto" element={<Proyecto />} />
            <Route path="/funcionalidades" element={<FuncionalidadesPage />} />
            <Route path="/api-test" element={<Backend />} />
            <Route path="/backend" element={<Backend />} />
          </Routes>
        ) : (
          <section className="login-required">
            <h1>Inicia sesión para continuar</h1>
            <p>Usa tu cuenta de administrador para acceder al sistema financiero.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setLoginAbierto(true)}
            >
              Iniciar sesión
            </button>
          </section>
        )}
      </main>
      <Login
        abierto={loginAbierto}
        onCerrar={() => setLoginAbierto(false)}
        onIniciarSesion={iniciarSesion}
      />
      <Footer />
    </div>
  )
}

export default App
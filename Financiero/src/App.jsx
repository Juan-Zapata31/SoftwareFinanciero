import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Inicio from './pages/Inicio.jsx'
import Proyecto from './pages/Proyecto.jsx'
import FuncionalidadesPage from './pages/FuncionalidadesPage.jsx'
import Contacto from './pages/Contacto.jsx'
import Backend from './pages/Backend.jsx'
import './App.css'

function App() {
  const [tema, setTema] = useState(() =>
    localStorage.getItem('tema') === 'claro' ? 'claro' : 'oscuro',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = tema
    localStorage.setItem('tema', tema)
  }, [tema])

  function cambiarTema() {
    setTema(temaActual => (temaActual === 'oscuro' ? 'claro' : 'oscuro'))
  }

  return (
    <div className="app-shell">
      <Header tema={tema} onCambiarTema={cambiarTema} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/proyecto" element={<Proyecto />} />
          <Route path="/funcionalidades" element={<FuncionalidadesPage />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/backend" element={<Backend />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
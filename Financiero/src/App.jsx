import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Inicio from './pages/Inicio.jsx'
import Proyecto from './pages/Proyecto.jsx'
import FuncionalidadesPage from './pages/FuncionalidadesPage.jsx'
import Contacto from './pages/Contacto.jsx'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/proyecto" element={<Proyecto />} />
        <Route path="/funcionalidades" element={<FuncionalidadesPage />} />
        <Route path="/contacto" element={<Contacto />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App

import { useState } from 'react'
import Hero from '../components/Hero.jsx'
import Bienvenida from '../components/Bienvenida.jsx'

function Inicio() {
  const [mostrarFormularioUsuario, setMostrarFormularioUsuario] = useState(false)

  return (
    <>
      <Hero onUsuarioNuevo={() => setMostrarFormularioUsuario(true)} />
      <Bienvenida
        visible={mostrarFormularioUsuario}
        onCerrar={() => setMostrarFormularioUsuario(false)}
      />
    </>
  )
}

export default Inicio

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Header.css'

function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  const enlaces = [
    { to: '/', texto: 'Inicio' },
    { to: '/proyecto', texto: 'Sobre nosotros' },
    { to: '/funcionalidades', texto: 'Funcionalidades' },
    { to: '/contacto', texto: 'Contacto' },
  ]

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-mark">
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 24C6 14 14 6 24 6" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <path d="M42 24C42 34 34 42 24 42" stroke="#5fd6c4" strokeWidth="4" strokeLinecap="round" />
              <path d="M10 30L20 20L27 27L40 12" stroke="#5fd6c4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M31 12H40V21" stroke="#5fd6c4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="brand-name">SOFTWARE FINANCIERO</span>
        </div>

        <button
          className="nav-toggle"
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`main-nav ${menuAbierto ? 'open' : ''}`}>
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              end={enlace.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setMenuAbierto(false)}
            >
              {enlace.texto}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header

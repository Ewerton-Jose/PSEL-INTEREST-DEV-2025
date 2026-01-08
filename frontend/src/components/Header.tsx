import React from 'react'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  return (
    <header className="compact-header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <div className="logo-compact">
            <span className="logo-icon">⚔️</span>
            <div className="logo-text-group">
              <span className="logo-title">Interest</span>
              <span className="logo-subtitle">Gestão de Equipes</span>
            </div>
          </div>
        </Link>
        
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/manage" className="nav-link">Usuários</Link>
          <Link to="/teams" className="nav-link">Equipes</Link>
          <a href="https://github.com/Joao-Marinho-Interest/Seletiva-Interest-Dev-2025" target="_blank" rel="noopener noreferrer" className="nav-link">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Header

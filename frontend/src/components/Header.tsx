import React from 'react'
import { Link } from 'react-router-dom'

const Header: React.FC = () => {
  return (
    <header className="compact-header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <div className="logo-compact">
            <img src="https://media.glassdoor.com/sqll/2614699/interest-engenharia-squarelogo-1645099511175.png" alt="Interest" className="logo-icon-img" />
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
        </nav>
      </div>
    </header>
  )
}

export default Header

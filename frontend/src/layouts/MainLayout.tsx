import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'

const MainLayout: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  const toggleSidebar = () => setSidebarVisible(prev => !prev)

  return (
    <div className="app-layout">
      <div className="stars"></div>
      <Header />
      <div className={`layout-with-sidebar ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
        <div className="sidebar-shell">
          <Sidebar />
          <button
            type="button"
            className="sidebar-toggle sidebar-edge-toggle"
            onClick={toggleSidebar}
            aria-pressed={sidebarVisible}
            aria-label={sidebarVisible ? 'Recolher menu lateral' : 'Expandir menu lateral'}
          >
            <span aria-hidden="true" className="sidebar-toggle-icon">
              {sidebarVisible ? '✕' : '☰'}
            </span>
          </button>
        </div>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default MainLayout

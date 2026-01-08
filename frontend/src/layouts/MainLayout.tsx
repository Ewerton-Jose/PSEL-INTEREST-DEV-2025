import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'

const MainLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <div className="stars"></div>
      <Header />
      <div className="layout-with-sidebar">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default MainLayout

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listTimes, Time } from '../services/api'

const Sidebar: React.FC = () => {
  const [times, setTimes] = useState<Time[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadTimes = async () => {
      setLoading(true)
      try {
        const data = await listTimes()
        setTimes(data)
      } catch (err) {
        console.error('Erro ao carregar times:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTimes()
  }, [])

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Times Ativos</h3>
      </div>
      
      <nav className="sidebar-nav">
        {loading ? (
          <div className="sidebar-loading">Carregando...</div>
        ) : times.length === 0 ? (
          <div className="sidebar-empty">Nenhum time criado</div>
        ) : (
          times.map(time => (
            <Link
              key={time.id_time}
              to={`/team/${time.id_time}`}
              className="sidebar-link"
              title={time.nome_time}
            >
              <span className="sidebar-link-icon">🏆</span>
              <span className="sidebar-link-text">{time.nome_time}</span>
              <span className="sidebar-link-count">{time.total_membros || 0}</span>
            </Link>
          ))
        )}
      </nav>

      <div className="sidebar-footer">
        <Link to="/teams" className="sidebar-btn">
          Ver Todos
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar

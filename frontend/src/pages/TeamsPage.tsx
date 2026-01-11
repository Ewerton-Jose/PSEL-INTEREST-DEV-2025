import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCPF } from '../utils/cpfMask'
import { listTimes, Time } from '../services/api'

const TeamsPage: React.FC = () => {
  const navigate = useNavigate()
  const [times, setTimes] = useState<Time[]>([])
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    loadTimes()
  }, [])

  return (
    <div className="container teams-page">
      <div className="page-header">
        <div>
          <h1>Equipes</h1>
          <p>Visualize e gerencie todas as equipes do sistema</p>
        </div>
        <button className="primary" onClick={() => navigate('/teams/new')}>
          + Novo Time
        </button>
        {loading && <span className="badge">Atualizando...</span>}
      </div>

      <div className="teams-grid">
        {times.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h3>Nenhuma equipe criada</h3>
            <p>Crie sua primeira equipe acessando a página de usuários</p>
          </div>
        ) : (
          times.map(time => (
            <div
              key={time.id_time}
              className="team-card"
              onClick={() => navigate(`/team-simple/${time.id_time}`)}
            >
              <div className="team-card-header">
                <div className="team-icon">🏆</div>
                <h3 className="team-name">{time.nome_time}</h3>
              </div>

              <div className="team-details">
                <div className="detail-row">
                  <span className="label">Líder:</span>
                  <span className="value">{time.lider_nome || formatCPF(time.cpf_lider)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Membros:</span>
                  <span className="value badge-count">{time.total_membros || 0}</span>
                </div>
                {time.responsabilidades && (
                  <div className="detail-row full-width">
                    <span className="label">Descrição:</span>
                    <p className="value-text">{time.responsabilidades}</p>
                  </div>
                )}
              </div>

              <div className="team-card-footer">
                <button className="btn-view">Ver Detalhes →</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TeamsPage

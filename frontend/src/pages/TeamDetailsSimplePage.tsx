import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTeam, listTeamMembers, User, Time } from '../services/api'

const TeamDetailsSimplePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const teamId = Number(id)

  const [team, setTeam] = useState<Time | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [teamData, membersData] = await Promise.all([
          getTeam(teamId),
          listTeamMembers(teamId),
        ])
        setTeam(teamData)
        setMembers(membersData)
        setError(null)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [teamId])

  if (loading) {
    return (
      <div className="container">
        <p>Carregando...</p>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="container">
        <p className="error-text">Erro ao carregar time: {error || 'Time não encontrado'}</p>
        <button onClick={() => navigate('/teams')} className="ghost">Voltar</button>
      </div>
    )
  }

  return (
    <div className="container simple-team-details">
      <div className="simple-header">
        <button onClick={() => navigate('/teams')} className="ghost">← Voltar</button>
      </div>

      <div className="simple-content">
        <h1>{team.nome_time}</h1>

        <div className="members-section">
          <h2>Membros</h2>
          <ul className="simple-members-list">
            {members.map(member => (
              <li key={member.cpf_user} className="member-item">
                {member.cpf_user === team.cpf_lider ? (
                  <strong>👑 {member.nome}</strong>
                ) : (
                  <span>{member.nome}</span>
                )}
              </li>
            ))}
            {members.length === 0 && (
              <li className="empty-message">Nenhum membro neste time</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TeamDetailsSimplePage

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCPF } from '../utils/cpfMask'
import { listTimes, listTeamMembers, Time, User } from '../services/api'

interface TeamWithMembers {
  team: Time
  members: User[]
}

const AllTeamsPage: React.FC = () => {
  const navigate = useNavigate()
  const [teamsWithMembers, setTeamsWithMembers] = useState<TeamWithMembers[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const times = await listTimes()
        const teamsData: TeamWithMembers[] = []

        for (const time of times) {
          try {
            const members = await listTeamMembers(time.id_time)
            teamsData.push({ team: time, members })
          } catch {
            teamsData.push({ team: time, members: [] })
          }
        }

        setTeamsWithMembers(teamsData)
        setError(null)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="container">
        <p>Carregando todas as equipes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <p className="error-text">Erro ao carregar equipes: {error}</p>
        <button onClick={() => navigate('/')} className="ghost">Voltar</button>
      </div>
    )
  }

  return (
    <div className="container all-teams-page">
      <div className="all-teams-header">
        <button onClick={() => navigate('/')} className="ghost">← Voltar</button>
        <h1>Todas as Equipes e Membros</h1>
      </div>

      <div className="all-teams-content">
        {teamsWithMembers.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma equipe criada</p>
          </div>
        ) : (
          teamsWithMembers.map(({ team, members }) => (
            <div key={team.id_time} className="team-group">
              <h2 className="team-group-title">{team.nome_time}</h2>

              <div className="members-list">
                {members.length === 0 ? (
                  <p className="no-members">Sem membros</p>
                ) : (
                  members.map(member => (
                    <div key={member.cpf_user} className="member-row">
                      <div className="member-main">
                        <span className="member-name">
                          {member.cpf_user === team.cpf_lider ? (
                            <strong>👑 {member.nome}</strong>
                          ) : (
                            member.nome
                          )}
                        </span>
                        <span className="member-cpf">CPF: {formatCPF(member.cpf_user)}</span>
                      </div>
                      <span className="member-role">{member.funcao}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AllTeamsPage

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User, Time, getTeam, listTeamMembers, listUsers, updateUser } from '../services/api'

interface Toast {
  type: 'success' | 'error'
  message: string
}

const TeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const teamId = Number(id)

  const [team, setTeam] = useState<Time | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [teamData, membersData, allUsersData] = await Promise.all([
        getTeam(teamId),
        listTeamMembers(teamId),
        listUsers(),
      ])
      setTeam(teamData)
      setMembers(membersData)
      setAvailableUsers(allUsersData.filter(u => u.cpf_user !== teamData.cpf_lider && !membersData.some(m => m.cpf_user === u.cpf_user)))
    } catch (err) {
      setToast({ type: 'error', message: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [teamId])

  const handleAddMember = async () => {
    if (!selectedUser) return
    try {
      await updateUser(selectedUser, {
        nome: availableUsers.find(u => u.cpf_user === selectedUser)?.nome || '',
        funcao: availableUsers.find(u => u.cpf_user === selectedUser)?.funcao || '',
        id_time: teamId,
      })
      setToast({ type: 'success', message: 'Membro adicionado ao time' })
      setSelectedUser('')
      loadData()
    } catch (err) {
      setToast({ type: 'error', message: (err as Error).message })
    }
  }

  const handleRemoveMember = async (cpf: string) => {
    if (!confirm('Deseja remover este membro do time?')) return
    try {
      const user = members.find(u => u.cpf_user === cpf)
      if (!user) return
      await updateUser(cpf, {
        nome: user.nome,
        funcao: user.funcao,
        id_time: null,
      })
      setToast({ type: 'success', message: 'Membro removido do time' })
      loadData()
    } catch (err) {
      setToast({ type: 'error', message: (err as Error).message })
    }
  }

  const handleClearToast = () => setToast(null)

  if (!team) {
    return (
      <div className="container error-container">
        <h2>Carregando...</h2>
      </div>
    )
  }

  return (
    <div className="container team-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/teams')}>
          ← Voltar
        </button>
        <div>
          <h1>{team.nome_time}</h1>
          <p>ID: {team.id_time}</p>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`} onClick={handleClearToast}>
          {toast.message}
        </div>
      )}

      <div className="grid-2">
        {/* Informações do Time */}
        <section className="card">
          <h2>Informações do Time</h2>
          <div className="info-block">
            <div className="info-item">
              <label>Líder</label>
              <p className="value">{team.lider_nome || team.cpf_lider}</p>
            </div>
            {team.responsabilidades && (
              <div className="info-item">
                <label>Descrição</label>
                <p className="value">{team.responsabilidades}</p>
              </div>
            )}
            <div className="info-item">
              <label>Total de Membros</label>
              <p className="value">{members.length}</p>
            </div>
          </div>
        </section>

        {/* Adicionar Membro */}
        <section className="card">
          <h2>Adicionar Membro</h2>
          {availableUsers.length === 0 ? (
            <p className="empty-message">Todos os usuários já estão em times ou são líderes</p>
          ) : (
            <div className="form">
              <label>
                Selecione um usuário
                <select
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                >
                  <option value="">-- Selecione --</option>
                  {availableUsers.map(user => (
                    <option key={user.cpf_user} value={user.cpf_user}>
                      {user.nome} ({user.cpf_user})
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="primary"
                onClick={handleAddMember}
                disabled={!selectedUser || loading}
              >
                Adicionar ao Time
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Lista de Membros */}
      <section className="card members-section">
        <h2>Membros do Time ({members.length})</h2>
        {members.length === 0 ? (
          <p className="empty-message">Nenhum membro adicionado ainda</p>
        ) : (
          <div className="members-list">
            {members.map(member => (
              <div key={member.cpf_user} className="member-item">
                <div className="member-info">
                  <h4>{member.nome}</h4>
                  <div className="member-meta">
                    <span className="cpf">CPF: {member.cpf_user}</span>
                    <span className="funcao">{member.funcao}</span>
                    {member.is_lider && <span className="badge-leader">Líder</span>}
                  </div>
                </div>
                {!member.is_lider && (
                  <button
                    className="danger"
                    onClick={() => handleRemoveMember(member.cpf_user)}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default TeamDetailPage

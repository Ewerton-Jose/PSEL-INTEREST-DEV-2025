import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { formatCPF } from '../utils/cpfMask'
import { User, Time, getTeam, listTeamMembers, listUsers, updateUser, updateTime, deleteTime } from '../services/api'

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
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<{ nome_time: string; responsabilidades: string | null; cpf_lider: string } | null>(null)
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

  useEffect(() => {
    if (team) {
      setEditForm({
        nome_time: team.nome_time,
        responsabilidades: team.responsabilidades || '',
        cpf_lider: team.cpf_lider,
      })
    }
  }, [team])

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

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm || !team) return
    setSaving(true)
    try {
      const updated = await updateTime(teamId, {
        nome_time: editForm.nome_time,
        responsabilidades: editForm.responsabilidades || null,
        cpf_lider: editForm.cpf_lider,
      })
      setTeam(updated)
      setToast({ type: 'success', message: 'Time atualizado com sucesso' })
      setEditMode(false)
      loadData()
    } catch (err) {
      setToast({ type: 'error', message: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!confirm('Deseja realmente excluir este time?')) return
    try {
      await deleteTime(teamId)
      setToast({ type: 'success', message: 'Time excluído' })
      navigate('/teams')
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
        <div className="detail-actions">
          <div>
            <h1>{team.nome_time}</h1>
            <p>ID: {team.id_time}</p>
          </div>
          <div className="actions">
            <button className="ghost" onClick={() => setEditMode(prev => !prev)}>
              {editMode ? 'Cancelar edição' : 'Editar time'}
            </button>
            <button className="danger" onClick={handleDeleteTeam}>Excluir time</button>
          </div>
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
          <div className="card-header">
            <h2>Informações do Time</h2>
            <div className="actions">
              <button className="ghost" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Cancelar' : 'Editar'}
              </button>
              <button className="danger" onClick={handleDeleteTeam}>
                Deletar Time
              </button>
            </div>
          </div>
          <div className="info-block">
            <div className="info-item">
              <label>Líder</label>
              <p className="value">{team.lider_nome || formatCPF(team.cpf_lider)}</p>
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

        {/* Editar Time */}
        {editMode && editForm && (
          <section className="card">
            <h2>Editar Time</h2>
            <form className="form" onSubmit={handleUpdateTeam}>
              <label>
                Nome do Time
                <input
                  value={editForm.nome_time}
                  onChange={e => setEditForm(prev => prev ? { ...prev, nome_time: e.target.value } : prev)}
                  required
                />
              </label>
              <label>
                Responsabilidades (opcional)
                <textarea
                  value={editForm.responsabilidades ?? ''}
                  onChange={e => setEditForm(prev => prev ? { ...prev, responsabilidades: e.target.value } : prev)}
                />
              </label>
              <label>
                Líder (CPF)
                <select
                  value={editForm.cpf_lider}
                  onChange={e => setEditForm(prev => prev ? { ...prev, cpf_lider: e.target.value } : prev)}
                  required
                >
                  <option value="">-- Selecione --</option>
                  {members.concat(availableUsers).map(user => (
                    <option key={user.cpf_user} value={user.cpf_user}>
                      {user.nome} ({formatCPF(user.cpf_user)})
                    </option>
                  ))}
                </select>
              </label>
              <div className="actions">
                <button type="button" className="ghost" onClick={() => setEditMode(false)}>Cancelar</button>
                <button type="submit" className="primary" disabled={saving}>Salvar</button>
              </div>
            </form>
          </section>
        )}

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
                  {availableUsers.filter(user => !user.is_lider).map(user => (
                    <option key={user.cpf_user} value={user.cpf_user}>
                      {user.nome} ({formatCPF(user.cpf_user)})
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
        <h2>Membros do Time ({members.length + (members.some(m => m.cpf_user === team?.cpf_lider) ? 0 : 1)})</h2>
        {members.length === 0 ? (
          <p className="empty-message">Apenas o líder no time</p>
        ) : (
          <div className="members-list">
            {members.map(member => (
              <div key={member.cpf_user} className="member-item">
                <div className="member-info">
                  <h4>{member.nome}</h4>
                  <div className="member-meta">
                    <span className="cpf">CPF: {formatCPF(member.cpf_user)}</span>
                    <span className="funcao">{member.funcao}</span>
                    {member.is_lider && <span className="badge-leader">Líder</span>}
                    {member.is_ex_lider && !member.is_lider && (
                      <span className="badge-ex-leader">EX-líder</span>
                    )}
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

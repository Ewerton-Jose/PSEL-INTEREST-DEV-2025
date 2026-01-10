import React, { useEffect, useState } from 'react'
import { TrashIcon, PencilIcon } from '../components/Icons'
import {
  User,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../services/api'

interface Toast {
  type: 'success' | 'error'
  message: string
}

const emptyUser: User = { cpf_user: '', nome: '', funcao: '', id_time: null }

const ManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [userForm, setUserForm] = useState<User>(emptyUser)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await listUsers()
      setUsers(data)
    } catch (err) {
      setToast({ type: 'error', message: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        const updated = await updateUser(editingUser, {
          nome: userForm.nome,
          funcao: userForm.funcao,
          id_time: userForm.id_time,
        })
        setUsers(prev => prev.map(u => (u.cpf_user === editingUser ? updated : u)))
        setToast({ type: 'success', message: 'Usuário atualizado' })
      } else {
        const created = await createUser({
          cpf_user: userForm.cpf_user,
          nome: userForm.nome,
          funcao: userForm.funcao,
          id_time: userForm.id_time,
        })
        setUsers(prev => [...prev, created])
        setToast({ type: 'success', message: 'Usuário criado' })
      }
      setUserForm(emptyUser)
      setEditingUser(null)
      loadUsers()
    } catch (err) {
      setToast({ type: 'error', message: (err as Error).message })
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user.cpf_user)
    setUserForm({ ...user })
  }

  const handleDeleteUser = async (cpf: string) => {
    if (!confirm('Deseja remover este usuário?')) return
    try {
      await deleteUser(cpf)
      setUsers(prev => prev.filter(u => u.cpf_user !== cpf))
      setToast({ type: 'success', message: 'Usuário removido' })
      loadUsers()
    } catch (err) {
      setToast({ type: 'error', message: (err as Error).message })
    }
  }

  const handleClearToast = () => setToast(null)

  return (
    <div className="container manage-page">
      <div className="page-header">
        <h1>Gestão de Usuários</h1>
        <p>Crie, edite e remova usuários do sistema.</p>
        {loading && <span className="badge">Carregando...</span>}
        {toast && (
          <div className={`toast ${toast.type}`} onClick={handleClearToast}>
            {toast.message}
          </div>
        )}
      </div>

      <div className="grid-2">
        <section className="card">
          <header className="card-header">
            <div>
              <h2>{editingUser ? 'Editar usuário' : 'Novo usuário'}</h2>
              <p>CPF é único; opcionalmente associe a um time.</p>
            </div>
            {editingUser && (
              <button className="ghost" onClick={() => { setEditingUser(null); setUserForm(emptyUser) }}>
                Cancelar edição
              </button>
            )}
          </header>

          <form className="form" onSubmit={handleUserSubmit}>
            {!editingUser && (
              <label>
                CPF
                <input
                  value={userForm.cpf_user}
                  onChange={e => setUserForm(prev => ({ ...prev, cpf_user: e.target.value }))}
                  placeholder="00000000000"
                  required
                />
              </label>
            )}
            <label>
              Nome
              <input
                value={userForm.nome}
                onChange={e => setUserForm(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </label>
            <label>
              Função
              <input
                value={userForm.funcao}
                onChange={e => setUserForm(prev => ({ ...prev, funcao: e.target.value }))}
                required
              />
            </label>
            <label>
              Time (ID) opcional
              <input
                type="number"
                value={userForm.id_time ?? ''}
                onChange={e => setUserForm(prev => ({ ...prev, id_time: e.target.value ? Number(e.target.value) : null }))}
                placeholder="ex: 1"
              />
            </label>
            <button type="submit" className="primary" disabled={loading}>
              {editingUser ? 'Salvar alterações' : 'Criar usuário'}
            </button>
          </form>

          <div className="list">
            {users.map(user => (
              <div key={user.cpf_user} className="list-row">
                <div>
                  <strong>{user.nome}</strong>
                  <div className="muted">CPF: {user.cpf_user} · {user.funcao}</div>
                  <div className="muted">Time: {user.nome_time || '—'} {user.is_lider ? '(Líder)' : ''}</div>
                </div>
                <div className="actions">
                  <button aria-label="Editar" title="Editar" onClick={() => handleEditUser(user)}>
                    <PencilIcon />
                  </button>
                  <button className="danger" aria-label="Excluir" title="Excluir" onClick={() => handleDeleteUser(user.cpf_user)}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card info-card-sidebar">
          <h3>📌 Informações</h3>
          <ul>
            <li>CPF deve ser único</li>
            <li>Função é obrigatória</li>
            <li>Usuário pode estar em um time</li>
            <li>Líderes não podem ser removidos</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default ManagementPage


import React, { useState } from 'react'
import { createTime, Time, listUsers, User } from '../services/api'
import { formatCPF } from '../utils/cpfMask'
import { useEffect } from 'react'

interface Toast {
  type: 'success' | 'error'
  message: string
}

const TeamCreatePage: React.FC = () => {
  const [form, setForm] = useState<{ nome_time: string; responsabilidades?: string | null; cpf_lider: string }>(
    { nome_time: '', responsabilidades: '', cpf_lider: '' }
  )
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listUsers()
        setUsers(data)
      } catch (err) {
        // silently ignore for now
      }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome_time || !form.cpf_lider) {
      setToast({ type: 'error', message: 'Nome do time e CPF do líder são obrigatórios.' })
      return
    }
    if (form.cpf_lider.length !== 11) {
      setToast({ type: 'error', message: 'CPF do líder deve ter exatamente 11 dígitos.' })
      return
    }
    setLoading(true)
    try {
      const payload: Omit<Time, 'id_time'> = {
        nome_time: form.nome_time,
        responsabilidades: form.responsabilidades || null,
        cpf_lider: form.cpf_lider,
        lider_nome: undefined,
        total_membros: undefined,
      }
      await createTime(payload)
      setToast({ type: 'success', message: 'Time criado com sucesso!' })
      setForm({ nome_time: '', responsabilidades: '', cpf_lider: '' })
    } catch (err) {
      setToast({ type: 'error', message: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Criação de Time</h1>
        <p>Defina o nome, líder e responsabilidades do time.</p>
        {toast && (
          <div className={`toast ${toast.type}`} onClick={() => setToast(null)}>
            {toast.message}
          </div>
        )}
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Nome do Time
          <input
            value={form.nome_time}
            onChange={e => setForm(prev => ({ ...prev, nome_time: e.target.value }))}
            required
          />
        </label>
        <label>
          Responsabilidades (opcional)
          <textarea
            value={form.responsabilidades ?? ''}
            onChange={e => setForm(prev => ({ ...prev, responsabilidades: e.target.value }))}
          />
        </label>
        <label>
          Líder (CPF)
          <select
            value={form.cpf_lider}
            onChange={e => setForm(prev => ({ ...prev, cpf_lider: e.target.value }))}
            required
          >
            <option value="">-- Selecione --</option>
            {users.map(u => (
              <option key={u.cpf_user} value={u.cpf_user}>
                {u.nome} ({formatCPF(u.cpf_user)})
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="primary" disabled={loading}>Criar time</button>
      </form>
    </div>
  )
}

export default TeamCreatePage

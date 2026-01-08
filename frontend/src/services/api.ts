const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000"
const API_PREFIX = "/api/v1"

export interface User {
  cpf_user: string
  nome: string
  funcao: string
  id_time: number | null
  nome_time?: string | null
  is_lider?: boolean
}

export interface Time {
  id_time: number
  nome_time: string
  responsabilidades?: string | null
  cpf_lider: string
  lider_nome?: string | null
  total_membros?: number
}

const jsonHeaders = { "Content-Type": "application/json" }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, options)
  if (!res.ok) {
    const text = await res.text()
    const detail = (() => {
      try {
        const parsed = JSON.parse(text)
        return parsed.detail || parsed.message || text
      } catch {
        return text
      }
    })()
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail))
  }
  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

// Users
export const listUsers = () => request<User[]>("/users/")
export const createUser = (payload: Partial<User> & { cpf_user: string; nome: string; funcao: string }) =>
  request<User>("/users/", { method: "POST", headers: jsonHeaders, body: JSON.stringify(payload) })
export const updateUser = (cpf: string, payload: Partial<User> & { nome: string; funcao: string }) =>
  request<User>(`/users/${cpf}`, { method: "PUT", headers: jsonHeaders, body: JSON.stringify(payload) })
export const deleteUser = (cpf: string) => request<void>(`/users/${cpf}`, { method: "DELETE" })

// Times
export const listTimes = () => request<Time[]>("/times/")
export const getTeam = (id: number) => request<Time>(`/times/${id}`)
export const listTeamMembers = (id: number) => request<User[]>(`/times/${id}/membros`)
export const createTime = (payload: Time) =>
  request<Time>("/times/", { method: "POST", headers: jsonHeaders, body: JSON.stringify(payload) })
export const updateTime = (id: number, payload: Omit<Time, "id_time">) =>
  request<Time>(`/times/${id}`, { method: "PUT", headers: jsonHeaders, body: JSON.stringify(payload) })
export const deleteTime = (id: number) => request<void>(`/times/${id}`, { method: "DELETE" })



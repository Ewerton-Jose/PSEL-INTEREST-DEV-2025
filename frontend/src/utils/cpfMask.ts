/**
 * Formata um CPF com máscara XXX.XXX.XXX-XX
 */
export const formatCPF = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11)
  
  // Aplica a máscara
  if (limited.length === 0) return ''
  if (limited.length <= 3) return limited
  if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`
  if (limited.length <= 9) return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`
  return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`
}

/**
 * Remove a máscara do CPF, retornando apenas os dígitos
 */
export const removeCPFMask = (value: string): string => {
  return value.replace(/\D/g, '')
}

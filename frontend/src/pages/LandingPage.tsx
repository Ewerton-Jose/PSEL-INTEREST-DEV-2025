import React from 'react'
import { useNavigate } from 'react-router-dom'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  const actions = [
    {
      id: 'register-person',
      title: 'Registrar Pessoa',
      icon: '👤',
      description: 'Crie um novo usuário no sistema',
      action: () => navigate('/manage'),
    },
    {
      id: 'register-team',
      title: 'Criar Equipe',
      icon: '🏢',
      description: 'Configure um novo time',
      action: () => navigate('/teams'),
    },
    {
      id: 'team-details',
      title: 'Detalhes de Equipe',
      icon: '📊',
      description: 'Visualize times e membros',
      action: () => navigate('/teams'),
    },
    {
      id: 'analytics',
      title: 'Gerenciar',
      icon: '⚙️',
      description: 'Gerencie usuários e equipes',
      action: () => navigate('/manage'),
    },
  ]

  return (
    <div className="landing-page container">
      <div className="hero-section">
        <h1 className="hero-title">
          <span className="glitch" data-text="Gestão de Equipes">
            Gestão de Equipes
          </span>
        </h1>
        <p className="hero-subtitle">
          Gerencie usuários, times e membros com facilidade
        </p>
      </div>

      <div className="actions-grid">
        {actions.map(action => (
          <div
            key={action.id}
            className="action-card"
            onClick={action.action}
          >
            <div className="action-icon">{action.icon}</div>
            <h3 className="action-title">{action.title}</h3>
            <p className="action-description">{action.description}</p>
            <div className="action-cta">Acessar →</div>
          </div>
        ))}
      </div>

      <div className="info-section">
        <div className="info-card">
          <h4>💡 Dicas</h4>
          <ul>
            <li>Todo time necessita de um líder</li>
            <li>Cada usuário pode pertencer a apenas um time</li>
            <li>Não é possível remover um líder ativo</li>
            <li>Use o menu lateral para navegar entre times</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default LandingPage


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QuestProvider } from './hooks/useQuestContext'
import MainLayout from './layouts/MainLayout'
import LandingPage from './pages/LandingPage'
import QuestPage from './pages/QuestPage'
import ManagementPage from './pages/ManagementPage'
import TeamsPage from './pages/TeamsPage'
import TeamDetailPage from './pages/TeamDetailPage'
import TeamCreatePage from './pages/TeamCreatePage'
import './App.css'

function App() {
  return (
    <QuestProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="quest/:id" element={<QuestPage />} />
            <Route path="manage" element={<ManagementPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="teams/new" element={<TeamCreatePage />} />
            <Route path="team/:id" element={<TeamDetailPage />} />
          </Route>
        </Routes>
      </Router>
    </QuestProvider>
  )
}

export default App

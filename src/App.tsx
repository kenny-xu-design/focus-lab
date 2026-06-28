import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import GamePlayPage from './pages/GamePlayPage'
import GamesPage from './pages/GamesPage'
import HomePage from './pages/HomePage'
import LauncherPage from './pages/LauncherPage'
import MethodDetailPage from './pages/MethodDetailPage'
import MethodsPage from './pages/MethodsPage'
import PopupPage from './pages/PopupPage'
import RecordsPage from './pages/RecordsPage'
import TrainingPage from './pages/TrainingPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/popup" element={<PopupPage />} />
        <Route path="/launcher" element={<LauncherPage />} />
        <Route path="/methods" element={<MethodsPage />} />
        <Route path="/methods/:id" element={<MethodDetailPage />} />
        <Route path="/training/:id" element={<TrainingPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/:id" element={<GamePlayPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

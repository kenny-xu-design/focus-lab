import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DesktopTaskPage from './pages/DesktopTaskPage'
import GamePlayPage from './pages/GamePlayPage'
import GamesPage from './pages/GamesPage'
import HomePage from './pages/HomePage'
import LauncherPage from './pages/LauncherPage'
import MethodDetailPage from './pages/MethodDetailPage'
import MethodsPage from './pages/MethodsPage'
import PopupPage from './pages/PopupPage'
import RecordsPage from './pages/RecordsPage'
import TrainingPage from './pages/TrainingPage'
import LearningExtensionPage from './pages/LearningExtensionPage'

function isTauriRuntime() {
  return typeof window !== 'undefined' && ('__TAURI__' in window || '__TAURI_INTERNALS__' in window)
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={isTauriRuntime() ? <DesktopTaskPage /> : <HomePage />} />
        <Route path="/desktop" element={<DesktopTaskPage />} />
        <Route path="/popup" element={<PopupPage />} />
        <Route path="/launcher" element={<LauncherPage />} />
        <Route path="/methods" element={<MethodsPage />} />
        <Route path="/methods/:id" element={<MethodDetailPage />} />
        <Route path="/learn/:id" element={<LearningExtensionPage />} />
        <Route path="/training/:id" element={<TrainingPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/:id" element={<GamePlayPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

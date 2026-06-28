import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import ColorConflict from '../components/ColorConflict'
import FocusArrow from '../components/FocusArrow'
import ImpulseBrake from '../components/ImpulseBrake'
import SymbolHunter from '../components/SymbolHunter'
import { gameCategoryLabels, getGameById } from '../data/games'

export default function GamePlayPage() {
  const { id } = useParams()
  const game = id ? getGameById(id) : undefined

  if (!game) return <Navigate to="/games" replace />

  const renderGame = () => {
    switch (game.gameType) {
      case 'symbolHunter':
        return <SymbolHunter game={game} />
      case 'colorConflict':
        return <ColorConflict game={game} />
      case 'focusArrow':
        return <FocusArrow game={game} />
      case 'impulseBrake':
        return <ImpulseBrake game={game} />
      default:
        return null
    }
  }

  return (
    <div className="page-stack">
      <Link className="text-link" to="/games">
        <ArrowLeft size={18} aria-hidden="true" />
        返回小游戏
      </Link>
      <section className="page-header training-header">
        <span className="eyebrow">{gameCategoryLabels[game.category]}</span>
        <h1>{game.name}</h1>
        <p>{game.description}</p>
      </section>
      {renderGame()}
    </div>
  )
}

import { Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { gameCategoryLabels, gameDifficultyLabels } from '../data/games'
import type { AttentionGame } from '../types/training'

type GameCardProps = {
  game: AttentionGame
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <article className="method-card glass-card">
      <div className="card-kicker">
        <span>{gameCategoryLabels[game.category]}</span>
        <span>{gameDifficultyLabels[game.difficulty]}</span>
      </div>
      <h3>{game.name}</h3>
      <p>{game.goal}</p>
      <dl className="method-meta">
        <div>
          <dt>训练时长</dt>
          <dd>{game.duration}</dd>
        </div>
        <div>
          <dt>记录指标</dt>
          <dd>{game.metrics.join('、')}</dd>
        </div>
      </dl>
      <Link className="button compact" to={`/games/${game.id}`}>
        <Play size={16} aria-hidden="true" />
        开始小游戏
      </Link>
    </article>
  )
}

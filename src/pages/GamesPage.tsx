import GameCard from '../components/GameCard'
import { games } from '../data/games'

export default function GamesPage() {
  return (
    <div className="page-stack">
      <section className="page-header">
        <span className="eyebrow">注意力小游戏</span>
        <h1>4 个短时注意力反馈工具</h1>
        <p>小游戏只作为专注热身与注意力反馈，不替代核心任务。建议每次选择一个，完成后回到学习、写作或设计任务。</p>
      </section>
      <section className="method-grid">
        {games.map((game) => (
          <GameCard game={game} key={game.id} />
        ))}
      </section>
    </div>
  )
}

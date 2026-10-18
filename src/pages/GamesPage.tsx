import GameCard from '../components/GameCard'
import { games } from '../data/games'
import { Link } from 'react-router-dom'
import { learningExtensions } from '../data/learningExtensions'

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
      <section aria-label="记忆实践">
        <div className="section-heading"><span className="eyebrow">记忆实践</span><h2>学会方法，再动手试</h2><p>只为需要作答和反馈的方法提供练习，其余保留为指南。</p></div>
        <div className="method-grid">{learningExtensions.filter((method) => method.practice).map((method) => <article className="glass-card extension-card" key={method.id}><h3>{method.name}</h3><p>{method.subtitle}</p><Link className="button" to={`/learn/${method.id}#practice`}>进入练习</Link></article>)}</div>
      </section>
    </div>
  )
}

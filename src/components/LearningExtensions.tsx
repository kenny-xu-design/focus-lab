import { Link } from 'react-router-dom'
import { learningExtensions } from '../data/learningExtensions'

export default function LearningExtensions() {
  return (
    <section id="learning-extensions" className="learning-extensions" aria-label="学习与记忆拓展方法">
      <div className="section-heading"><span className="eyebrow">拓展方法</span><h2>把练习带回真实学习</h2><p>先理解方法，再按需要动手。原有核心训练与小游戏继续保留。</p></div>
      <div className="method-grid">{learningExtensions.map((method) => <article key={method.id} className="glass-card extension-card">
        <span className="eyebrow">{method.kind}</span><h3>{method.name}</h3><p>{method.subtitle}</p><Link className="button ghost compact" to={`/learn/${method.id}`}>{method.practice ? '了解并实践' : '查看方法'}</Link>
      </article>)}</div>
    </section>
  )
}

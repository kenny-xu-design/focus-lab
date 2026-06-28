import { ArrowLeft, Play } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { categoryLabels, difficultyLabels, getMethodById } from '../data/methods'

export default function MethodDetailPage() {
  const { id } = useParams()
  const method = id ? getMethodById(id) : undefined

  if (!method) return <Navigate to="/methods" replace />

  return (
    <div className="page-stack">
      <Link className="text-link" to="/methods">
        <ArrowLeft size={18} aria-hidden="true" />
        返回核心训练
      </Link>
      <section className="detail-hero glass-card">
        <span className="eyebrow">
          {categoryLabels[method.category]} · {difficultyLabels[method.difficulty]} · {method.duration}
        </span>
        <h1>{method.name}</h1>
        <p>{method.description}</p>
        <Link className="button" to={`/training/${method.id}`}>
          <Play size={18} aria-hidden="true" />
          开始训练
        </Link>
      </section>

      <section className="detail-grid">
        <article className="glass-card detail-card">
          <h2>适合人群</h2>
          <ul>{method.targetUsers.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="glass-card detail-card">
          <h2>训练目标</h2>
          <p>{method.goal}</p>
        </article>
        <article className="glass-card detail-card">
          <h2>推荐时长</h2>
          <p>{method.duration}</p>
        </article>
        <article className="glass-card detail-card wide">
          <h2>训练步骤</h2>
          <ol>{method.steps.map((item) => <li key={item}>{item}</li>)}</ol>
        </article>
        <article className="glass-card detail-card">
          <h2>进阶方式</h2>
          <ul>{method.advancedTips.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="glass-card detail-card">
          <h2>注意事项</h2>
          <ul>{method.notices.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </section>
    </div>
  )
}

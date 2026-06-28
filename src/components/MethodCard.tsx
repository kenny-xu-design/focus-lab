import { ArrowRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryLabels, difficultyLabels } from '../data/methods'
import type { TrainingMethod } from '../types/training'

type MethodCardProps = {
  method: TrainingMethod
}

export default function MethodCard({ method }: MethodCardProps) {
  return (
    <article className="method-card glass-card">
      <div className="card-kicker">
        <span>{categoryLabels[method.category]}</span>
        <span>{difficultyLabels[method.difficulty]}</span>
      </div>
      <h3>{method.name}</h3>
      <p>{method.goal}</p>
      <dl className="method-meta">
        <div>
          <dt>单次耗时</dt>
          <dd>{method.duration}</dd>
        </div>
        <div>
          <dt>适合场景</dt>
          <dd>{method.scene}</dd>
        </div>
      </dl>
      <div className="card-actions">
        <Link className="button ghost compact" to={`/methods/${method.id}`}>
          查看详情
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link className="button compact" to={`/training/${method.id}`}>
          <Play size={16} aria-hidden="true" />
          开始训练
        </Link>
      </div>
    </article>
  )
}

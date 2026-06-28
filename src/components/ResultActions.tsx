import { RotateCcw, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

type ResultActionsProps = {
  onRestart: () => void
}

export default function ResultActions({ onRestart }: ResultActionsProps) {
  return (
    <div className="tool-actions">
      <button className="button" type="button" onClick={onRestart}>
        <RotateCcw size={18} aria-hidden="true" />
        再来一次
      </button>
      <Link className="button ghost" to="/records">
        <BarChart3 size={18} aria-hidden="true" />
        查看记录
      </Link>
    </div>
  )
}

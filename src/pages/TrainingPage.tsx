import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import BreathingTraining from '../components/BreathingTraining'
import DistractionLogger from '../components/DistractionLogger'
import ImplementationPlanTool from '../components/ImplementationPlanTool'
import NumberPathMemory from '../components/NumberPathMemory'
import PomodoroTimer from '../components/PomodoroTimer'
import StartupTraining from '../components/StartupTraining'
import { categoryLabels, getMethodById } from '../data/methods'

export default function TrainingPage() {
  const { id } = useParams()
  const method = id ? getMethodById(id) : undefined

  if (!method) return <Navigate to="/methods" replace />

  const renderTool = () => {
    switch (method.toolType) {
      case 'numberPathMemory':
        return <NumberPathMemory method={method} />
      case 'pomodoro':
        return <PomodoroTimer method={method} />
      case 'startup':
        return <StartupTraining method={method} />
      case 'distraction':
        return <DistractionLogger method={method} />
      case 'breathing':
        return <BreathingTraining method={method} />
      case 'implementationPlan':
        return <ImplementationPlanTool method={method} />
      default:
        return null
    }
  }

  return (
    <div className="page-stack">
      <Link className="text-link" to="/methods">
        <ArrowLeft size={18} aria-hidden="true" />
        返回核心训练
      </Link>
      <section className="page-header training-header">
        <span className="eyebrow">{categoryLabels[method.category]}</span>
        <h1>{method.name}</h1>
        <p>{method.description}</p>
      </section>
      {renderTool()}
    </div>
  )
}

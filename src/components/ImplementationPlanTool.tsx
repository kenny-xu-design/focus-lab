import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import type { TrainingMethod } from '../types/training'

type ImplementationPlanToolProps = {
  method: TrainingMethod
}

const examples = [
  '如果我想刷手机，那么我先完成 5 分钟当前任务。',
  '如果我开始拖延，那么我先打开文件并写下第一句话。',
  '如果我想换任务，那么我先把当前分心点记下来。',
]

export default function ImplementationPlanTool({ method }: ImplementationPlanToolProps) {
  const plans = useTrainingStore((state) => state.plans)
  const addPlan = useTrainingStore((state) => state.addPlan)
  const deletePlan = useTrainingStore((state) => state.deletePlan)
  const [situation, setSituation] = useState('')
  const [action, setAction] = useState('')

  const save = () => {
    if (!situation.trim() || !action.trim()) return
    addPlan({
      id: crypto.randomUUID(),
      situation: situation.trim(),
      action: action.trim(),
      createdAt: new Date().toISOString(),
    })
    setSituation('')
    setAction('')
  }

  return (
    <section className="training-tool startup-tool">
      <div className="completion-panel glass-card">
        <h3>{method.name}</h3>
        <p>把高频阻碍提前写成明确的情境和行动，减少临场犹豫。计划保存在本地浏览器。</p>
        <label className="field-label" htmlFor="plan-situation">如果我遇到什么情境</label>
        <input id="plan-situation" className="text-input" value={situation} onChange={(event) => setSituation(event.target.value)} placeholder="例如：我想刷手机" />
        <label className="field-label" htmlFor="plan-action">那么我就执行什么行动</label>
        <input id="plan-action" className="text-input" value={action} onChange={(event) => setAction(event.target.value)} placeholder="例如：先完成 5 分钟当前任务" />
        <button className="button" type="button" onClick={save}>
          <Plus size={18} aria-hidden="true" />
          保存计划
        </button>
      </div>

      <div className="glass-card detail-card">
        <h3>示例</h3>
        <ul>{examples.map((example) => <li key={example}>{example}</li>)}</ul>
      </div>

      <div className="record-list">
        {plans.length === 0 ? (
          <div className="glass-card empty-state">
            <h3>还没有计划</h3>
            <p>先创建一个常见情境和对应行动，之后可以在记录页查看。</p>
          </div>
        ) : (
          plans.map((plan) => (
            <article className="glass-card record-item" key={plan.id}>
              <div>
                <strong>如果 {plan.situation}</strong>
                <button className="icon-button" type="button" onClick={() => deletePlan(plan.id)} aria-label="删除计划">
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
              <p>那么我就 {plan.action}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

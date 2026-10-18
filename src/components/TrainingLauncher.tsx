import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ListChecks,
  Play,
  Radar,
  ShieldCheck,
  TimerReset,
  Wind,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryLabels, methods } from '../data/methods'
import { useTrainingStore } from '../store/useTrainingStore'
import type { TrainingMethod } from '../types/training'
import { dateKey } from '../utils/date'

const launcherIcons = {
  'number-path-memory': Radar,
  'pomodoro-focus': TimerReset,
  'five-minute-startup': Play,
  'distraction-log': ShieldCheck,
  'breathing-count': Wind,
  'implementation-plan': ListChecks,
} as const

function isCompletedToday(method: TrainingMethod, records: ReturnType<typeof useTrainingStore.getState>['records']) {
  const today = dateKey(new Date())
  return records.some((record) => record.methodId === method.id && dateKey(record.date) === today)
}

export default function TrainingLauncher() {
  const records = useTrainingStore((state) => state.records)
  const todayCount = records.filter((record) => dateKey(record.date) === dateKey(new Date())).length

  return (
    <section className="launcher-window glass-card" aria-label="Focus Lab 训练启动器">
      <div className="launcher-titlebar">
        <div className="window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <strong>Focus Lab Launcher</strong>
        <span>今日已完成 {todayCount} 次</span>
      </div>

      <div className="launcher-hero">
        <div>
          <span className="eyebrow">手机与电脑通用</span>
          <h2>选择一个训练，直接进入状态</h2>
          <p>覆盖 6 个核心训练：空间记忆、专注计时、任务启动、分心记录、呼吸稳定和执行计划。</p>
        </div>
        <Link className="button ghost compact" to="/records">
          查看记录
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="launcher-grid">
        {methods.map((method) => {
          const Icon = launcherIcons[method.id as keyof typeof launcherIcons] ?? Clock3
          const completed = isCompletedToday(method, records)
          return (
            <article className="launcher-card" key={method.id}>
              <div className="launcher-card-top">
                <span className="launcher-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                {completed && (
                  <span className="completed-pill">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    今日已练
                  </span>
                )}
              </div>
              <span className="eyebrow">{categoryLabels[method.category]} · {method.duration}</span>
              <h3>{method.name}</h3>
              <p>{method.goal}</p>
              <div className="card-actions">
                <Link className="button compact" to={`/training/${method.id}`}>
                  <Play size={16} aria-hidden="true" />
                  启动
                </Link>
                <Link className="button ghost compact" to={`/methods/${method.id}`}>
                  详情
                </Link>
              </div>
            </article>
          )
        })}
      </div>

      <div className="launcher-footer">
        <span>建议：训练前先选一个最小入口，不需要一次做完全部训练。</span>
      </div>
    </section>
  )
}

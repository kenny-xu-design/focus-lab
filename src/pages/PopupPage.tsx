import { BarChart3, Clock3, ExternalLink, ListChecks, Play, Radar, ShieldCheck, TimerReset, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryLabels, methods } from '../data/methods'
import { useTrainingStore } from '../store/useTrainingStore'
import { dateKey, formatDateTime } from '../utils/date'
import PwaInstallButton from '../components/PwaInstallButton'

const popupIcons = {
  'number-path-memory': Radar,
  'pomodoro-focus': TimerReset,
  'five-minute-startup': Play,
  'distraction-log': ShieldCheck,
  'breathing-count': Wind,
  'implementation-plan': ListChecks,
} as const

export default function PopupPage() {
  const records = useTrainingStore((state) => state.records)
  const layoutSnapshots = useTrainingStore((state) => state.layoutSnapshots)
  const today = dateKey(new Date())
  const todayCount = records.filter((record) => dateKey(record.date) === today).length
  const latestLayout = layoutSnapshots[0]

  return (
    <main className="popup-shell">
      <section className="popup-panel glass-card">
        <header className="popup-header">
          <div>
            <span className="eyebrow">Focus Lab Popup</span>
            <h1>专注启动</h1>
          </div>
          <div className="popup-count">
            <strong>{todayCount}</strong>
            <span>今日</span>
          </div>
        </header>

        <div className="popup-training-list" aria-label="六个核心训练">
          {methods.map((method) => {
            const Icon = popupIcons[method.id as keyof typeof popupIcons] ?? Clock3
            return (
              <Link className="popup-training-item" key={method.id} to={`/training/${method.id}`}>
                <span className="launcher-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong>{method.name}</strong>
                  <small>{categoryLabels[method.category]} · {method.duration}</small>
                </span>
                <ExternalLink size={16} aria-hidden="true" />
              </Link>
            )
          })}
        </div>

        {latestLayout && (
          <section className="popup-layout glass-card">
            <div>
              <span className="eyebrow">最近布局</span>
              <strong>{latestLayout.label}</strong>
              <small>{formatDateTime(latestLayout.createdAt)}</small>
            </div>
            <Link className="button compact" to={`/training/number-path-memory?layoutId=${latestLayout.id}`}>
              回退训练
            </Link>
          </section>
        )}

        <footer className="popup-footer">
          <PwaInstallButton />
          <Link className="button ghost compact" to="/launcher">
            完整启动器
          </Link>
          <Link className="button ghost compact" to="/records">
            <BarChart3 size={16} aria-hidden="true" />
            记录
          </Link>
        </footer>
      </section>
    </main>
  )
}

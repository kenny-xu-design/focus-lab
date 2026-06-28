import type { GameRecord, TrainingRecord } from '../types/training'
import { getRecentSevenDays, getStreakDays, getTodayCount } from '../utils/date'

type RecordSummaryProps = {
  records: TrainingRecord[]
  gameRecords: GameRecord[]
}

export default function RecordSummary({ records, gameRecords }: RecordSummaryProps) {
  const allRecords = [...records, ...gameRecords]
  const recentDays = getRecentSevenDays(allRecords)
  const maxCount = Math.max(1, ...recentDays.map((day) => day.count))

  return (
    <>
      <section className="summary-grid">
        <div className="glass-card stat-card">
          <span>今日训练</span>
          <strong>{getTodayCount(allRecords)}</strong>
        </div>
        <div className="glass-card stat-card">
          <span>累计训练</span>
          <strong>{allRecords.length}</strong>
        </div>
        <div className="glass-card stat-card">
          <span>连续天数</span>
          <strong>{getStreakDays(allRecords)}</strong>
        </div>
      </section>
      <section className="glass-card chart-card">
        <h2>最近 7 天记录</h2>
        <div className="bar-chart" aria-label="最近7天训练记录">
          {recentDays.map((day) => (
            <div className="bar-item" key={day.day}>
              <span className="bar-value">{day.count}</span>
              <span className="bar" style={{ height: `${Math.max(8, (day.count / maxCount) * 100)}%` }} />
              <span>{day.day}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

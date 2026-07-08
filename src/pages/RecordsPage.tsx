import { RotateCcw, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import RecordSummary from '../components/RecordSummary'
import { useTrainingStore } from '../store/useTrainingStore'
import type { TrainingRecord } from '../types/training'
import { formatDateTime, formatDuration } from '../utils/date'

type DistractionMarkRecord = {
  elapsedSeconds: number
  segmentLabel: string
}

const isDistractionMarkRecord = (value: unknown): value is DistractionMarkRecord => {
  if (!value || typeof value !== 'object') return false

  const mark = value as Partial<DistractionMarkRecord>
  return typeof mark.elapsedSeconds === 'number' && typeof mark.segmentLabel === 'string'
}

const getDistractionMarks = (extra: TrainingRecord['extra']) => {
  const marks = extra?.distractionMarks
  return Array.isArray(marks) ? marks.filter(isDistractionMarkRecord) : []
}

export default function RecordsPage() {
  const records = useTrainingStore((state) => state.records)
  const gameRecords = useTrainingStore((state) => state.gameRecords)
  const plans = useTrainingStore((state) => state.plans)
  const layoutSnapshots = useTrainingStore((state) => state.layoutSnapshots)
  const clearRecords = useTrainingStore((state) => state.clearRecords)
  const deleteLayoutSnapshot = useTrainingStore((state) => state.deleteLayoutSnapshot)
  const hasRecords = records.length > 0 || gameRecords.length > 0

  const handleClear = () => {
    const first = window.confirm('确定要清空所有训练和小游戏记录吗？数字布局记录和计划不会被删除。')
    if (!first) return
    const second = window.confirm('请再次确认：清空后无法恢复。')
    if (second) clearRecords()
  }

  return (
    <div className="page-stack">
      <section className="page-header records-header">
        <span className="eyebrow">训练记录</span>
        <h1>观察专注训练和注意力反馈</h1>
        <p>记录保存在当前浏览器的 localStorage 中。数字路径记忆会保留“开始挑战”时的数字布局，之后可以用同一布局回退训练。</p>
      </section>

      {!hasRecords ? (
        <section className="glass-card empty-state">
          <h2>还没有训练完成记录</h2>
          <p>完成一次核心训练或注意力小游戏后，这里会显示本地记录。点击数字路径的“开始挑战”后，也会在下方保存布局记录。</p>
        </section>
      ) : (
        <>
          <RecordSummary records={records} gameRecords={gameRecords} />
          <div className="record-toolbar">
            <h2>记录明细</h2>
            <button className="button danger" type="button" onClick={handleClear}>
              <Trash2 size={18} aria-hidden="true" />
              清空完成记录
            </button>
          </div>
        </>
      )}

      <section className="record-section">
        <h2>数字布局记录</h2>
        {layoutSnapshots.length === 0 ? (
          <div className="glass-card empty-state">
            <p>暂无数字布局记录。进入 25 数字路径记忆并点击“开始挑战”后，会保存当时的 5×5 数字布局。</p>
          </div>
        ) : (
          <div className="record-list">
            {layoutSnapshots.map((snapshot) => (
              <article className="glass-card record-item" key={snapshot.id}>
                <div>
                  <strong>{snapshot.label}</strong>
                  <span>{formatDateTime(snapshot.createdAt)}</span>
                </div>
                <div className="layout-record-body">
                  <div className="layout-preview" aria-label={`${snapshot.label} 数字布局`}>
                    {snapshot.numbers.map((number) => (
                      <span key={`${snapshot.id}-${number}`}>{number}</span>
                    ))}
                  </div>
                  <div className="layout-record-actions">
                    <Link className="button compact" to={`/training/number-path-memory?layoutId=${snapshot.id}`}>
                      <RotateCcw size={16} aria-hidden="true" />
                      用此布局训练
                    </Link>
                    <button className="button ghost compact" type="button" onClick={() => deleteLayoutSnapshot(snapshot.id)}>
                      删除
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="record-section">
        <h2>核心训练记录</h2>
        {records.length === 0 ? (
          <div className="glass-card empty-state">
            <p>暂无核心训练记录。</p>
          </div>
        ) : (
          <div className="record-list">
            {records.map((record) => {
              const distractionMarks = getDistractionMarks(record.extra)

              return (
                <article className="glass-card record-item" key={record.id}>
                  <div>
                    <strong>{record.methodName}</strong>
                    <span>{formatDateTime(record.date)}</span>
                  </div>
                  <dl>
                  <div>
                    <dt>用时</dt>
                    <dd>{formatDuration(record.durationSeconds)}</dd>
                  </div>
                  {record.errors !== undefined && (
                    <div>
                      <dt>错误数</dt>
                      <dd>{record.errors}</dd>
                    </div>
                  )}
                  {record.mindWanderingCount !== undefined && (
                    <div>
                      <dt>走神次数</dt>
                      <dd>{record.mindWanderingCount}</dd>
                    </div>
                  )}
                  {record.distractionCount !== undefined && (
                    <div>
                      <dt>分心次数</dt>
                      <dd>{record.distractionCount}</dd>
                    </div>
                  )}
                  {record.taskName && (
                    <div>
                      <dt>任务</dt>
                      <dd>{record.taskName}</dd>
                    </div>
                  )}
                  {record.result && (
                    <div>
                      <dt>结果</dt>
                      <dd>{record.result}</dd>
                    </div>
                  )}
                  {record.note && (
                    <div>
                      <dt>备注</dt>
                      <dd>{record.note}</dd>
                    </div>
                  )}
                  </dl>
                  {distractionMarks.length > 0 && (
                    <ul className="result-list">
                      {distractionMarks.map((mark, index) => (
                        <li key={`${record.id}-${index}-${mark.elapsedSeconds}`}>
                          <span>第 {index + 1} 次分心</span>
                          <strong>
                            {mark.segmentLabel} · {formatDuration(mark.elapsedSeconds)}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="record-section">
        <h2>注意力小游戏记录</h2>
        {gameRecords.length === 0 ? (
          <div className="glass-card empty-state">
            <p>暂无小游戏记录。</p>
          </div>
        ) : (
          <div className="record-list">
            {gameRecords.map((record) => (
              <article className="glass-card record-item" key={record.id}>
                <div>
                  <strong>{record.gameName}</strong>
                  <span>{formatDateTime(record.date)}</span>
                </div>
                <dl>
                  {record.correctCount !== undefined && (
                    <div>
                      <dt>正确数</dt>
                      <dd>{record.correctCount}</dd>
                    </div>
                  )}
                  {record.errorCount !== undefined && (
                    <div>
                      <dt>错误数</dt>
                      <dd>{record.errorCount}</dd>
                    </div>
                  )}
                  {record.missedCount !== undefined && (
                    <div>
                      <dt>漏点数</dt>
                      <dd>{record.missedCount}</dd>
                    </div>
                  )}
                  {record.accuracy !== undefined && (
                    <div>
                      <dt>准确率</dt>
                      <dd>{record.accuracy}%</dd>
                    </div>
                  )}
                  {record.averageReactionTime !== undefined && (
                    <div>
                      <dt>平均反应时</dt>
                      <dd>{record.averageReactionTime}ms</dd>
                    </div>
                  )}
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="record-section">
        <h2>如果—那么计划</h2>
        {plans.length === 0 ? (
          <div className="glass-card empty-state">
            <p>暂无计划。可以在“如果—那么计划”训练中创建。</p>
          </div>
        ) : (
          <div className="record-list">
            {plans.map((plan) => (
              <article className="glass-card record-item" key={plan.id}>
                <div>
                  <strong>如果 {plan.situation}</strong>
                  <span>{formatDateTime(plan.createdAt)}</span>
                </div>
                <p>那么我就 {plan.action}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

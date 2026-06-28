import { Play, RotateCcw, Square } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import type { TrainingMethod } from '../types/training'
import { formatDuration } from '../utils/date'
import ResultActions from './ResultActions'

type DistractionLoggerProps = {
  method: TrainingMethod
}

const durationOptions = [10 * 60, 25 * 60]
const distractionTypes = ['想刷手机', '想查资料', '想换任务', '想吃东西', '其他']

export default function DistractionLogger({ method }: DistractionLoggerProps) {
  const addRecord = useTrainingStore((state) => state.addRecord)
  const [duration, setDuration] = useState(25 * 60)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [types, setTypes] = useState<Record<string, number>>({})
  const total = useMemo(() => Object.values(types).reduce((sum, count) => sum + count, 0), [types])

  const finish = () => {
    if (finished) return
    setFinished(true)
    setRunning(false)
    addRecord({
      id: crypto.randomUUID(),
      type: 'training',
      methodId: method.id,
      methodName: method.name,
      date: new Date().toISOString(),
      durationSeconds: Math.max(1, duration - remaining),
      distractionCount: total,
      distractionTypes: types,
    })
  }

  useEffect(() => {
    if (!running || finished) return undefined
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          finish()
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  })

  const reset = (nextDuration = duration) => {
    setDuration(nextDuration)
    setRemaining(nextDuration)
    setRunning(false)
    setFinished(false)
    setTypes({})
  }

  const addDistraction = (type: string) => {
    if (finished) return
    setTypes((current) => ({ ...current, [type]: (current[type] ?? 0) + 1 }))
  }

  return (
    <section className="training-tool">
      <div className="duration-options">
        {durationOptions.map((option) => (
          <button key={option} className={duration === option ? 'chip active' : 'chip'} type="button" onClick={() => reset(option)}>
            {option / 60}分钟
          </button>
        ))}
        <label className="inline-field">
          自定义
          <input
            type="number"
            min="1"
            max="90"
            value={Math.round(duration / 60)}
            onChange={(event) => reset(Number(event.target.value) * 60)}
          />
        </label>
      </div>

      <div className="tool-status glass-card">
        <div>
          <span className="eyebrow">专注计时</span>
          <strong>{formatDuration(remaining)}</strong>
        </div>
        <div>
          <span className="eyebrow">分心次数</span>
          <strong>{total}</strong>
        </div>
      </div>

      <div className="distraction-grid">
        {distractionTypes.map((type) => (
          <button className="glass-card distraction-button" key={type} type="button" onClick={() => addDistraction(type)}>
            {type}
            <span>{types[type] ?? 0}</span>
          </button>
        ))}
      </div>

      {finished && (
        <div className="completion-panel glass-card">
          <h3>分心记录完成</h3>
          {total === 0 ? (
            <p>本轮没有记录分心事件。可以继续观察任务难度和环境稳定性。</p>
          ) : (
            <ul className="result-list">
              {Object.entries(types).map(([type, count]) => (
                <li key={type}>
                  <span>{type}</span>
                  <strong>{count} 次</strong>
                </li>
              ))}
            </ul>
          )}
          <ResultActions onRestart={() => reset()} />
        </div>
      )}

      {!finished && (
        <div className="tool-actions">
          <button className="button" type="button" onClick={() => setRunning(true)} disabled={running}>
            <Play size={18} aria-hidden="true" />
            开始
          </button>
          <button className="button ghost" type="button" onClick={finish}>
            <Square size={18} aria-hidden="true" />
            结束并保存
          </button>
          <button className="button ghost" type="button" onClick={() => reset()}>
            <RotateCcw size={18} aria-hidden="true" />
            重置
          </button>
        </div>
      )}
    </section>
  )
}

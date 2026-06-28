import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import type { TrainingMethod } from '../types/training'
import { formatDuration } from '../utils/date'
import ResultActions from './ResultActions'

type BreathingTrainingProps = {
  method: TrainingMethod
}

const durationOptions = [120, 300, 600]

export default function BreathingTraining({ method }: BreathingTrainingProps) {
  const addRecord = useTrainingStore((state) => state.addRecord)
  const [duration, setDuration] = useState(120)
  const [remaining, setRemaining] = useState(120)
  const [running, setRunning] = useState(false)
  const [mindWanderingCount, setMindWanderingCount] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!running || finished) return undefined
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setRunning(false)
          setFinished(true)
          addRecord({
            id: crypto.randomUUID(),
            type: 'training',
            methodId: method.id,
            methodName: method.name,
            date: new Date().toISOString(),
            durationSeconds: duration,
            mindWanderingCount,
          })
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [addRecord, duration, finished, method.id, method.name, mindWanderingCount, running])

  const reset = (nextDuration = duration) => {
    setDuration(nextDuration)
    setRemaining(nextDuration)
    setRunning(false)
    setMindWanderingCount(0)
    setFinished(false)
  }

  return (
    <section className="training-tool centered-tool">
      <div className="duration-options">
        {durationOptions.map((option) => (
          <button key={option} className={duration === option ? 'chip active' : 'chip'} type="button" onClick={() => reset(option)}>
            {option / 60}分钟
          </button>
        ))}
      </div>

      <div className={running ? 'breath-orb running' : 'breath-orb'} aria-label="呼吸节奏动画">
        <span>呼吸</span>
      </div>

      <div className="tool-status glass-card">
        <div>
          <span className="eyebrow">倒计时</span>
          <strong>{formatDuration(remaining)}</strong>
        </div>
        <div>
          <span className="eyebrow">走神记录</span>
          <strong>{mindWanderingCount}</strong>
        </div>
      </div>

      {finished && (
        <div className="completion-panel glass-card">
          <h3>数息训练完成</h3>
          <p>本次记录到 {mindWanderingCount} 次走神。觉察到走神并回到呼吸，就是训练的一部分。</p>
          <ResultActions onRestart={() => reset()} />
        </div>
      )}

      {!finished && (
        <div className="tool-actions">
          <button className="button" type="button" onClick={() => setRunning((current) => !current)}>
            {running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            {running ? '暂停' : '开始'}
          </button>
          <button className="button ghost" type="button" onClick={() => setMindWanderingCount((current) => current + 1)}>
            我走神了
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

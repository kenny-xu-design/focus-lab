import { Play, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import type { TrainingMethod } from '../types/training'
import { formatDuration } from '../utils/date'
import ResultActions from './ResultActions'

type StartupTrainingProps = {
  method: TrainingMethod
}

const startupDuration = 5 * 60
const resultOptions = ['已继续做下去', '只完成了5分钟', '中途放弃']

export default function StartupTraining({ method }: StartupTrainingProps) {
  const addRecord = useTrainingStore((state) => state.addRecord)
  const [taskName, setTaskName] = useState('')
  const [remaining, setRemaining] = useState(startupDuration)
  const [running, setRunning] = useState(false)
  const [readyToReview, setReadyToReview] = useState(false)
  const [result, setResult] = useState(resultOptions[0])
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setRunning(false)
          setReadyToReview(true)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const reset = () => {
    setTaskName('')
    setRemaining(startupDuration)
    setRunning(false)
    setReadyToReview(false)
    setResult(resultOptions[0])
    setNote('')
    setSaved(false)
  }

  const save = () => {
    addRecord({
      id: crypto.randomUUID(),
      type: 'training',
      methodId: method.id,
      methodName: method.name,
      date: new Date().toISOString(),
      durationSeconds: startupDuration - remaining || startupDuration,
      taskName: taskName.trim(),
      result,
      note: note.trim() || undefined,
    })
    setSaved(true)
  }

  return (
    <section className="training-tool startup-tool">
      <label className="field-label" htmlFor="startup-task">当前要开始的小任务</label>
      <input id="startup-task" className="text-input" value={taskName} onChange={(event) => setTaskName(event.target.value)} placeholder="例如：写完论文引言的第一段" disabled={running || readyToReview} />

      <div className="tool-status glass-card">
        <div>
          <span className="eyebrow">倒计时</span>
          <strong>{formatDuration(remaining)}</strong>
        </div>
        <div>
          <span className="eyebrow">任务</span>
          <strong>{taskName || '待输入'}</strong>
        </div>
      </div>

      {!readyToReview && (
        <button className="button" type="button" onClick={() => setRunning(true)} disabled={!taskName.trim() || running}>
          <Play size={18} aria-hidden="true" />
          {running ? '进行中' : '开始 5 分钟'}
        </button>
      )}

      {readyToReview && (
        <div className="completion-panel glass-card review-form">
          <h3>记录启动结果</h3>
          <div className="duration-options">
            {resultOptions.map((option) => (
              <button key={option} className={result === option ? 'chip active' : 'chip'} type="button" onClick={() => setResult(option)}>
                {option}
              </button>
            ))}
          </div>
          <textarea className="text-input textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="写一句备注，例如：开始前阻力主要来自不知道先写哪一句。" />
          <button className="button" type="button" onClick={save} disabled={saved}>
            <Save size={18} aria-hidden="true" />
            {saved ? '已保存' : '保存记录'}
          </button>
          {saved && <ResultActions onRestart={reset} />}
        </div>
      )}
    </section>
  )
}

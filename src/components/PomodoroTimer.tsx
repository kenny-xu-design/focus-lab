import { Pause, Play, RotateCcw, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import type { TrainingMethod } from '../types/training'
import { formatDuration } from '../utils/date'
import ResultActions from './ResultActions'

type PomodoroTimerProps = {
  method: TrainingMethod
}

type Preset = {
  label: string
  focus: number
  rest: number
}

const presets: Preset[] = [
  { label: '25/5', focus: 25, rest: 5 },
  { label: '45/10', focus: 45, rest: 10 },
]

export default function PomodoroTimer({ method }: PomodoroTimerProps) {
  const addRecord = useTrainingStore((state) => state.addRecord)
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [restMinutes, setRestMinutes] = useState(5)
  const [phase, setPhase] = useState<'focus' | 'rest'>('focus')
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [distractionCount, setDistractionCount] = useState(0)
  const [taskName, setTaskName] = useState('')
  const [note, setNote] = useState('')
  const [focusDone, setFocusDone] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setRunning(false)
          if (phase === 'focus') {
            setFocusDone(true)
            setPhase('rest')
            setRemaining(restMinutes * 60)
          }
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [phase, restMinutes, running])

  const reset = () => {
    setPhase('focus')
    setRemaining(focusMinutes * 60)
    setRunning(false)
    setDistractionCount(0)
    setTaskName('')
    setNote('')
    setFocusDone(false)
    setSaved(false)
  }

  const applyPreset = (preset: Preset) => {
    setFocusMinutes(preset.focus)
    setRestMinutes(preset.rest)
    setPhase('focus')
    setRemaining(preset.focus * 60)
    setRunning(false)
    setFocusDone(false)
    setSaved(false)
  }

  const save = () => {
    addRecord({
      id: crypto.randomUUID(),
      type: 'training',
      methodId: method.id,
      methodName: method.name,
      date: new Date().toISOString(),
      durationSeconds: focusMinutes * 60,
      distractionCount,
      taskName: taskName.trim() || undefined,
      note: note.trim() || undefined,
      extra: { restMinutes },
    })
    setSaved(true)
  }

  return (
    <section className="training-tool">
      <div className="duration-options">
        {presets.map((preset) => (
          <button className="chip" key={preset.label} type="button" onClick={() => applyPreset(preset)}>
            {preset.label}
          </button>
        ))}
        <label className="inline-field">
          专注
          <input
            type="number"
            min="1"
            max="120"
            value={focusMinutes}
            onChange={(event) => {
              const value = Number(event.target.value)
              setFocusMinutes(value)
              if (phase === 'focus') setRemaining(value * 60)
            }}
          />
        </label>
        <label className="inline-field">
          休息
          <input type="number" min="1" max="60" value={restMinutes} onChange={(event) => setRestMinutes(Number(event.target.value))} />
        </label>
      </div>

      <input className="text-input" value={taskName} onChange={(event) => setTaskName(event.target.value)} placeholder="本轮任务，例如：完成阅读笔记第一段" />

      <div className="tool-status glass-card">
        <div>
          <span className="eyebrow">当前阶段</span>
          <strong>{phase === 'focus' ? '专注' : '休息'}</strong>
        </div>
        <div>
          <span className="eyebrow">倒计时</span>
          <strong>{formatDuration(remaining)}</strong>
        </div>
        <div>
          <span className="eyebrow">分心次数</span>
          <strong>{distractionCount}</strong>
        </div>
      </div>

      <div className="tool-actions">
        <button className="button" type="button" onClick={() => setRunning((value) => !value)} disabled={focusDone}>
          {running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {running ? '暂停' : '开始 / 继续'}
        </button>
        <button className="button ghost" type="button" onClick={() => setDistractionCount((count) => count + 1)} disabled={focusDone}>
          记录分心
        </button>
        <button className="button ghost" type="button" onClick={reset}>
          <RotateCcw size={18} aria-hidden="true" />
          重置
        </button>
      </div>

      {focusDone && (
        <div className="completion-panel glass-card review-form">
          <h3>专注阶段完成</h3>
          <p>本轮专注 {focusMinutes} 分钟，记录分心 {distractionCount} 次。可以保存本轮任务，也可以休息后再开始下一轮。</p>
          <textarea className="text-input textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="写一句备注，例如：主要分心来自资料检索。" />
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

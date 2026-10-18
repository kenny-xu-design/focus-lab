import { useEffect, useRef, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import type { TrainingMethod } from '../types/training'
import { numberMetrics, trainingEnvironment } from '../utils/numberTraining'

type Props = { method: TrainingMethod; numbers: number[]; repeatedLayout: boolean }

export default function SchulteSearch({ method, numbers, repeatedLayout }: Props) {
  const addRecord = useTrainingStore((state) => state.addRecord)
  const addLayoutSnapshot = useTrainingStore((state) => state.addLayoutSnapshot)
  const [phase, setPhase] = useState<'ready' | 'running' | 'complete'>('ready')
  const [target, setTarget] = useState(1)
  const [errors, setErrors] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [message, setMessage] = useState('数字全程可见；按顺序点击，不需要翻盖记忆。')
  const running = useRef(false)
  const expected = useRef(1)
  const errorCount = useRef(0)
  const startedAt = useRef(0)
  const environment = useRef('')
  const layoutUsed = useRef(repeatedLayout)
  const hasStarted = useRef(false)

  const reset = () => {
    running.current = false
    expected.current = 1
    errorCount.current = 0
    setPhase('ready')
    setTarget(1)
    setErrors(0)
    setElapsedMs(0)
  }

  useEffect(() => {
    const hide = () => {
      if (document.hidden && running.current) {
        reset()
        setMessage('离开页面，本轮已取消且未记入完成记录。请重新开始。')
      }
    }
    document.addEventListener('visibilitychange', hide)
    return () => { running.current = false; document.removeEventListener('visibilitychange', hide) }
  }, [])

  useEffect(() => {
    if (phase !== 'running') return
    const timer = window.setInterval(() => setElapsedMs(performance.now() - startedAt.current), 100)
    return () => window.clearInterval(timer)
  }, [phase])

  const start = () => {
    reset()
    environment.current = trainingEnvironment()
    layoutUsed.current = repeatedLayout || hasStarted.current
    hasStarted.current = true
    startedAt.current = performance.now()
    running.current = true
    setPhase('running')
    setMessage('只在当前任务内比较准确率与用时。')
    addLayoutSnapshot({ id: crypto.randomUUID(), methodId: method.id, methodName: method.name, mode: 'search',
      label: `舒尔特 ${Math.sqrt(numbers.length)}×${Math.sqrt(numbers.length)}`, numbers, createdAt: new Date().toISOString() })
  }

  const answer = (number: number) => {
    if (!running.current || number < expected.current) return
    if (number !== expected.current) {
      errorCount.current++
      setErrors(errorCount.current)
      setMessage(`这次应找 ${expected.current}，错误已记录，目标不变。`)
      return
    }
    expected.current++
    setTarget(expected.current)
    if (number === numbers.length) {
      running.current = false
      const totalMs = Math.max(1, performance.now() - startedAt.current)
      setElapsedMs(totalMs)
      setPhase('complete')
      setMessage('本轮已保存。换一张新表，可减少记住布局对成绩的影响。')
      addRecord({ id: crypto.randomUUID(), type: 'training', methodId: method.id,
        methodName: `舒尔特搜索（${Math.sqrt(numbers.length)}×${Math.sqrt(numbers.length)}）`, date: new Date().toISOString(),
        durationSeconds: Math.max(1, Math.round(totalMs / 1000)), errors: errorCount.current,
        extra: { ...numberMetrics(numbers, 'search', totalMs, environment.current, layoutUsed.current), layout: numbers } })
    }
  }

  return (
    <section className="glass-card schulte-panel" aria-label="基础舒尔特搜索">
      <div className="tool-status compact-status">
        <div><span className="eyebrow">目标</span><strong>{phase === 'complete' ? '完成' : target}</strong></div>
        <div><span className="eyebrow">用时</span><strong>{(elapsedMs / 1000).toFixed(1)} 秒</strong></div>
        <div><span className="eyebrow">错误</span><strong>{errors}</strong></div>
      </div>
      <div className="number-grid schulte-grid" style={{ gridTemplateColumns: `repeat(${Math.sqrt(numbers.length)}, minmax(0, 1fr))` }} aria-label="可见数字搜索表">
        {numbers.map((number) => <button key={number} type="button" className={`number-cell ${number < target ? 'done' : ''}`}
          disabled={phase !== 'running' || number < target} aria-label={`数字 ${number}`} onClick={() => answer(number)}>{number}</button>)}
      </div>
      <p role="status" aria-live="polite">{message}</p>
      <button className="button" type="button" disabled={phase === 'running'} onClick={start}>{phase === 'complete' ? '重练此布局' : '开始搜索'}</button>
    </section>
  )
}

import { RotateCcw, Shuffle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTrainingStore } from '../store/useTrainingStore'
import type { TrainingMethod } from '../types/training'
import { groupRange, isNumberLayout, makeNumberLayout, numberMetrics, trainingEnvironment, type GridSize } from '../utils/numberTraining'
import SchulteSearch from './SchulteSearch'
import ResultActions from './ResultActions'

type NumberPathMemoryProps = {
  method: TrainingMethod
}

type SharedBoardProps = NumberPathMemoryProps & {
  numbers: number[]
  boardVersion: number
  repeatedLayout: boolean
  claimLayout: () => boolean
}

type GroupPhase = 'ready' | 'memorizing' | 'hidden' | 'groupComplete' | 'failed' | 'complete'
type FullPhase = 'ready' | 'memorizing' | 'hidden' | 'complete'

function useSafeTimeout() {
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])
  return (callback: () => void, delay: number) => { timers.current.push(window.setTimeout(callback, delay)) }
}

function formatSymbolDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const rest = safeSeconds % 60
  return `${minutes}′${rest.toString().padStart(2, '0')}″`
}

export default function NumberPathMemory({ method }: NumberPathMemoryProps) {
  const [searchParams] = useSearchParams()
  const layoutSnapshots = useTrainingStore((state) => state.layoutSnapshots)
  const layoutId = searchParams.get('layoutId')
  const restoredSnapshot = layoutId ? layoutSnapshots.find((snapshot) => snapshot.id === layoutId && isNumberLayout(snapshot.numbers)) : undefined
  const [size, setSize] = useState<GridSize>(restoredSnapshot?.numbers.length === 16 ? 4 : 5)
  const [level, setLevel] = useState<'search' | 'memory'>(restoredSnapshot && restoredSnapshot.mode !== 'search' ? 'memory' : 'search')
  const [numbers, setNumbers] = useState(() => restoredSnapshot?.numbers ?? makeNumberLayout(5))
  const [boardVersion, setBoardVersion] = useState(0)
  const [repeatedLayout, setRepeatedLayout] = useState(Boolean(restoredSnapshot))
  const [notice, setNotice] = useState('')
  const layoutUsed = useRef(Boolean(restoredSnapshot))
  const claimLayout = () => { const used = layoutUsed.current; layoutUsed.current = true; return used }

  useEffect(() => {
    if (!restoredSnapshot) return
    setNumbers(restoredSnapshot.numbers)
    setSize(restoredSnapshot.numbers.length === 16 ? 4 : 5)
    setLevel(restoredSnapshot.mode === 'search' ? 'search' : 'memory')
    setRepeatedLayout(true)
    layoutUsed.current = true
    setBoardVersion((version) => version + 1)
  }, [restoredSnapshot?.id])

  useEffect(() => {
    const invalidate = () => {
      if (document.hidden) return
      setBoardVersion((version) => version + 1)
      setRepeatedLayout(true)
      setNotice('返回页面后已重置本轮；此布局按复练记录，不纳入新题进步曲线。')
    }
    const resize = () => {
      setBoardVersion((version) => version + 1)
      setRepeatedLayout(true)
      setNotice('窗口大小改变，本轮已重置。换一张新表可重新比较成绩。')
    }
    document.addEventListener('visibilitychange', invalidate)
    window.addEventListener('resize', resize)
    return () => { document.removeEventListener('visibilitychange', invalidate); window.removeEventListener('resize', resize) }
  }, [])

  const regenerateBoard = (nextSize = size, nextLevel = level) => {
    setSize(nextSize)
    setLevel(nextLevel)
    setNumbers(makeNumberLayout(nextSize))
    setRepeatedLayout(false)
    layoutUsed.current = false
    setNotice('')
    setBoardVersion((version) => version + 1)
  }

  return (
    <section className="training-tool">
      <div className="glass-card number-training-controls">
        <div className="duration-options" aria-label="训练难度">
          <button className={`tab ${level === 'search' ? 'active' : ''}`} aria-pressed={level === 'search'} type="button" onClick={() => regenerateBoard(size, 'search')}>基础 · 舒尔特搜索</button>
          <button className={`tab ${level === 'memory' ? 'active' : ''}`} aria-pressed={level === 'memory'} type="button" onClick={() => regenerateBoard(size, 'memory')}>进阶 · 顺序记忆</button>
        </div>
        <div className="duration-options" aria-label="方格尺寸">
          {([4, 5] as const).map((value) => <button key={value} className={`chip ${size === value ? 'active' : ''}`} aria-pressed={size === value} type="button" onClick={() => regenerateBoard(value)}>{value}×{value}</button>)}
          <button className="button ghost compact" type="button" onClick={() => regenerateBoard()}><Shuffle size={16} aria-hidden="true" />换一张新表</button>
        </div>
        <p>{level === 'search' ? '数字全程可见，依次找出目标。' : `保留原来的分组翻盖和完整路径记忆；当前共 ${size * size} 个数字，每组 ${size} 个。`} 两种难度、两种尺寸分别记录。</p>
        {notice && <p role="status">{notice}</p>}
        {repeatedLayout && <span className="eyebrow">复练布局：保留成绩，但不纳入新题进步曲线</span>}
      </div>
      {level === 'search' ? <SchulteSearch key={`search-${boardVersion}`} method={method} numbers={numbers} repeatedLayout={repeatedLayout} /> : (
        <section className="path-memory-layout">
          <GroupedPathMemory key={`grouped-${boardVersion}`} method={method} numbers={numbers} boardVersion={boardVersion} repeatedLayout={repeatedLayout} claimLayout={claimLayout} />
          <FullPathMemory key={`full-${boardVersion}`} method={method} numbers={numbers} boardVersion={boardVersion} repeatedLayout={repeatedLayout} claimLayout={claimLayout} />
        </section>
      )}
      <p className="training-evidence-note">这些成绩反映当前任务表现，不是认知诊断。记忆模式的用时包含观察与回忆；同难度、同尺寸、新布局与相同显示条件才作比较。<a className="text-link" href="/records">查看我的记录与曲线</a></p>
    </section>
  )
}

function GroupedPathMemory({ method, numbers, boardVersion, repeatedLayout, claimLayout }: SharedBoardProps) {
  const size = Math.sqrt(numbers.length) as GridSize
  const total = numbers.length
  const groupStart = (index: number) => index * size + 1
  const groupEnd = (index: number) => index * size + size
  const schedule = useSafeTimeout()
  const environment = useRef(trainingEnvironment())
  const attempted = useRef(false)
  const repeated = useRef(repeatedLayout)
  const addRecord = useTrainingStore((state) => state.addRecord)
  const addLayoutSnapshot = useTrainingStore((state) => state.addLayoutSnapshot)
  const [phase, setPhase] = useState<GroupPhase>('ready')
  const [groupIndex, setGroupIndex] = useState(0)
  const [target, setTarget] = useState(1)
  const [errors, setErrors] = useState(0)
  const [streakErrors, setStreakErrors] = useState(0)
  const [rememorizeCount, setRememorizeCount] = useState(0)
  const [completedNumbers, setCompletedNumbers] = useState<number[]>([])
  const [wrongIndex, setWrongIndex] = useState<number | null>(null)
  const [startTime, setStartTime] = useState(performance.now())
  const [groupStartTime, setGroupStartTime] = useState(performance.now())
  const [elapsed, setElapsed] = useState(0)
  const [groupTimes, setGroupTimes] = useState<number[]>([])
  const currentRange = `${groupStart(groupIndex)}–${groupEnd(groupIndex)}`

  const reset = () => {
    const now = performance.now()
    setPhase('ready')
    setGroupIndex(0)
    setTarget(1)
    setErrors(0)
    setStreakErrors(0)
    setRememorizeCount(0)
    setCompletedNumbers([])
    setWrongIndex(null)
    setStartTime(now)
    setGroupStartTime(now)
    setElapsed(0)
    setGroupTimes([])
  }

  useEffect(() => {
    reset()
  }, [boardVersion])

  useEffect(() => {
    if (phase === 'ready' || phase === 'complete') return undefined
    const timer = window.setInterval(() => setElapsed(Math.floor((performance.now() - startTime) / 1000)), 300)
    return () => window.clearInterval(timer)
  }, [phase, startTime])

  const currentGroup = useMemo(
    () => groupRange(groupIndex, size),
    [groupIndex, size],
  )

  const saveLayoutAndStart = () => {
    if (groupIndex === 0) {
      repeated.current = claimLayout() || repeatedLayout || attempted.current
      attempted.current = true
    }
    addLayoutSnapshot({
      id: crypto.randomUUID(),
      methodId: method.id,
      methodName: method.name,
      mode: 'grouped',
      label: `分组记忆 ${currentRange}`,
      numbers,
      createdAt: new Date().toISOString(),
    })
    setPhase('hidden')
  }

  const failGroup = () => {
    setPhase('failed')
    setRememorizeCount((count) => count + 1)
    schedule(() => {
      setPhase('memorizing')
      setStreakErrors(0)
      setWrongIndex(null)
    }, 800)
  }

  const completeAll = (finalGroupTimes: number[]) => {
    const durationSeconds = Math.max(1, Math.floor((performance.now() - startTime) / 1000))
    setElapsed(durationSeconds)
    setPhase('complete')
    addRecord({
      id: crypto.randomUUID(),
      type: 'training',
      methodId: method.id,
      methodName: `${method.name}（分组记忆）`,
      date: new Date().toISOString(),
      durationSeconds,
      errors,
      extra: {
        ...numberMetrics(numbers, 'grouped', performance.now() - startTime, environment.current, repeated.current),
        layout: numbers,
        rememorizeCount,
        groupTimes: finalGroupTimes,
      },
    })
  }

  const completeGroup = () => {
    const groupSeconds = Math.max(1, Math.floor((performance.now() - groupStartTime) / 1000))
    const nextGroupTimes = [...groupTimes, groupSeconds]
    setGroupTimes(nextGroupTimes)
    setPhase('groupComplete')

    if (groupIndex === size - 1) {
      completeAll(nextGroupTimes)
      return
    }

    schedule(() => {
      const nextGroup = groupIndex + 1
      setGroupIndex(nextGroup)
      setTarget(groupStart(nextGroup))
      setCompletedNumbers([])
      setStreakErrors(0)
      setGroupStartTime(performance.now())
      setPhase('memorizing')
    }, 550)
  }

  const handleCellClick = (number: number, index: number) => {
    if (phase !== 'hidden' || completedNumbers.includes(number)) return

    if (number !== target) {
      const nextStreak = streakErrors + 1
      setErrors((count) => count + 1)
      setStreakErrors(nextStreak)
      setWrongIndex(index)
      schedule(() => setWrongIndex(null), 240)
      if (nextStreak >= 2) failGroup()
      return
    }

    const nextCompleted = [...completedNumbers, number]
    setCompletedNumbers(nextCompleted)
    setStreakErrors(0)

    if (number === groupEnd(groupIndex)) {
      completeGroup()
    } else {
      setTarget(number + 1)
    }
  }

  const stageLabel = phase === 'ready' ? '准备' : phase === 'memorizing' || phase === 'failed' ? '记忆' : phase === 'complete' ? '完成' : '挑战'
  const targetLabel = phase === 'memorizing' || phase === 'failed' ? currentRange : phase === 'complete' ? `1–${total}` : `${target}`
  const review = repeated.current ? '此布局已观察或练习过，成绩保留，但不纳入新题曲线。' : '本轮分组结果已保存，可与相同条件的新布局记录比较。'

  return (
    <section className="training-tool path-memory-panel">
      <div className="panel-heading">
        <span className="eyebrow">进阶｜分组记忆</span>
        <h2>{size} 组分段</h2>
      </div>

      <div className="tool-status glass-card compact-status">
        <div>
          <span className="eyebrow">阶段</span>
          <strong>{stageLabel}</strong>
        </div>
        <div>
          <span className="eyebrow">目标</span>
          <strong>{targetLabel}</strong>
        </div>
        <div>
          <span className="eyebrow">用时</span>
          <strong>{formatSymbolDuration(elapsed)}</strong>
        </div>
        <div>
          <span className="eyebrow">错误 / 重记</span>
          <strong>{errors} / {rememorizeCount}</strong>
        </div>
      </div>

      <NumberBoard
        numbers={numbers}
        visible={(number) => phase === 'memorizing' || phase === 'failed' || completedNumbers.includes(number) || phase === 'complete'}
        isCurrent={(number) => (phase === 'memorizing' || phase === 'failed') && currentGroup.includes(number)}
        isDone={(number) => completedNumbers.includes(number)}
        wrongIndex={wrongIndex}
        onClick={handleCellClick}
        label="分组路径记忆"
      />

      {phase === 'ready' && <button className="button" type="button" onClick={() => { const now = performance.now(); setStartTime(now); setGroupStartTime(now); setPhase('memorizing') }}>开始分组记忆</button>}

      {(phase === 'memorizing' || phase === 'failed') && (
        <button className="button" type="button" onClick={saveLayoutAndStart}>
          开始挑战
        </button>
      )}

      {phase === 'complete' && (
        <div className="completion-panel glass-card">
          <h3>分组完成</h3>
          <p>
            用时 {formatSymbolDuration(elapsed)}，错误 {errors} 次，重记 {rememorizeCount} 次。{review}
          </p>
          <ul className="result-list">
            {groupTimes.map((seconds, index) => (
              <li key={index}>
                <span>第 {index + 1} 组</span>
                <strong>{formatSymbolDuration(seconds)}</strong>
              </li>
            ))}
          </ul>
          <ResultActions onRestart={reset} />
        </div>
      )}

      {phase !== 'complete' && (
        <button className="button ghost" type="button" onClick={reset}>
          <RotateCcw size={18} aria-hidden="true" />
          重置记忆
        </button>
      )}
    </section>
  )
}

function FullPathMemory({ method, numbers, boardVersion, repeatedLayout, claimLayout }: SharedBoardProps) {
  const total = numbers.length
  const schedule = useSafeTimeout()
  const environment = useRef(trainingEnvironment())
  const attempted = useRef(false)
  const repeated = useRef(repeatedLayout)
  const addRecord = useTrainingStore((state) => state.addRecord)
  const addLayoutSnapshot = useTrainingStore((state) => state.addLayoutSnapshot)
  const [phase, setPhase] = useState<FullPhase>('ready')
  const [target, setTarget] = useState(1)
  const [errors, setErrors] = useState(0)
  const [completedNumbers, setCompletedNumbers] = useState<number[]>([])
  const [wrongIndex, setWrongIndex] = useState<number | null>(null)
  const [startTime, setStartTime] = useState(performance.now())
  const [elapsed, setElapsed] = useState(0)

  const reset = () => {
    const now = performance.now()
    setPhase('ready')
    setTarget(1)
    setErrors(0)
    setCompletedNumbers([])
    setWrongIndex(null)
    setStartTime(now)
    setElapsed(0)
  }

  useEffect(() => {
    reset()
  }, [boardVersion])

  useEffect(() => {
    if (phase === 'ready' || phase === 'complete') return undefined
    const timer = window.setInterval(() => setElapsed(Math.floor((performance.now() - startTime) / 1000)), 300)
    return () => window.clearInterval(timer)
  }, [phase, startTime])

  const saveLayoutAndStart = () => {
    repeated.current = claimLayout() || repeatedLayout || attempted.current
    attempted.current = true
    addLayoutSnapshot({
      id: crypto.randomUUID(),
      methodId: method.id,
      methodName: method.name,
      mode: 'fullPath',
      label: `完整挑战 1–${total}`,
      numbers,
      createdAt: new Date().toISOString(),
    })
    setPhase('hidden')
  }

  const complete = () => {
    const durationSeconds = Math.max(1, Math.floor((performance.now() - startTime) / 1000))
    setElapsed(durationSeconds)
    setPhase('complete')
    addRecord({
      id: crypto.randomUUID(),
      type: 'training',
      methodId: method.id,
      methodName: `${method.name}（完整路径）`,
      date: new Date().toISOString(),
      durationSeconds,
      errors,
      extra: {
        ...numberMetrics(numbers, 'fullPath', performance.now() - startTime, environment.current, repeated.current),
        layout: numbers,
        completedCount: total,
      },
    })
  }

  const handleCellClick = (number: number, index: number) => {
    if (phase !== 'hidden' || completedNumbers.includes(number)) return

    if (number !== target) {
      setErrors((count) => count + 1)
      setWrongIndex(index)
      schedule(() => setWrongIndex(null), 240)
      return
    }

    const nextCompleted = [...completedNumbers, number]
    setCompletedNumbers(nextCompleted)

    if (number === total) {
      complete()
    } else {
      setTarget(number + 1)
    }
  }

  const stageLabel = phase === 'ready' ? '准备' : phase === 'memorizing' ? '记忆' : phase === 'complete' ? '完成' : '挑战'
  const targetLabel = phase === 'memorizing' ? `1–${total}` : phase === 'complete' ? `1–${total}` : `${target}`
  const review = repeated.current ? '此布局已观察或练习过，成绩保留，但不纳入新题曲线。' : '本轮完整路径结果已保存，仅代表此任务表现。'

  return (
    <section className="training-tool path-memory-panel">
      <div className="panel-heading">
        <span className="eyebrow">进阶｜完整路径</span>
        <h2>完整 1–{total}</h2>
      </div>

      <div className="tool-status glass-card compact-status">
        <div>
          <span className="eyebrow">阶段</span>
          <strong>{stageLabel}</strong>
        </div>
        <div>
          <span className="eyebrow">目标</span>
          <strong>{targetLabel}</strong>
        </div>
        <div>
          <span className="eyebrow">用时</span>
          <strong>{formatSymbolDuration(elapsed)}</strong>
        </div>
        <div>
          <span className="eyebrow">错误 / 进度</span>
          <strong>{errors} / {completedNumbers.length}</strong>
        </div>
      </div>

      <NumberBoard
        numbers={numbers}
        visible={(number) => phase === 'memorizing' || completedNumbers.includes(number) || phase === 'complete'}
        isCurrent={() => phase === 'memorizing'}
        isDone={(number) => completedNumbers.includes(number)}
        wrongIndex={wrongIndex}
        onClick={handleCellClick}
        label="完整路径挑战"
      />

      {phase === 'ready' && <button className="button" type="button" onClick={() => { setStartTime(performance.now()); setPhase('memorizing') }}>开始完整记忆</button>}

      {phase === 'memorizing' && (
        <button className="button" type="button" onClick={saveLayoutAndStart}>
          开始挑战
        </button>
      )}

      {phase === 'complete' && (
        <div className="completion-panel glass-card">
          <h3>挑战完成</h3>
          <p>
            用时 {formatSymbolDuration(elapsed)}，错误 {errors} 次。{review}
          </p>
          <ResultActions onRestart={reset} />
        </div>
      )}

      {phase !== 'complete' && (
        <button className="button ghost" type="button" onClick={reset}>
          <RotateCcw size={18} aria-hidden="true" />
          重置挑战
        </button>
      )}
    </section>
  )
}

type NumberBoardProps = {
  numbers: number[]
  visible: (number: number) => boolean
  isCurrent: (number: number) => boolean
  isDone: (number: number) => boolean
  wrongIndex: number | null
  onClick: (number: number, index: number) => void
  label: string
}

function NumberBoard({ numbers, visible, isCurrent, isDone, wrongIndex, onClick, label }: NumberBoardProps) {
  return (
    <div className="number-grid" style={{ gridTemplateColumns: `repeat(${Math.sqrt(numbers.length)}, minmax(0, 1fr))` }} aria-label={label}>
      {numbers.map((number, index) => (
        <button
          key={number}
          className={[
            'number-cell',
            isCurrent(number) ? 'current' : '',
            isDone(number) ? 'done' : '',
            wrongIndex === index ? 'wrong' : '',
          ].join(' ')}
          type="button"
          aria-label={visible(number) ? `数字 ${number}` : `隐藏位置 ${index + 1}`}
          onClick={() => onClick(number, index)}
        >
          {visible(number) ? number : ''}
        </button>
      ))}
    </div>
  )
}

import { RotateCcw, Shuffle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTrainingStore } from '../store/useTrainingStore'
import type { TrainingMethod } from '../types/training'
import { shuffle } from '../utils/shuffle'
import ResultActions from './ResultActions'

type NumberPathMemoryProps = {
  method: TrainingMethod
}

type SharedBoardProps = NumberPathMemoryProps & {
  numbers: number[]
  boardVersion: number
}

type GroupPhase = 'memorizing' | 'hidden' | 'groupComplete' | 'failed' | 'complete'
type FullPhase = 'memorizing' | 'hidden' | 'complete'

const makeNumbers = () => shuffle(Array.from({ length: 25 }, (_, index) => index + 1))
const groupStart = (groupIndex: number) => groupIndex * 5 + 1
const groupEnd = (groupIndex: number) => groupIndex * 5 + 5

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
  const restoredSnapshot = layoutId ? layoutSnapshots.find((snapshot) => snapshot.id === layoutId) : undefined
  const [numbers, setNumbers] = useState(() => restoredSnapshot?.numbers ?? makeNumbers())
  const [boardVersion, setBoardVersion] = useState(0)

  useEffect(() => {
    if (!restoredSnapshot) return
    setNumbers(restoredSnapshot.numbers)
    setBoardVersion((version) => version + 1)
  }, [restoredSnapshot?.id])

  const regenerateBoard = () => {
    setNumbers(makeNumbers())
    setBoardVersion((version) => version + 1)
  }

  return (
    <section className="training-tool">
      <div className="path-memory-toolbar glass-card">
        <div>
          <span className="eyebrow">{restoredSnapshot ? '已回退布局' : '同一张随机表'}</span>
          <strong>{restoredSnapshot ? restoredSnapshot.label : '左侧分组记忆，右侧完整挑战'}</strong>
        </div>
        <button className="button ghost compact" type="button" onClick={regenerateBoard}>
          <Shuffle size={16} aria-hidden="true" />
          重新生成
        </button>
      </div>
      <section className="path-memory-layout">
        <GroupedPathMemory method={method} numbers={numbers} boardVersion={boardVersion} />
        <FullPathMemory method={method} numbers={numbers} boardVersion={boardVersion} />
      </section>
    </section>
  )
}

function GroupedPathMemory({ method, numbers, boardVersion }: SharedBoardProps) {
  const addRecord = useTrainingStore((state) => state.addRecord)
  const addLayoutSnapshot = useTrainingStore((state) => state.addLayoutSnapshot)
  const [phase, setPhase] = useState<GroupPhase>('memorizing')
  const [groupIndex, setGroupIndex] = useState(0)
  const [target, setTarget] = useState(1)
  const [errors, setErrors] = useState(0)
  const [streakErrors, setStreakErrors] = useState(0)
  const [rememorizeCount, setRememorizeCount] = useState(0)
  const [completedNumbers, setCompletedNumbers] = useState<number[]>([])
  const [wrongIndex, setWrongIndex] = useState<number | null>(null)
  const [startTime, setStartTime] = useState(Date.now())
  const [groupStartTime, setGroupStartTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [groupTimes, setGroupTimes] = useState<number[]>([])
  const currentRange = `${groupStart(groupIndex)}–${groupEnd(groupIndex)}`

  const reset = () => {
    const now = Date.now()
    setPhase('memorizing')
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
    if (phase === 'complete') return undefined
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 300)
    return () => window.clearInterval(timer)
  }, [phase, startTime])

  const currentGroup = useMemo(
    () => Array.from({ length: 5 }, (_, index) => groupStart(groupIndex) + index),
    [groupIndex],
  )

  const saveLayoutAndStart = () => {
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
    window.setTimeout(() => {
      setPhase('memorizing')
      setStreakErrors(0)
      setWrongIndex(null)
    }, 800)
  }

  const completeAll = (finalGroupTimes: number[]) => {
    const durationSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000))
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
        mode: 'grouped',
        layout: numbers,
        rememorizeCount,
        groupTimes: finalGroupTimes,
      },
    })
  }

  const completeGroup = () => {
    const groupSeconds = Math.max(1, Math.floor((Date.now() - groupStartTime) / 1000))
    const nextGroupTimes = [...groupTimes, groupSeconds]
    setGroupTimes(nextGroupTimes)
    setPhase('groupComplete')

    if (groupIndex === 4) {
      window.setTimeout(() => completeAll(nextGroupTimes), 400)
      return
    }

    window.setTimeout(() => {
      const nextGroup = groupIndex + 1
      setGroupIndex(nextGroup)
      setTarget(groupStart(nextGroup))
      setCompletedNumbers([])
      setStreakErrors(0)
      setGroupStartTime(Date.now())
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
      window.setTimeout(() => setWrongIndex(null), 240)
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

  const stageLabel = phase === 'memorizing' || phase === 'failed' ? '记忆' : phase === 'complete' ? '完成' : '挑战'
  const targetLabel = phase === 'memorizing' || phase === 'failed' ? currentRange : phase === 'complete' ? '1–25' : `${target}`
  const review =
    errors <= 3 && rememorizeCount <= 1
      ? '分组位置保持较稳定，可以在右侧进入完整路径挑战。'
      : '建议先稳定每组 5 个位置，再进行右侧完整挑战。'

  return (
    <section className="training-tool path-memory-panel">
      <div className="panel-heading">
        <span className="eyebrow">左侧｜记忆</span>
        <h2>5 组分段</h2>
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

function FullPathMemory({ method, numbers, boardVersion }: SharedBoardProps) {
  const addRecord = useTrainingStore((state) => state.addRecord)
  const addLayoutSnapshot = useTrainingStore((state) => state.addLayoutSnapshot)
  const [phase, setPhase] = useState<FullPhase>('memorizing')
  const [target, setTarget] = useState(1)
  const [errors, setErrors] = useState(0)
  const [completedNumbers, setCompletedNumbers] = useState<number[]>([])
  const [wrongIndex, setWrongIndex] = useState<number | null>(null)
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)

  const reset = () => {
    const now = Date.now()
    setPhase('memorizing')
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
    if (phase === 'complete') return undefined
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 300)
    return () => window.clearInterval(timer)
  }, [phase, startTime])

  const saveLayoutAndStart = () => {
    addLayoutSnapshot({
      id: crypto.randomUUID(),
      methodId: method.id,
      methodName: method.name,
      mode: 'fullPath',
      label: '完整挑战 1–25',
      numbers,
      createdAt: new Date().toISOString(),
    })
    setPhase('hidden')
  }

  const complete = () => {
    const durationSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000))
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
        mode: 'fullPath',
        layout: numbers,
        completedCount: 25,
      },
    })
  }

  const handleCellClick = (number: number, index: number) => {
    if (phase !== 'hidden' || completedNumbers.includes(number)) return

    if (number !== target) {
      setErrors((count) => count + 1)
      setWrongIndex(index)
      window.setTimeout(() => setWrongIndex(null), 240)
      return
    }

    const nextCompleted = [...completedNumbers, number]
    setCompletedNumbers(nextCompleted)

    if (number === 25) {
      complete()
    } else {
      setTarget(number + 1)
    }
  }

  const stageLabel = phase === 'memorizing' ? '记忆' : phase === 'complete' ? '完成' : '挑战'
  const targetLabel = phase === 'memorizing' ? '1–25' : phase === 'complete' ? '1–25' : `${target}`
  const review =
    errors <= 4
      ? '完整路径保持较好，说明你能把分段位置整合成连续路线。'
      : '完整路径错误偏多，可以先回到左侧分组训练。'

  return (
    <section className="training-tool path-memory-panel">
      <div className="panel-heading">
        <span className="eyebrow">右侧｜挑战</span>
        <h2>完整 1–25</h2>
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
    <div className="number-grid" aria-label={label}>
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
          onClick={() => onClick(number, index)}
        >
          {visible(number) ? number : ''}
        </button>
      ))}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import type { AttentionGame } from '../types/training'
import { average, calculateAccuracy } from '../utils/stats'
import ResultActions from './ResultActions'

type ColorConflictProps = {
  game: AttentionGame
}

const colorOptions = [
  { label: '红', value: 'red', css: '#ff5e57' },
  { label: '蓝', value: 'blue', css: '#4aa3ff' },
  { label: '绿', value: 'green', css: '#4ade80' },
  { label: '黄', value: 'yellow', css: '#ffd166' },
]

function makeTrial() {
  const word = colorOptions[Math.floor(Math.random() * colorOptions.length)]
  let color = colorOptions[Math.floor(Math.random() * colorOptions.length)]
  if (Math.random() < 0.75) {
    while (color.value === word.value) color = colorOptions[Math.floor(Math.random() * colorOptions.length)]
  }
  return { word, color, startedAt: Date.now(), conflict: word.value !== color.value }
}

export default function ColorConflict({ game }: ColorConflictProps) {
  const addGameRecord = useTrainingStore((state) => state.addGameRecord)
  const [trial, setTrial] = useState(makeTrial)
  const [index, setIndex] = useState(1)
  const [errors, setErrors] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [conflictCorrect, setConflictCorrect] = useState(0)
  const [conflictTotal, setConflictTotal] = useState(0)
  const [finished, setFinished] = useState(false)

  const accuracy = useMemo(() => calculateAccuracy(correct, errors), [correct, errors])

  const reset = () => {
    setTrial(makeTrial())
    setIndex(1)
    setErrors(0)
    setCorrect(0)
    setStreak(0)
    setMaxStreak(0)
    setReactionTimes([])
    setConflictCorrect(0)
    setConflictTotal(0)
    setFinished(false)
  }

  const finish = (nextCorrect = correct, nextErrors = errors, times = reactionTimes) => {
    setFinished(true)
    addGameRecord({
      id: crypto.randomUUID(),
      type: 'game',
      gameId: game.id,
      gameName: game.name,
      date: new Date().toISOString(),
      durationSeconds: Math.max(1, Math.round(times.reduce((sum, time) => sum + time, 0) / 1000)),
      correctCount: nextCorrect,
      errorCount: nextErrors,
      accuracy: calculateAccuracy(nextCorrect, nextErrors),
      averageReactionTime: average(times),
      maxStreak,
      extra: { conflictAccuracy: conflictTotal ? Math.round((conflictCorrect / conflictTotal) * 100) : 0 },
    })
  }

  const answer = (value: string) => {
    if (finished) return
    const isCorrect = value === trial.color.value
    const nextTimes = [...reactionTimes, Date.now() - trial.startedAt]
    const nextCorrect = correct + (isCorrect ? 1 : 0)
    const nextErrors = errors + (isCorrect ? 0 : 1)
    const nextStreak = isCorrect ? streak + 1 : 0
    setReactionTimes(nextTimes)
    setCorrect(nextCorrect)
    setErrors(nextErrors)
    setStreak(nextStreak)
    setMaxStreak((value) => Math.max(value, nextStreak))
    if (trial.conflict) {
      setConflictTotal((count) => count + 1)
      if (isCorrect) setConflictCorrect((count) => count + 1)
    }
    if (index >= 20) finish(nextCorrect, nextErrors, nextTimes)
    else {
      setIndex((count) => count + 1)
      setTrial(makeTrial())
    }
  }

  return (
    <section className="training-tool centered-tool">
      <div className="tool-status glass-card">
        <div><span className="eyebrow">题目</span><strong>{index} / 20</strong></div>
        <div><span className="eyebrow">正确率</span><strong>{accuracy}%</strong></div>
        <div><span className="eyebrow">连续正确</span><strong>{streak}</strong></div>
      </div>
      <div className="stroop-word" style={{ color: trial.color.css }}>{trial.word.label}</div>
      <div className="tool-actions">
        {colorOptions.map((color) => (
          <button className="button ghost color-choice" key={color.value} type="button" onClick={() => answer(color.value)}>
            <span style={{ background: color.css }} />
            {color.label}
          </button>
        ))}
      </div>
      {finished && (
        <div className="completion-panel glass-card">
          <h3>色词冲突完成</h3>
          <p>平均反应时 {average(reactionTimes)}ms，错误 {errors} 次，最高连续正确 {maxStreak}。</p>
          <ResultActions onRestart={reset} />
        </div>
      )}
    </section>
  )
}

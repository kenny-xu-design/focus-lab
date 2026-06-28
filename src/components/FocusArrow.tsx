import { useEffect, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import type { AttentionGame } from '../types/training'
import { average, calculateAccuracy } from '../utils/stats'
import ResultActions from './ResultActions'

type FocusArrowProps = {
  game: AttentionGame
}

type Trial = {
  center: 'left' | 'right'
  congruent: boolean
  startedAt: number
}

function makeTrial(): Trial {
  return {
    center: Math.random() > 0.5 ? 'left' : 'right',
    congruent: Math.random() > 0.5,
    startedAt: Date.now(),
  }
}

export default function FocusArrow({ game }: FocusArrowProps) {
  const addGameRecord = useTrainingStore((state) => state.addGameRecord)
  const [trial, setTrial] = useState(makeTrial)
  const [index, setIndex] = useState(1)
  const [correct, setCorrect] = useState(0)
  const [errors, setErrors] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [congruentCorrect, setCongruentCorrect] = useState(0)
  const [congruentTotal, setCongruentTotal] = useState(0)
  const [conflictCorrect, setConflictCorrect] = useState(0)
  const [conflictTotal, setConflictTotal] = useState(0)
  const [finished, setFinished] = useState(false)

  const reset = () => {
    setTrial(makeTrial())
    setIndex(1)
    setCorrect(0)
    setErrors(0)
    setReactionTimes([])
    setCongruentCorrect(0)
    setCongruentTotal(0)
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
      extra: {
        congruentAccuracy: congruentTotal ? Math.round((congruentCorrect / congruentTotal) * 100) : 0,
        conflictAccuracy: conflictTotal ? Math.round((conflictCorrect / conflictTotal) * 100) : 0,
      },
    })
  }

  const answer = (direction: 'left' | 'right') => {
    if (finished) return
    const isCorrect = direction === trial.center
    const nextTimes = [...reactionTimes, Date.now() - trial.startedAt]
    const nextCorrect = correct + (isCorrect ? 1 : 0)
    const nextErrors = errors + (isCorrect ? 0 : 1)
    setReactionTimes(nextTimes)
    setCorrect(nextCorrect)
    setErrors(nextErrors)
    if (trial.congruent) {
      setCongruentTotal((count) => count + 1)
      if (isCorrect) setCongruentCorrect((count) => count + 1)
    } else {
      setConflictTotal((count) => count + 1)
      if (isCorrect) setConflictCorrect((count) => count + 1)
    }
    if (index >= 24) finish(nextCorrect, nextErrors, nextTimes)
    else {
      setIndex((count) => count + 1)
      setTrial(makeTrial())
    }
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') answer('left')
      if (event.key === 'ArrowRight') answer('right')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const side = trial.congruent ? trial.center : trial.center === 'left' ? 'right' : 'left'
  const arrows = [side, side, trial.center, side, side].map((direction) => (direction === 'left' ? '←' : '→')).join(' ')

  return (
    <section className="training-tool centered-tool">
      <div className="tool-status glass-card">
        <div><span className="eyebrow">题目</span><strong>{index} / 24</strong></div>
        <div><span className="eyebrow">正确 / 错误</span><strong>{correct} / {errors}</strong></div>
        <div><span className="eyebrow">平均反应</span><strong>{average(reactionTimes)}ms</strong></div>
      </div>
      <div className="arrow-display">{arrows}</div>
      <div className="tool-actions">
        <button className="button ghost" type="button" onClick={() => answer('left')}>左</button>
        <button className="button ghost" type="button" onClick={() => answer('right')}>右</button>
      </div>
      {finished && (
        <div className="completion-panel glass-card">
          <h3>中心箭头完成</h3>
          <p>正确 {correct} 题，错误 {errors} 题，平均反应时 {average(reactionTimes)}ms。</p>
          <ResultActions onRestart={reset} />
        </div>
      )}
    </section>
  )
}

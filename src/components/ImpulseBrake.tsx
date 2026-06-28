import { useEffect, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import type { AttentionGame } from '../types/training'
import { average, calculateAccuracy } from '../utils/stats'
import ResultActions from './ResultActions'

type ImpulseBrakeProps = {
  game: AttentionGame
}

type Stimulus = {
  kind: 'go' | 'nogo'
  startedAt: number
}

function makeStimulus(): Stimulus {
  return {
    kind: Math.random() < 0.72 ? 'go' : 'nogo',
    startedAt: Date.now(),
  }
}

export default function ImpulseBrake({ game }: ImpulseBrakeProps) {
  const addGameRecord = useTrainingStore((state) => state.addGameRecord)
  const [stimulus, setStimulus] = useState(makeStimulus)
  const [round, setRound] = useState(1)
  const [correct, setCorrect] = useState(0)
  const [missed, setMissed] = useState(0)
  const [errors, setErrors] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [finished, setFinished] = useState(false)

  const reset = () => {
    setStimulus(makeStimulus())
    setRound(1)
    setCorrect(0)
    setMissed(0)
    setErrors(0)
    setReactionTimes([])
    setFinished(false)
  }

  const finish = (nextCorrect = correct, nextErrors = errors, nextMissed = missed, times = reactionTimes) => {
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
      missedCount: nextMissed,
      accuracy: calculateAccuracy(nextCorrect, nextErrors, nextMissed),
      averageReactionTime: average(times),
      extra: { impulseErrorRate: nextErrors + nextCorrect > 0 ? Math.round((nextErrors / (nextErrors + nextCorrect)) * 100) : 0 },
    })
  }

  const nextRound = (nextCorrect: number, nextErrors: number, nextMissed: number, nextTimes: number[]) => {
    if (round >= 30) finish(nextCorrect, nextErrors, nextMissed, nextTimes)
    else {
      setRound((value) => value + 1)
      setStimulus(makeStimulus())
    }
  }

  const clickStimulus = () => {
    if (finished) return
    if (stimulus.kind === 'go') {
      const nextTimes = [...reactionTimes, Date.now() - stimulus.startedAt]
      const nextCorrect = correct + 1
      setCorrect(nextCorrect)
      setReactionTimes(nextTimes)
      nextRound(nextCorrect, errors, missed, nextTimes)
    } else {
      const nextErrors = errors + 1
      setErrors(nextErrors)
      nextRound(correct, nextErrors, missed, reactionTimes)
    }
  }

  const skip = () => {
    if (finished) return
    if (stimulus.kind === 'go') {
      const nextMissed = missed + 1
      setMissed(nextMissed)
      nextRound(correct, errors, nextMissed, reactionTimes)
    } else {
      const nextCorrect = correct + 1
      setCorrect(nextCorrect)
      nextRound(nextCorrect, errors, missed, reactionTimes)
    }
  }

  useEffect(() => {
    if (finished) return undefined
    const timer = window.setTimeout(skip, 900)
    return () => window.clearTimeout(timer)
  })

  return (
    <section className="training-tool centered-tool">
      <div className="tool-status glass-card">
        <div><span className="eyebrow">轮次</span><strong>{round} / 30</strong></div>
        <div><span className="eyebrow">正确 / 误点</span><strong>{correct} / {errors}</strong></div>
        <div><span className="eyebrow">漏点</span><strong>{missed}</strong></div>
      </div>
      <button className={stimulus.kind === 'go' ? 'stimulus go' : 'stimulus nogo'} type="button" onClick={clickStimulus}>
        {stimulus.kind === 'go' ? 'GO' : 'NO-GO'}
      </button>
      <p className="muted-note">Go 出现时点击，No-Go 出现时保持不动。</p>
      {finished && (
        <div className="completion-panel glass-card">
          <h3>冲动刹车完成</h3>
          <p>正确 {correct} 次，漏点 {missed} 次，误点 {errors} 次，平均反应时 {average(reactionTimes)}ms。</p>
          <ResultActions onRestart={reset} />
        </div>
      )}
    </section>
  )
}

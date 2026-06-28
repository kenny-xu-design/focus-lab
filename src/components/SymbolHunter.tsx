import { Play, Square } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import type { AttentionGame } from '../types/training'
import { calculateAccuracy } from '../utils/stats'
import ResultActions from './ResultActions'

type SymbolHunterProps = {
  game: AttentionGame
}

const symbols = ['d:', 'p', 'b', 'q', 'd.', 'd∴']
const target = 'd:'

function makeBoard() {
  return Array.from({ length: 72 }, (_, index) => ({
    id: `${index}-${Math.random()}`,
    value: Math.random() < 0.28 ? target : symbols[Math.floor(Math.random() * symbols.length)],
    clicked: false,
  }))
}

export default function SymbolHunter({ game }: SymbolHunterProps) {
  const addGameRecord = useTrainingStore((state) => state.addGameRecord)
  const [board, setBoard] = useState(makeBoard)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [errors, setErrors] = useState(0)
  const targetTotal = useMemo(() => board.filter((item) => item.value === target).length, [board])
  const missed = Math.max(0, targetTotal - correct)

  const reset = () => {
    setBoard(makeBoard())
    setRunning(false)
    setFinished(false)
    setCorrect(0)
    setErrors(0)
  }

  const finish = () => {
    setFinished(true)
    setRunning(false)
    addGameRecord({
      id: crypto.randomUUID(),
      type: 'game',
      gameId: game.id,
      gameName: game.name,
      date: new Date().toISOString(),
      durationSeconds: 60,
      correctCount: correct,
      errorCount: errors,
      missedCount: missed,
      accuracy: calculateAccuracy(correct, errors, missed),
    })
  }

  const clickCell = (id: string) => {
    if (!running || finished) return
    setBoard((items) =>
      items.map((item) => {
        if (item.id !== id || item.clicked) return item
        if (item.value === target) setCorrect((count) => count + 1)
        else setErrors((count) => count + 1)
        return { ...item, clicked: true }
      }),
    )
  }

  return (
    <section className="training-tool">
      <div className="tool-status glass-card">
        <div>
          <span className="eyebrow">目标符号</span>
          <strong>{target}</strong>
        </div>
        <div>
          <span className="eyebrow">正确 / 错误</span>
          <strong>{correct} / {errors}</strong>
        </div>
        <div>
          <span className="eyebrow">漏点预估</span>
          <strong>{missed}</strong>
        </div>
      </div>
      <div className="symbol-board">
        {board.map((item) => (
          <button key={item.id} className={item.clicked ? 'symbol-cell clicked' : 'symbol-cell'} type="button" onClick={() => clickCell(item.id)}>
            {item.value}
          </button>
        ))}
      </div>
      {finished ? (
        <div className="completion-panel glass-card">
          <h3>符号划消完成</h3>
          <p>正确 {correct} 个，错误 {errors} 个，漏点 {missed} 个，准确率 {calculateAccuracy(correct, errors, missed)}%。</p>
          <ResultActions onRestart={reset} />
        </div>
      ) : (
        <div className="tool-actions">
          <button className="button" type="button" onClick={() => setRunning(true)} disabled={running}>
            <Play size={18} aria-hidden="true" />
            开始
          </button>
          <button className="button ghost" type="button" onClick={finish}>
            <Square size={18} aria-hidden="true" />
            结束并保存
          </button>
        </div>
      )}
    </section>
  )
}

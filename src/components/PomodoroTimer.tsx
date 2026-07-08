import { Maximize2, Minimize2, Move, Pause, Play, RotateCcw, Save, X } from 'lucide-react'
import { type PointerEvent, useEffect, useRef, useState } from 'react'
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

type DistractionMark = {
  id: string
  elapsedSeconds: number
  remainingSeconds: number
  segmentLabel: string
}

type FloatingPosition = {
  x: number
  y: number
}

type FloatingDragState = {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
}

const presets: Preset[] = [
  { label: '25/5', focus: 25, rest: 5 },
  { label: '45/10', focus: 45, rest: 10 },
]

const completionTitle = 'Focus Lab 番茄钟完成'
const completionMessage = '专注时间结束，可以休息了。'

type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }

const getAudioContextConstructor = () => window.AudioContext ?? (window as AudioWindow).webkitAudioContext

const getDistractionSegmentLabel = (elapsedSeconds: number, totalMinutes: number) => {
  const elapsedMinute = Math.max(1, Math.floor(elapsedSeconds / 60) + 1)
  const segmentStart = Math.floor((elapsedMinute - 1) / 5) * 5 + 1
  const segmentEnd = Math.min(segmentStart + 4, totalMinutes)

  return segmentStart === segmentEnd ? `第 ${segmentStart} 分钟` : `第 ${segmentStart}-${segmentEnd} 分钟`
}

export default function PomodoroTimer({ method }: PomodoroTimerProps) {
  const addRecord = useTrainingStore((state) => state.addRecord)
  const audioContextRef = useRef<AudioContext | null>(null)
  const floatingDragRef = useRef<FloatingDragState | null>(null)
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [restMinutes, setRestMinutes] = useState(5)
  const [phase, setPhase] = useState<'focus' | 'rest'>('focus')
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [distractionCount, setDistractionCount] = useState(0)
  const [distractionMarks, setDistractionMarks] = useState<DistractionMark[]>([])
  const [taskName, setTaskName] = useState('')
  const [note, setNote] = useState('')
  const [focusDone, setFocusDone] = useState(false)
  const [saved, setSaved] = useState(false)
  const [reminderVisible, setReminderVisible] = useState(false)
  const [floatingVisible, setFloatingVisible] = useState(false)
  const [floatingPosition, setFloatingPosition] = useState<FloatingPosition>({ x: 24, y: 96 })

  const ensureAudioContext = () => {
    const AudioContextConstructor = getAudioContextConstructor()
    if (!AudioContextConstructor) return null

    audioContextRef.current ??= new AudioContextConstructor()
    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume().catch(() => undefined)
    }

    return audioContextRef.current
  }

  const resumeAudioContext = async () => {
    const audioContext = ensureAudioContext()
    if (!audioContext) return

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    return audioContext
  }

  const playSilentUnlockCue = async () => {
    const audioContext = await resumeAudioContext()
    if (!audioContext) return

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const now = audioContext.currentTime

    gain.gain.setValueAtTime(0.0001, now)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.03)
  }

  const prepareReminderChannels = () => {
    void playSilentUnlockCue().catch(() => undefined)
  }

  const playCompletionCue = async () => {
    const audioContext = await resumeAudioContext()
    if (!audioContext) return

    const now = audioContext.currentTime + 0.05
    ;[880, 1175, 1568].forEach((frequency, index) => {
      const startAt = now + index * 0.24
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, startAt)
      gain.gain.setValueAtTime(0.0001, startAt)
      gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.18)

      oscillator.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.start(startAt)
      oscillator.stop(startAt + 0.22)
    })
  }

  const showCompletionReminder = () => {
    setReminderVisible(true)
    void playCompletionCue().catch(() => undefined)

    window.setTimeout(() => {
      window.alert(`${completionTitle}\n${completionMessage}`)
    }, 100)
  }

  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          setRunning(false)
          if (phase === 'focus') {
            showCompletionReminder()
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
    setHasStarted(false)
    setDistractionCount(0)
    setDistractionMarks([])
    setTaskName('')
    setNote('')
    setFocusDone(false)
    setSaved(false)
    setReminderVisible(false)
    setFloatingVisible(false)
  }

  const toggleRunning = () => {
    if (!running) {
      prepareReminderChannels()
      setHasStarted(true)
    }
    setRunning((value) => !value)
  }

  const clampFloatingPosition = (x: number, y: number): FloatingPosition => {
    const maxX = Math.max(12, window.innerWidth - 236)
    const maxY = Math.max(12, window.innerHeight - 150)

    return {
      x: Math.min(Math.max(12, x), maxX),
      y: Math.min(Math.max(12, y), maxY),
    }
  }

  const startFloatingDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return

    floatingDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: floatingPosition.x,
      originY: floatingPosition.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveFloatingDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = floatingDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    setFloatingPosition(
      clampFloatingPosition(drag.originX + event.clientX - drag.startX, drag.originY + event.clientY - drag.startY),
    )
  }

  const stopFloatingDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (floatingDragRef.current?.pointerId !== event.pointerId) return

    floatingDragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const recordDistraction = () => {
    const focusSeconds = focusMinutes * 60
    const elapsedSeconds = Math.max(0, focusSeconds - remaining)

    setDistractionCount((count) => count + 1)
    setDistractionMarks((marks) => [
      ...marks,
      {
        id: crypto.randomUUID(),
        elapsedSeconds,
        remainingSeconds: remaining,
        segmentLabel: getDistractionSegmentLabel(elapsedSeconds, focusMinutes),
      },
    ])
  }

  const applyPreset = (preset: Preset) => {
    setFocusMinutes(preset.focus)
    setRestMinutes(preset.rest)
    setPhase('focus')
    setRemaining(preset.focus * 60)
    setRunning(false)
    setHasStarted(false)
    setDistractionCount(0)
    setDistractionMarks([])
    setFocusDone(false)
    setSaved(false)
    setReminderVisible(false)
    setFloatingVisible(false)
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
      extra: { restMinutes, distractionMarks },
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
        <button className="button" type="button" onClick={toggleRunning} disabled={focusDone}>
          {running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {running ? '暂停' : '开始 / 继续'}
        </button>
        <button className="button ghost" type="button" onClick={recordDistraction} disabled={!running || focusDone}>
          记录分心
        </button>
        {hasStarted && !focusDone && (
          <button className="button ghost" type="button" onClick={() => setFloatingVisible((visible) => !visible)}>
            {floatingVisible ? <Maximize2 size={18} aria-hidden="true" /> : <Minimize2 size={18} aria-hidden="true" />}
            {floatingVisible ? '关闭浮窗' : '收起为浮窗'}
          </button>
        )}
        <button className="button ghost" type="button" onClick={reset}>
          <RotateCcw size={18} aria-hidden="true" />
          重置
        </button>
      </div>

      {floatingVisible && !focusDone && (
        <div className="pomodoro-floating-window" style={{ left: floatingPosition.x, top: floatingPosition.y }}>
          <div
            className="pomodoro-floating-grip"
            role="button"
            tabIndex={0}
            aria-label="拖动番茄钟浮窗"
            onPointerDown={startFloatingDrag}
            onPointerMove={moveFloatingDrag}
            onPointerUp={stopFloatingDrag}
            onPointerCancel={stopFloatingDrag}
          >
            <Move size={15} aria-hidden="true" />
            <span>{phase === 'focus' ? '专注中' : '休息中'}</span>
          </div>
          <strong>{formatDuration(remaining)}</strong>
          <small>{running ? '运行中' : '已暂停'}</small>
          <div className="pomodoro-floating-actions">
            <button type="button" onClick={toggleRunning} aria-label={running ? '暂停计时' : '继续计时'}>
              {running ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
            </button>
            <button type="button" onClick={() => setFloatingVisible(false)} aria-label="关闭番茄钟浮窗">
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {distractionMarks.length > 0 && !focusDone && (
        <div className="completion-panel glass-card">
          <h3>分心时间标注</h3>
          <ul className="result-list">
            {distractionMarks.map((mark, index) => (
              <li key={mark.id}>
                <span>第 {index + 1} 次分心</span>
                <strong>
                  {mark.segmentLabel} · {formatDuration(mark.elapsedSeconds)}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reminderVisible && (
        <div className="timer-reminder-overlay" role="presentation">
          <div className="timer-reminder-dialog glass-card" role="dialog" aria-modal="true" aria-labelledby="timer-reminder-title">
            <span className="eyebrow">番茄钟提醒</span>
            <h3 id="timer-reminder-title">{completionTitle}</h3>
            <p>{completionMessage}</p>
            <button className="button" type="button" onClick={() => setReminderVisible(false)}>
              知道了
            </button>
          </div>
        </div>
      )}

      {focusDone && (
        <div className="completion-panel glass-card review-form">
          <h3>专注阶段完成</h3>
          <p>本轮专注 {focusMinutes} 分钟，记录分心 {distractionCount} 次。可以保存本轮任务，也可以休息后再开始下一轮。</p>
          {distractionMarks.length > 0 && (
            <ul className="result-list">
              {distractionMarks.map((mark, index) => (
                <li key={mark.id}>
                  <span>第 {index + 1} 次分心</span>
                  <strong>
                    {mark.segmentLabel} · {formatDuration(mark.elapsedSeconds)}
                  </strong>
                </li>
              ))}
            </ul>
          )}
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

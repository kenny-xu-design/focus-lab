import { invoke } from '@tauri-apps/api/core'
import {
  Archive,
  CalendarDays,
  Bell,
  Check,
  Inbox,
  ListTodo,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
} from 'lucide-react'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  cancelSession,
  completeSession,
  createDefaultProductivityData,
  createFocusSession,
  getLocalDateKey,
  getSessionRemainingMs,
  pauseSession,
  resumeSession,
  runDailyRollover,
  startBreakPhase,
  type ProductivityData,
  type Task,
  type TaskStatus,
} from '../features/productivity'

const productivityStorageKey = 'focus-lab-productivity-data'

type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }

const getAudioContextConstructor = () => window.AudioContext ?? (window as AudioWindow).webkitAudioContext

function isTauriRuntime() {
  return typeof window !== 'undefined' && ('__TAURI__' in window || '__TAURI_INTERNALS__' in window)
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function parseProductivityData(json: string): ProductivityData | null {
  try {
    const parsed = JSON.parse(json) as ProductivityData
    if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.tasks)) return null

    const today = getLocalDateKey()
    runDailyRollover(parsed, today, parsed.settings)
    return parsed
  } catch {
    return null
  }
}

function loadProductivityDataFromLocalStorage(): ProductivityData {
  const fallback = createDefaultProductivityData()
  if (typeof window === 'undefined') return fallback

  const saved = window.localStorage.getItem(productivityStorageKey)
  if (!saved) return fallback

  return parseProductivityData(saved) ?? fallback
}

async function loadProductivityData(): Promise<ProductivityData> {
  const fallback = loadProductivityDataFromLocalStorage()
  if (!isTauriRuntime()) return fallback

  try {
    const saved = await invoke<string | null>('load_productivity_data')
    if (!saved) return fallback
    return parseProductivityData(saved) ?? fallback
  } catch {
    return fallback
  }
}

function saveProductivityDataToLocalStorage(data: ProductivityData) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(productivityStorageKey, JSON.stringify(data))
}

async function saveProductivityData(data: ProductivityData) {
  const json = JSON.stringify(data)
  saveProductivityDataToLocalStorage(data)

  if (!isTauriRuntime()) return

  await invoke('save_productivity_data', { json })
}

function createTask(title: string, status: TaskStatus, order: number): Task {
  const now = Date.now()
  return {
    id: createId('task'),
    title,
    status,
    plannedForDate: status === 'planned_tomorrow' || status === 'today_active' ? getLocalDateKey() : undefined,
    createdAt: now,
    updatedAt: now,
    order,
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    totalFocusMs: 0,
    source: 'manual',
  }
}

type TaskColumn = {
  id: 'today' | 'tomorrow' | 'inbox'
  title: string
  status: TaskStatus
  icon: typeof ListTodo
}

const columns: TaskColumn[] = [
  { id: 'today', title: '今日执行', status: 'today_active', icon: ListTodo },
  { id: 'tomorrow', title: '明日计划', status: 'planned_tomorrow', icon: CalendarDays },
  { id: 'inbox', title: '收集箱', status: 'inbox', icon: Inbox },
]

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
}

function formatDuration(ms: number) {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getPhaseLabel(phase: 'focus' | 'break' | 'long_break') {
  if (phase === 'break') return '短休息'
  if (phase === 'long_break') return '长休息'
  return '专注'
}

export default function DesktopTaskPage() {
  const [data, setData] = useState<ProductivityData>(() => loadProductivityDataFromLocalStorage())
  const [title, setTitle] = useState('')
  const [targetStatus, setTargetStatus] = useState<TaskStatus>('inbox')
  const [clockNow, setClockNow] = useState(Date.now())
  const [phaseReadySessionId, setPhaseReadySessionId] = useState<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const alertedPhaseRef = useRef<string | null>(null)

  const visibleTasks = useMemo(() => data.tasks.filter((task) => task.deletedAt === undefined), [data.tasks])
  const activeTask = visibleTasks.find((task) => task.status === 'in_progress')
  const activeSession = data.sessions.find(
    (session) => session.deletedAt === undefined && (session.status === 'running' || session.status === 'paused'),
  )
  const remainingMs = activeSession ? getSessionRemainingMs(activeSession, clockNow) : 0

  useEffect(() => {
    const intervalId = window.setInterval(() => setClockNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let cancelled = false

    void loadProductivityData().then((loadedData) => {
      if (cancelled) return
      setData(loadedData)
      saveProductivityDataToLocalStorage(loadedData)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!activeSession || activeSession.status !== 'running' || remainingMs > 0) return

    const phaseKey = `${activeSession.id}:${activeSession.phase}`
    setPhaseReadySessionId(activeSession.id)
    if (alertedPhaseRef.current === phaseKey) return

    alertedPhaseRef.current = phaseKey
    if (data.settings.soundEnabled) {
      void playPhaseReadyCue().catch(() => undefined)
    }
  }, [activeSession, data.settings.soundEnabled, remainingMs])

  useEffect(() => {
    if (!activeSession) {
      setPhaseReadySessionId(null)
      alertedPhaseRef.current = null
    }
  }, [activeSession])

  function updateData(updater: (current: ProductivityData) => ProductivityData) {
    setData((current) => {
      const next = updater(current)
      void saveProductivityData(next).catch(() => undefined)
      return next
    })
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) return

    updateData((current) => ({
      ...current,
      tasks: [...current.tasks, createTask(nextTitle, targetStatus, current.tasks.length + 1)],
    }))
    setTitle('')
  }

  function ensureAudioContext() {
    const AudioContextConstructor = getAudioContextConstructor()
    if (!AudioContextConstructor) return null

    audioContextRef.current ??= new AudioContextConstructor()
    return audioContextRef.current
  }

  async function resumeAudioContext() {
    const audioContext = ensureAudioContext()
    if (!audioContext) return null
    if (audioContext.state === 'suspended') await audioContext.resume()
    return audioContext
  }

  async function playPhaseReadyCue() {
    const audioContext = await resumeAudioContext()
    if (!audioContext) return

    const now = audioContext.currentTime
    const notes = [660, 880, 660]

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      const startAt = now + index * 0.16
      const endAt = startAt + 0.12

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, startAt)
      gainNode.gain.setValueAtTime(0.0001, startAt)
      gainNode.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt)
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.start(startAt)
      oscillator.stop(endAt + 0.02)
    })
  }

  function moveTask(taskId: string, status: TaskStatus) {
    const now = Date.now()
    updateData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              plannedForDate:
                status === 'planned_tomorrow' || status === 'today_active' || status === 'in_progress'
                  ? getLocalDateKey()
                  : task.plannedForDate,
              startedAt: status === 'in_progress' ? task.startedAt ?? now : task.startedAt,
              updatedAt: now,
            }
          : task,
      ),
    }))
  }

  function startTask(taskId: string) {
    const now = Date.now()
    void resumeAudioContext().catch(() => undefined)
    updateData((current) => {
      const task = current.tasks.find((item) => item.id === taskId)
      if (!task) return current

      return {
        ...current,
        sessions: [
          ...current.sessions.map((session) =>
            session.status === 'running' || session.status === 'paused' ? cancelSession(session, now) : session,
          ),
          createFocusSession(task, current.settings, createId('session'), now),
        ],
        tasks: current.tasks.map((item) =>
          item.id === taskId
            ? {
                ...item,
                status: 'in_progress',
                plannedForDate: getLocalDateKey(),
                startedAt: item.startedAt ?? now,
                updatedAt: now,
              }
            : item.status === 'in_progress'
              ? { ...item, status: 'today_active', updatedAt: now }
              : item,
        ),
      }
    })
  }

  function pauseActiveSession() {
    const now = Date.now()
    updateData((current) => ({
      ...current,
      sessions: current.sessions.map((session) =>
        session.id === activeSession?.id ? pauseSession(session, now) : session,
      ),
    }))
  }

  function resumeActiveSession() {
    const now = Date.now()
    void resumeAudioContext().catch(() => undefined)
    updateData((current) => ({
      ...current,
      sessions: current.sessions.map((session) =>
        session.id === activeSession?.id ? resumeSession(session, now) : session,
      ),
    }))
  }

  function completeActiveSession() {
    if (!activeSession) return

    const now = Date.now()
    setPhaseReadySessionId(null)
    updateData((current) => {
      const currentTask = current.tasks.find((task) => task.id === activeSession.taskId)
      const completedFocusCount =
        activeSession.phase === 'focus' ? (currentTask?.completedPomodoros ?? 0) + 1 : currentTask?.completedPomodoros ?? 0

      return {
        ...current,
        sessions: current.sessions.map((session) => {
          if (session.id !== activeSession.id) return session
          if (session.phase === 'focus') return startBreakPhase(session, current.settings, completedFocusCount, now)
          return completeSession(session, now)
        }),
        tasks: current.tasks.map((task) => {
          if (task.id !== activeSession.taskId) return task

          if (activeSession.phase === 'focus') {
            return {
              ...task,
              completedPomodoros: task.completedPomodoros + 1,
              totalFocusMs: task.totalFocusMs + activeSession.focusDurationMs,
              updatedAt: now,
            }
          }

          return {
            ...task,
            status: 'today_active',
            updatedAt: now,
          }
        }),
      }
    })
  }

  function completeTask(taskId: string) {
    const now = Date.now()
    updateData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'done',
              completedAt: now,
              updatedAt: now,
            }
          : task,
      ),
    }))
  }

  function softDeleteTask(taskId: string) {
    const now = Date.now()
    updateData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, status: 'archived', deletedAt: now, updatedAt: now } : task,
      ),
    }))
  }

  return (
    <div className="desktop-workbench">
      <section className="desktop-topbar">
        <div>
          <span className="eyebrow">Focus Lab Desktop</span>
          <h1>任务番茄工作台</h1>
        </div>
        <div className="desktop-today">
          <span>{getLocalDateKey()}</span>
          <strong>
            {activeSession
              ? activeSession.status === 'paused'
                ? `${getPhaseLabel(activeSession.phase)}暂停`
                : `${getPhaseLabel(activeSession.phase)}中`
              : activeTask
                ? '执行中'
                : '待启动'}
          </strong>
        </div>
      </section>

      <section className="desktop-session-panel glass-card" aria-label="当前番茄">
        <div>
          <span className="eyebrow">{activeSession ? getPhaseLabel(activeSession.phase) : '当前番茄'}</span>
          <strong>{activeSession?.taskTitleSnapshot ?? '尚未开始'}</strong>
        </div>
        <div className="desktop-session-time">{activeSession ? formatDuration(remainingMs) : '25:00'}</div>
        <div className="desktop-session-actions">
          {activeSession?.status === 'running' && (
            <button className="button compact ghost" type="button" onClick={pauseActiveSession}>
              <Pause size={16} aria-hidden="true" />
              暂停
            </button>
          )}
          {activeSession?.status === 'paused' && (
            <button className="button compact" type="button" onClick={resumeActiveSession}>
              <Play size={16} aria-hidden="true" />
              继续
            </button>
          )}
          <button className="button compact" type="button" disabled={!activeSession} onClick={completeActiveSession}>
            <Check size={16} aria-hidden="true" />
            {activeSession?.phase === 'focus' ? '进入休息' : '结束休息'}
          </button>
        </div>
      </section>

      {phaseReadySessionId && activeSession && (
        <div className="timer-reminder-overlay" role="presentation">
          <div
            className="timer-reminder-dialog desktop-phase-dialog glass-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="desktop-phase-ready-title"
          >
            <Bell size={24} aria-hidden="true" />
            <h3 id="desktop-phase-ready-title">
              {activeSession.phase === 'focus' ? '专注完成' : '休息完成'}
            </h3>
            <p>
              {activeSession.phase === 'focus'
                ? '这一轮番茄已经结束，可以进入休息。'
                : '休息已经结束，可以回到任务。'}
            </p>
            <button className="button compact" type="button" onClick={completeActiveSession}>
              <Check size={16} aria-hidden="true" />
              {activeSession.phase === 'focus' ? '进入休息' : '结束休息'}
            </button>
          </div>
        </div>
      )}

      <form className="desktop-task-form glass-card" onSubmit={addTask}>
        <input
          className="text-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="写下一个任务"
        />
        <select value={targetStatus} onChange={(event) => setTargetStatus(event.target.value as TaskStatus)}>
          <option value="inbox">收集箱</option>
          <option value="planned_tomorrow">明日计划</option>
          <option value="today_active">今日执行</option>
        </select>
        <button className="button compact" type="submit">
          <Plus size={17} aria-hidden="true" />
          新增
        </button>
      </form>

      <section className="desktop-board" aria-label="任务看板">
        {columns.map(({ id, title: columnTitle, status, icon: Icon }) => {
          const tasks = sortTasks(
            visibleTasks.filter((task) =>
              id === 'today' ? task.status === 'today_active' || task.status === 'in_progress' : task.status === status,
            ),
          )

          return (
            <div className="desktop-column" key={id}>
              <div className="desktop-column-heading">
                <Icon size={19} aria-hidden="true" />
                <h2>{columnTitle}</h2>
                <span>{tasks.length}</span>
              </div>

              <div className="desktop-task-list">
                {tasks.map((task) => (
                  <article className="desktop-task-card" key={task.id}>
                    <div>
                      <strong>{task.title}</strong>
                      <span>
                        <Timer size={14} aria-hidden="true" />
                        {task.completedPomodoros}/{task.estimatedPomodoros}
                      </span>
                    </div>
                    <div className="desktop-task-actions">
                      {task.status !== 'in_progress' && (
                        <button type="button" title="开始任务" onClick={() => startTask(task.id)}>
                          <Play size={16} aria-hidden="true" />
                        </button>
                      )}
                      {task.status !== 'today_active' && task.status !== 'in_progress' && (
                        <button type="button" title="移到今日" onClick={() => moveTask(task.id, 'today_active')}>
                          <ListTodo size={16} aria-hidden="true" />
                        </button>
                      )}
                      {task.status !== 'planned_tomorrow' && (
                        <button type="button" title="移到明日" onClick={() => moveTask(task.id, 'planned_tomorrow')}>
                          <CalendarDays size={16} aria-hidden="true" />
                        </button>
                      )}
                      {task.status !== 'inbox' && (
                        <button type="button" title="移回收集箱" onClick={() => moveTask(task.id, 'inbox')}>
                          <RotateCcw size={16} aria-hidden="true" />
                        </button>
                      )}
                      <button type="button" title="完成任务" onClick={() => completeTask(task.id)}>
                        <Check size={16} aria-hidden="true" />
                      </button>
                      <button type="button" title="归档任务" onClick={() => softDeleteTask(task.id)}>
                        <Archive size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}

                {tasks.length === 0 && <div className="desktop-empty">暂无任务</div>}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

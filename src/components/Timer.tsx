import { useEffect, useMemo, useState } from 'react'
import { formatDuration } from '../utils/date'

type TimerProps = {
  seconds: number
  running: boolean
  countDown?: boolean
  onFinish?: () => void
}

export default function Timer({ seconds, running, countDown = false, onFinish }: TimerProps) {
  const [value, setValue] = useState(seconds)
  const display = useMemo(() => formatDuration(value), [value])

  useEffect(() => {
    setValue(seconds)
  }, [seconds])

  useEffect(() => {
    if (!running) return undefined

    const timer = window.setInterval(() => {
      setValue((current) => {
        if (!countDown) return current + 1
        if (current <= 1) {
          window.clearInterval(timer)
          onFinish?.()
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [countDown, onFinish, running])

  return <span className="timer-readout">{display}</span>
}

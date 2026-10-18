import type { TrainingRecord } from '../types/training'

export type GridSize = 4 | 5
export type NumberMode = 'search' | 'grouped' | 'fullPath'
export const NUMBER_PROTOCOL = 'number-training-v1'
export const TRAINING_THEME = 'calm-teal-v1'

export function makeNumberLayout(size: GridSize): number[] {
  const numbers = Array.from({ length: size * size }, (_, index) => index + 1)
  for (let index = numbers.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[numbers[index], numbers[other]] = [numbers[other], numbers[index]]
  }
  return numbers
}

export function isNumberLayout(numbers: number[]): boolean {
  return [16, 25].includes(numbers.length) && new Set(numbers).size === numbers.length &&
    numbers.every((number) => Number.isInteger(number) && number >= 1 && number <= numbers.length)
}

export function groupRange(groupIndex: number, size: GridSize): number[] {
  return Array.from({ length: size }, (_, index) => groupIndex * size + index + 1)
}

export function trainingEnvironment(): string {
  const width = window.innerWidth < 600 ? 'compact' : 'wide'
  const pointer = window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine'
  return `${width}:${pointer}:${TRAINING_THEME}`
}

export function numberMetrics(numbers: number[], mode: NumberMode, totalMs: number, environment: string, repeatedLayout: boolean) {
  return {
    protocolId: NUMBER_PROTOCOL,
    boardSize: Math.sqrt(numbers.length),
    mode,
    totalMs: Math.round(totalMs),
    timingScope: mode === 'search' ? 'search' : 'observation-and-recall',
    environment,
    themeId: TRAINING_THEME,
    repeatedLayout,
  }
}

export function comparableNumberRecords(records: TrainingRecord[], participantId: string, installationId: string, mode: NumberMode, size: GridSize, environment: string) {
  return records.filter((record) => record.participantId === participantId && record.installationId === installationId && record.extra?.protocolId === NUMBER_PROTOCOL &&
    record.extra?.mode === mode && record.extra?.boardSize === size && record.extra?.environment === environment &&
    record.extra?.repeatedLayout === false && typeof record.extra?.totalMs === 'number' && Number.isFinite(record.extra.totalMs) &&
    record.extra.totalMs > 0).sort((a, b) => a.date.localeCompare(b.date))
}

const median = (numbers: number[]) => numbers.slice().sort((a, b) => a - b)[Math.floor(numbers.length / 2)]

export function improvementSummary(records: TrainingRecord[]): { baselineMs: number; recentMs: number; percent: number } | null {
  const clean = records.filter((record) => record.errors === 0)
  if (clean.length < 6) return null
  const baselineMs = median(clean.slice(0, 3).map((record) => Number(record.extra?.totalMs)))
  const recentMs = median(clean.slice(-3).map((record) => Number(record.extra?.totalMs)))
  if (!Number.isFinite(baselineMs) || !Number.isFinite(recentMs) || baselineMs <= 0 || recentMs <= 0) return null
  return { baselineMs, recentMs, percent: Math.round((baselineMs - recentMs) / baselineMs * 1000) / 10 }
}

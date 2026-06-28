import type { AttentionGame, Difficulty, GameCategory } from '../types/training'

export const gameCategoryLabels: Record<GameCategory, string> = {
  visualSearch: '视觉搜索',
  conflictControl: '冲突控制',
  inhibition: '干扰抑制',
  reactionControl: '反应控制',
}

export const gameDifficultyLabels: Record<Difficulty, string> = {
  easy: '入门',
  medium: '中等',
  hard: '进阶',
}

export const games: AttentionGame[] = [
  {
    id: 'symbol-hunter',
    name: 'Symbol Hunter 符号划消',
    category: 'visualSearch',
    duration: '60 秒',
    difficulty: 'easy',
    goal: '训练视觉搜索、选择性注意和持续注意。',
    description: '在相似符号中快速找出目标符号，记录正确、错误、漏点与准确率。',
    metrics: ['正确数', '错误数', '漏点数', '准确率'],
    gameType: 'symbolHunter',
  },
  {
    id: 'color-conflict',
    name: 'Color Conflict 色词冲突',
    category: 'conflictControl',
    duration: '20 题',
    difficulty: 'medium',
    goal: '训练抗干扰和选择性注意。',
    description: '选择文字的字体颜色，而不是文字含义，观察反应时和冲突题准确率。',
    metrics: ['平均反应时', '错误数', '连续正确数', '冲突题正确率'],
    gameType: 'colorConflict',
  },
  {
    id: 'focus-arrow',
    name: 'Focus Arrow 中心箭头',
    category: 'inhibition',
    duration: '24 题',
    difficulty: 'medium',
    goal: '训练干扰抑制和反应控制。',
    description: '只判断中间箭头方向，忽略两侧箭头带来的干扰。',
    metrics: ['平均反应时', '错误数', '一致题正确率', '冲突题正确率'],
    gameType: 'focusArrow',
  },
  {
    id: 'impulse-brake',
    name: 'Impulse Brake 冲动刹车',
    category: 'reactionControl',
    duration: '30 轮',
    difficulty: 'hard',
    goal: '训练冲动抑制和持续注意。',
    description: 'Go 刺激出现时快速点击，No-Go 刺激出现时保持不动。',
    metrics: ['反应时', '漏点次数', '误点次数', '冲动错误率'],
    gameType: 'impulseBrake',
  },
]

export function getGameById(id: string): AttentionGame | undefined {
  return games.find((game) => game.id === id)
}

import { categoryLabels } from '../data/methods'
import type { TrainingCategory } from '../types/training'

type CategoryFilter = TrainingCategory | 'all'

type CategoryTabsProps = {
  active: CategoryFilter
  onChange: (category: CategoryFilter) => void
}

const categories: CategoryFilter[] = [
  'all',
  'memory',
  'focusTimer',
  'startup',
  'antiDistraction',
  'breathing',
  'planning',
]

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="训练分类">
      {categories.map((category) => (
        <button
          key={category}
          className={active === category ? 'tab active' : 'tab'}
          type="button"
          onClick={() => onChange(category)}
        >
          {category === 'all' ? '全部核心训练' : categoryLabels[category]}
        </button>
      ))}
    </div>
  )
}

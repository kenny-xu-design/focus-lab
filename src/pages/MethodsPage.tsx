import { useMemo, useState } from 'react'
import CategoryTabs from '../components/CategoryTabs'
import MethodCard from '../components/MethodCard'
import { methods } from '../data/methods'
import type { TrainingCategory } from '../types/training'

type CategoryFilter = TrainingCategory | 'all'

export default function MethodsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const visibleMethods = useMemo(
    () => (activeCategory === 'all' ? methods : methods.filter((method) => method.category === activeCategory)),
    [activeCategory],
  )

  return (
    <div className="page-stack">
      <section className="page-header">
        <span className="eyebrow">核心训练方法</span>
        <h1>6 个可以长期记录的专注训练</h1>
        <p>第一版只保留高频、轻量、可操作的核心训练，适合作为学习、写作、设计和深度工作前的专注热身与自律辅助。</p>
      </section>
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      <section className="method-grid">
        {visibleMethods.map((method) => (
          <MethodCard method={method} key={method.id} />
        ))}
      </section>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CategoryTabs from '../components/CategoryTabs'
import MethodCard from '../components/MethodCard'
import LearningExtensions from '../components/LearningExtensions'
import { methods } from '../data/methods'
import type { TrainingCategory } from '../types/training'

type CategoryFilter = TrainingCategory | 'all'

export default function MethodsPage() {
  const location = useLocation()
  useEffect(() => {
    if (location.hash === '#learning-extensions') document.getElementById('learning-extensions')?.scrollIntoView()
  }, [location.hash])
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
        <p>保留高频、轻量、可操作的核心训练，并补充学习与记忆方法，按需要选择练习。</p>
        <Link className="text-link" to="#learning-extensions">查看 4 种学习与记忆拓展 →</Link>
      </section>
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      <section className="method-grid">
        {visibleMethods.map((method) => (
          <MethodCard method={method} key={method.id} />
        ))}
      </section>
      <LearningExtensions />
    </div>
  )
}

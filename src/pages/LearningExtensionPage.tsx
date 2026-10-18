import { useEffect } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import RecallPractice from '../components/RecallPractice'
import { learningExtensions } from '../data/learningExtensions'

export default function LearningExtensionPage() {
  const { id } = useParams()
  const location = useLocation()
  const method = learningExtensions.find((entry) => entry.id === id)
  useEffect(() => {
    if (location.hash === '#practice') document.getElementById('practice')?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [id, location.hash])
  if (!method) return <Navigate to="/methods" replace />
  return (
    <div className="page-stack extension-page">
      <Link className="text-link" to="/methods#learning-extensions">← 返回拓展方法</Link>
      <section className="page-header"><span className="eyebrow">{method.kind}</span><h1>{method.name}</h1><p>{method.subtitle}</p></section>
      <section className="glass-card extension-guide"><h2>怎么用</h2><ol>{method.steps.map((step) => <li key={step}>{step}</li>)}</ol><h3>效果与边界</h3><p>{method.boundary}</p><a className="text-link" href={method.source.url} target="_blank" rel="noreferrer">查看研究来源：{method.source.label}</a>{method.action && <Link className="button" to={method.action.to}>{method.action.label}</Link>}</section>
      {method.practice && <RecallPractice key={method.id} strategy={method.practice} />}
    </div>
  )
}

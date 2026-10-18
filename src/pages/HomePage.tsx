import { ArrowRight, BrainCircuit, Clock3, Gamepad2, ListChecks, MonitorUp, Play, Radar, ShieldCheck, TimerReset, Wind } from 'lucide-react'
import { Link } from 'react-router-dom'
import { games } from '../data/games'
import { categoryLabels, methods } from '../data/methods'
import LearningExtensions from '../components/LearningExtensions'

const icons = [Radar, TimerReset, Play, ShieldCheck, Wind, ListChecks]

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Focus Lab｜专注力训练工具箱</span>
          <h1>Focus Lab</h1>
          <p className="lead">一个面向学习、写作、设计与深度工作的专注力训练工具箱</p>
          <p>
            通过视觉搜索、空间记忆、专注计时、任务启动、分心记录和注意力小游戏，帮助用户建立更稳定的专注习惯。它适合作为学习和工作前的轻量训练与注意力反馈工具。
          </p>
          <div className="hero-actions">
            <Link className="button" to="/training/number-path-memory">
              <Play size={18} aria-hidden="true" />
              开始今日训练
            </Link>
            <Link className="button ghost" to="/methods">
              查看训练方法
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button ghost" to="/launcher">
              <MonitorUp size={18} aria-hidden="true" />
              打开启动器
            </Link>
            <Link className="button ghost" to="/games">
              <Gamepad2 size={18} aria-hidden="true" />
              注意力小游戏
            </Link>
          </div>
        </div>
        <div className="hero-panel glass-card" aria-label="训练概览">
          <div className="focus-ring">
            <span>6</span>
            <small>核心训练</small>
          </div>
          <div className="mini-metrics">
            <span>空间记忆</span>
            <span>专注计时</span>
            <span>分心记录</span>
            <span>注意反馈</span>
          </div>
        </div>
      </section>

      <section className="glass-card training-path-intro" aria-label="数字训练路线">
        <div><span className="eyebrow">从搜索到记忆</span><h2>先找到，再记住。</h2><p>基础级数字全程可见；进阶级观察后翻盖。4×4 与 5×5 自由选择，原有训练与小游戏继续保留。</p></div>
        <Link className="button" to="/training/number-path-memory">选择难度<ArrowRight size={18} aria-hidden="true" /></Link>
      </section>

      <section>
        <div className="section-heading">
          <span className="eyebrow">核心训练</span>
          <h2>把专注拆成少量、可坚持的练习</h2>
        </div>
        <div className="tool-entry-grid six-grid">
          {methods.map((method, index) => {
            const Icon = icons[index] ?? BrainCircuit
            return (
              <Link className="glass-card tool-entry" key={method.id} to={`/training/${method.id}`}>
                <Icon size={24} aria-hidden="true" />
                <span>{categoryLabels[method.category]}</span>
                <strong>{method.name}</strong>
                <small>{method.goal}</small>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <span className="eyebrow">注意力小游戏</span>
          <h2>短时热身与反馈，不做过度游戏化</h2>
        </div>
        <div className="tool-entry-grid">
          {games.map((game) => (
            <Link className="glass-card tool-entry" key={game.id} to={`/games/${game.id}`}>
              <Clock3 size={22} aria-hidden="true" />
              <span>{game.duration}</span>
              <strong>{game.name.replace(/^[A-Za-z ]+ /, '')}</strong>
              <small>{game.goal}</small>
            </Link>
          ))}
        </div>
      </section>
      <LearningExtensions />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import { comparableNumberRecords, improvementSummary, trainingEnvironment, type GridSize, type NumberMode } from '../utils/numberTraining'
import { trainingBackup } from '../utils/trainingPersistence'

const modeLabels: Record<NumberMode, string> = { search: '基础搜索', grouped: '进阶分组记忆', fullPath: '进阶完整记忆' }

export default function TrainingProgress() {
  const records = useTrainingStore((state) => state.records)
  const participant = useTrainingStore((state) => state.participant)
  const installationId = useTrainingStore((state) => state.installationId)
  const setNickname = useTrainingStore((state) => state.setNickname)
  const [nickname, setNicknameInput] = useState(participant.nickname)
  const [mode, setMode] = useState<NumberMode>('search')
  const [size, setSize] = useState<GridSize>(5)
  const [saved, setSaved] = useState(false)
  const [environment, setEnvironment] = useState(trainingEnvironment)
  useEffect(() => {
    const resize = () => setEnvironment(trainingEnvironment())
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  const comparable = comparableNumberRecords(records, participant.id, installationId, mode, size, environment)
  const summary = improvementSummary(comparable)
  const points = comparable.slice(-30)
  const values = points.map((record) => Number(record.extra?.totalMs) / 1000)
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1)
  const position = (index: number) => ({ x: values.length === 1 ? 300 : 12 + index / (values.length - 1) * 576,
    y: 145 - (values[index] - min) / (max - min) * 125 })

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(trainingBackup(useTrainingStore.getState()), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `focus-lab-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="glass-card training-progress" aria-label="个人练习档案与进步曲线">
      <div className="section-heading"><span className="eyebrow">个人练习档案</span><h2>看看同一项练习的变化</h2></div>
      <form className="profile-controls" onSubmit={(event) => { event.preventDefault(); setNickname(nickname); setSaved(true) }}>
        <label className="field-label" htmlFor="training-nickname">档案昵称</label>
        <input id="training-nickname" className="text-input" value={nickname} maxLength={40} onChange={(event) => { setNicknameInput(event.target.value); setSaved(false) }} />
        <button className="button compact" type="submit">保存昵称</button>
        <button className="button ghost compact" type="button" onClick={exportBackup}>导出全部备份</button>
      </form>
      {saved && <p role="status">昵称已保存在此浏览器。</p>}
      <p>当前档案编号 {participant.id.slice(0, 8)} · 仅保存在此浏览器，尚未云端同步。清理网站数据或换浏览器会失去本地档案，请定期导出备份。同一浏览器共用此档案。</p>
      <div className="progress-filters">
        <label>训练项目<select aria-label="训练项目" className="text-input" value={mode} onChange={(event) => setMode(event.target.value as NumberMode)}>{Object.entries(modeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>方格尺寸<select aria-label="方格尺寸" className="text-input" value={size} onChange={(event) => setSize(Number(event.target.value) as GridSize)}><option value={4}>4×4</option><option value={5}>5×5</option></select></label>
      </div>
      <p>完成用时（秒） · 最近 {points.length} 轮新布局 · 相同浏览器安装与显示条件。圆点表示零错误，三角表示有错误。</p>
      {points.length ? <>
        <div className="curve-range"><span>0 秒</span><span>上限 {max.toFixed(1)} 秒</span></div>
        <svg className="progress-chart" viewBox="0 0 600 160" role="img" aria-label={`${modeLabels[mode]} ${size}乘${size}，按时间从左到右排列的完成用时。详细数据见下表。`}>
          <path d="M12 145H588" stroke="currentColor" opacity="0.25" />
          <polyline points={points.map((_, index) => { const p = position(index); return `${p.x},${p.y}` }).join(' ')} fill="none" stroke="currentColor" strokeWidth="2" />
          {points.map((record, index) => { const p = position(index); return record.errors === 0 ? <circle key={record.id} cx={p.x} cy={p.y} r="4" fill="currentColor"><title>{values[index].toFixed(1)} 秒，0 错误</title></circle> : <path key={record.id} d={`M${p.x} ${p.y - 5}l5 9h-10Z`} fill="currentColor"><title>{values[index].toFixed(1)} 秒，{record.errors} 错误</title></path> })}
        </svg>
        <div className="progress-table"><table><caption>最近五轮</caption><thead><tr><th scope="col">完成日期</th><th scope="col">用时</th><th scope="col">错误</th></tr></thead><tbody>{points.slice(-5).map((record) => <tr key={record.id}><td>{new Date(record.date).toLocaleString()}</td><td>{(Number(record.extra?.totalMs) / 1000).toFixed(1)} 秒</td><td>{record.errors}</td></tr>)}</tbody></table></div>
      </> : <p className="empty-state">当前条件下还没有可比较的新布局记录。旧记录与复练记录仍保留在下方明细中。</p>}
      {summary ? <p><strong>{summary.percent >= 0 ? `完成用时缩短 ${summary.percent}%` : `完成用时增加 ${Math.abs(summary.percent)}%`}</strong>：前 3 轮与最近 3 轮零错误新布局的中位数，{(summary.baselineMs / 1000).toFixed(1)} → {(summary.recentMs / 1000).toFixed(1)} 秒。</p> : <p>至少完成 6 轮零错误的新布局后，再比较前 3 轮与后 3 轮用时，避免单轮偶然结果。</p>}
      <small>曲线反映此任务内的表现，不证明日常记忆力或学习效率提升。旧记录没有新规则与身份信息，不自动归属或补算。</small>
    </section>
  )
}

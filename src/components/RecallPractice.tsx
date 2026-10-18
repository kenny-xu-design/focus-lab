import { useRef, useState } from 'react'
import { useTrainingStore } from '../store/useTrainingStore'
import { checkRecall, recallItems } from '../utils/recallPractice'

export default function RecallPractice({ strategy }: { strategy: 'retrieval' | 'loci' }) {
  const loci = strategy === 'loci'
  const addRecord = useTrainingStore((state) => state.addRecord)
  const [phase, setPhase] = useState<'setup' | 'study' | 'recall' | 'result'>('setup')
  const [material, setMaterial] = useState(loci ? '苹果\n火车\n雨伞\n月亮\n钥匙' : '海洋\n桥梁\n森林\n风筝\n杯子\n星星\n石头\n铃铛')
  const [route, setRoute] = useState('门口\n玄关\n沙发\n书桌\n窗边')
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<ReturnType<typeof checkRecall> | null>(null)
  const startedAt = useRef(0)
  const saved = useRef(false)
  const items = recallItems(material)
  const places = recallItems(route)

  const start = () => {
    if (items.length < 3 || items.length > 12 || items.some((item) => item.length > 40)) { setMessage('请输入 3–12 个不同词条，每条不超过 40 字。'); return }
    if (loci && places.length < items.length) { setMessage('请为每个词条准备一个不同的位置。'); return }
    setMessage(''); setAnswer(''); setResult(null); saved.current = false; startedAt.current = performance.now(); setPhase('study')
  }

  const finish = () => {
    if (saved.current || phase !== 'recall') return
    if (!answer.trim()) { setMessage('先写下你想起的内容，再核对。'); return }
    saved.current = true
    const checked = checkRecall(items, answer)
    setResult(checked); setMessage(''); setPhase('result')
    addRecord({ id: crypto.randomUUID(), type: 'training', methodId: `extension-${strategy}`,
      methodName: loci ? '位置联想回忆练习' : '主动回忆词条练习', date: new Date().toISOString(),
      durationSeconds: Math.max(1, Math.round((performance.now() - startedAt.current) / 1000)),
      result: `准确回忆 ${checked.correct.length}/${items.length}，多写 ${checked.extra.length}`,
      extra: { protocolId: 'recall-practice-v1', strategy, itemCount: items.length, correctCount: checked.correct.length,
        missingCount: checked.missing.length, extraCount: checked.extra.length } })
  }

  return (
    <section id="practice" className="glass-card recall-practice" aria-label={loci ? '位置联想练习' : '主动回忆练习'}>
      <span className="eyebrow">动手练习</span><h2>{loci ? '沿着路线，找回词条' : '先回忆，再核对'}</h2>
      {phase === 'setup' && <>
        <label htmlFor="recall-material" className="field-label">要记的词条（每行一个，也可使用示例）</label><textarea id="recall-material" className="text-input textarea" value={material} maxLength={1000} onChange={(event) => setMaterial(event.target.value)} />
        {loci && <><label htmlFor="recall-route" className="field-label">熟悉路线上的位置（顺序固定，每行一个）</label><textarea id="recall-route" className="text-input textarea" value={route} maxLength={1000} onChange={(event) => setRoute(event.target.value)} /></>}
        <button className="button" type="button" onClick={start}>开始观察</button>
      </>}
      {phase === 'study' && <><p>{loci ? '为每个位置与词条构想一个联想画面，再准备回忆。' : '观察词条，准备好后隐藏内容。没有倒计时，不必抢速度。'}</p><ol className="recall-material">{items.map((item, index) => <li key={item}>{loci && <strong>{places[index]} → </strong>}{item}</li>)}</ol><button className="button" type="button" onClick={() => setPhase('recall')}>隐藏材料，开始回忆</button></>}
      {phase === 'recall' && <><p>材料已隐藏。{loci ? '在脑中沿刚才的路线走一遍。' : '不看材料，写下记得的词条。'}</p><label htmlFor="recall-answer" className="field-label">你的回忆（每行一个）</label><textarea id="recall-answer" className="text-input textarea" value={answer} maxLength={1000} onChange={(event) => setAnswer(event.target.value)} /><button className="button" type="button" onClick={finish}>核对并保存本轮</button></>}
      {phase === 'result' && result && <div aria-live="polite"><h3>准确回忆 {result.correct.length} / {items.length}</h3><p>遗漏：{result.missing.join('、') || '无'}。多写：{result.extra.join('、') || '无'}。</p><p>本轮已保存到个人记录。原始词条、位置和答案没有写入训练记录。</p><button className="button ghost" type="button" onClick={() => { setPhase('setup'); setAnswer(''); setResult(null) }}>换材料再练</button></div>}
      {message && <p role="alert">{message}</p>}
      <small>按词条文字核对，忽略重复作答与大小写，不判断同义表达、语义理解或一般记忆能力。结果不自动证明训练有效。</small>
    </section>
  )
}

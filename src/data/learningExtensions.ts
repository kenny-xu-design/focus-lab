export type LearningExtension = {
  id: string
  name: string
  subtitle: string
  kind: string
  steps: string[]
  boundary: string
  source: { label: string; url: string }
  practice?: 'retrieval' | 'loci'
  action?: { label: string; to: string }
}

export const learningExtensions: LearningExtension[] = [
  {
    id: 'retrieval', name: '主动回忆', subtitle: '合上材料，先自己想，再核对。', kind: '方法指南＋回忆练习', practice: 'retrieval',
    steps: ['读完一小段材料后，合上书或隐藏内容。', '不看原文，写下记得的要点，或回答自己提出的问题。', '重新打开材料核对，修正遗漏和错误，之后再次尝试回忆。'],
    boundary: '支持的是所学内容的记忆保持；词条练习只做精确匹配，不能评判语义理解或一般记忆能力。',
    source: { label: 'Karpicke 与 Blunt，2011 · 主动提取与学习', url: 'https://ctl.yale.edu/sites/default/files/files/KarpickeBlunt2011.pdf' },
  },
  {
    id: 'spacing', name: '间隔复习', subtitle: '把复习分散到多天，让回忆跨过时间。', kind: '方法指南',
    steps: ['把要学的材料拆成可回忆的小单元，先检查今天能否独立答出。', '将下一次复习放到之后的某一天，复习时先回忆，再查看答案。', '根据遗忘情况和目标日期调整间隔；例如第 1、3、7 天可作为起点，并非固定最优安排。'],
    boundary: '间隔取决于内容、熟练度和希望保留多久。本页提供方法，不会创建提醒或自动排期。',
    source: { label: 'Cepeda 等，2006 · 分散练习元分析', url: 'https://pubmed.ncbi.nlm.nih.gov/16719566/' },
    action: { label: '用主动回忆检查复习结果', to: '/learn/retrieval#practice' },
  },
  {
    id: 'loci', name: '记忆宫殿', subtitle: '把内容放进你熟悉的路线。', kind: '方法指南＋位置联想练习', practice: 'loci',
    steps: ['选一条熟悉且顺序明确的路线，例如门口、玄关、沙发、书桌、窗边。', '每个位置对应一个待记内容，为它构想具体、有区别的联想画面。', '隐藏材料，在脑中沿路线走一遍，写下想起的内容，再核对。'],
    boundary: '适合清单与顺序材料，仍需要练习。这是位置联想的入门体验，不是对一般智力或理解能力的测试。',
    source: { label: 'Dresler 等，2017 · 位置记忆训练实验', url: 'https://pubmed.ncbi.nlm.nih.gov/28279356/' },
  },
  {
    id: 'mindfulness', name: '正念专注', subtitle: '发现走神，再温和地回到当前对象。', kind: '方法指南＋现有呼吸练习',
    steps: ['以自然呼吸的感觉为注意对象，从自己能承受的短时间开始。', '察觉念头、声音或走神时，承认它出现了，再把注意带回来。', '持续练习，观察觉察与返回的过程，不以“完全不走神”为目标。'],
    boundary: '系统训练对部分注意指标有小幅改善，但存在个体与研究差异；一次短练习不等同于研究中的完整课程。',
    source: { label: '2023 · 111 项随机对照试验元分析', url: 'https://pubmed.ncbi.nlm.nih.gov/37578065/' },
    action: { label: '进入数息／呼吸训练', to: '/training/breathing-count' },
  },
]

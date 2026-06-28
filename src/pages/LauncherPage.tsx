import TrainingLauncher from '../components/TrainingLauncher'

export default function LauncherPage() {
  return (
    <div className="page-stack">
      <section className="page-header">
        <span className="eyebrow">快速启动</span>
        <h1>桌面启动器</h1>
        <p>一个覆盖六个核心训练的小程序入口。适合放在日常工作流的第一屏，用来快速开始今日训练。</p>
      </section>
      <TrainingLauncher />
    </div>
  )
}

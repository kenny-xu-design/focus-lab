import TrainingLauncher from '../components/TrainingLauncher'

export default function LauncherPage() {
  return (
    <div className="page-stack">
      <section className="page-header">
        <span className="eyebrow">快速启动</span>
        <h1>训练启动器</h1>
        <p>手机与电脑共用的六个核心训练入口，可安装到主屏幕或桌面，快速开始今日训练。</p>
      </section>
      <TrainingLauncher />
    </div>
  )
}

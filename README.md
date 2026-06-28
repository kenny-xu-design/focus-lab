# Focus Lab｜专注力训练工具箱

Focus Lab 是一个面向学生、设计师、写作者和深度工作者的专注力训练网站。它不是医疗工具，也不是脑力游戏百科，而是把少量高频、容易坚持的训练做成可操作、可记录的本地 Web 工具，用于专注热身、自律启动、分心记录和注意力反馈。

## 技术栈

- React
- Vite
- TypeScript
- React Router
- Zustand
- localStorage
- PWA
- 普通 CSS

## 功能模块

- 首页：展示项目定位、6 个核心训练入口和 4 个注意力小游戏入口。
- 桌面启动器：覆盖 6 个核心训练，支持直接启动、查看详情和今日完成状态。
- 弹窗启动页：适合 Chrome / Edge App 模式打开的紧凑入口。
- 核心训练方法页：只保留 6 个核心训练方法，支持筛选、查看详情和开始训练。
- 方法详情页：统一展示适合人群、训练目标、推荐时长、训练步骤、进阶方式和注意事项。
- 核心训练页：包含 25 数字路径记忆、番茄专注计时、5 分钟启动法、分心记录法、数息 / 呼吸训练、如果—那么计划。
- 注意力小游戏页：包含符号划消、色词冲突、中心箭头、冲动刹车。
- 记录页：展示核心训练记录、小游戏记录、数字布局记录、连续训练天数、最近 7 天记录和如果—那么计划。

## 本地运行

```bash
npm install
npm run dev
```

Windows 下也可以双击项目根目录中的 `Focus Lab Launcher.cmd`，它会启动本地服务并打开桌面启动器页面。

如果想要更像弹窗小程序，可以双击 `Focus Lab Popup.cmd`。它会用 Chrome / Edge 的 App 模式打开 `/popup`，窗口更紧凑，只保留 6 个核心训练入口、今日次数和最近数字布局回退。

## PWA 安装

项目已支持 PWA：

- 浏览器会读取 `manifest.webmanifest`。
- 页面会注册 `sw.js`，支持基础离线缓存和桌面安装条件。
- 导航栏和弹窗页提供“安装应用”按钮。
- 安装后默认从 `/popup` 打开，作为紧凑桌面训练入口。

如果浏览器暂时没有显示安装提示，可以先访问 `/popup`，等待页面加载完成后，再使用浏览器地址栏右侧的安装按钮。

## 构建

```bash
npm run build
```

## 目录结构

```txt
src/
  main.tsx
  App.tsx
  styles/
    global.css
  pages/
    HomePage.tsx
    LauncherPage.tsx
    PopupPage.tsx
    MethodsPage.tsx
    MethodDetailPage.tsx
    TrainingPage.tsx
    GamesPage.tsx
    GamePlayPage.tsx
    RecordsPage.tsx
  components/
    Layout.tsx
    Navbar.tsx
    PwaInstallButton.tsx
    TrainingLauncher.tsx
    MethodCard.tsx
    GameCard.tsx
    NumberPathMemory.tsx
    PomodoroTimer.tsx
    StartupTraining.tsx
    DistractionLogger.tsx
    BreathingTraining.tsx
    ImplementationPlanTool.tsx
    SymbolHunter.tsx
    ColorConflict.tsx
    FocusArrow.tsx
    ImpulseBrake.tsx
    RecordSummary.tsx
  data/
    methods.ts
    games.ts
  store/
    useTrainingStore.ts
  types/
    training.ts
  utils/
    date.ts
    shuffle.ts
    stats.ts
    registerServiceWorker.ts
public/
  manifest.webmanifest
  sw.js
  icons/
    focus-lab-icon.svg
scripts/
  start-focus-lab.ps1
  start-focus-lab-popup.ps1
```


## 后续可扩展方向

- 为小游戏增加更完整的倒计时、难度阶梯和趋势图。
- 支持导出本地记录，方便用户复盘分心模式。
- 增加训练计划模板，让用户按学习、写作、设计等场景组合训练。
- 增加 GitHub Pages 或 Netlify 的自动部署。

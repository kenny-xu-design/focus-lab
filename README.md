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
- 训练启动器：手机与电脑共用，覆盖 6 个核心训练，支持直接启动、查看详情和今日完成状态。
- 弹窗启动页：适合 Chrome / Edge App 模式打开的紧凑入口。
- 核心训练方法页：保留 6 个核心训练方法，支持筛选、查看详情和开始训练；另设学习与记忆拓展区。
- 方法详情页：统一展示适合人群、训练目标、推荐时长、训练步骤、进阶方式和注意事项。
- 核心训练页：包含数字搜索与顺序记忆（基础舒尔特 / 进阶翻盖记忆，均可选 4×4 / 5×5）、番茄专注计时、5 分钟启动法、分心记录法、数息 / 呼吸训练、如果—那么计划。
- 注意力小游戏页：包含符号划消、色词冲突、中心箭头、冲动刹车。
- 学习与记忆拓展：主动回忆、间隔复习、记忆宫殿、正念专注，提供步骤、效果边界和研究来源。主动回忆与位置联想提供交互练习；正念连接现有呼吸训练。
- 记录页：展示核心训练及拓展实践记录、小游戏记录、数字布局记录、连续训练天数、最近 7 天记录和如果—那么计划。

## 数字训练与个人档案

- 基础级：数字全程可见的舒尔特搜索。
- 进阶级：保留分组翻盖与完整顺序记忆，4×4 每组 4 个，5×5 每组 5 个。
- 记录页提供本地档案昵称、JSON 备份导出、按模式和尺寸分开的新题曲线。旧记录继续保留，不补造归属或新精度。
- 记录仍只保存在当前浏览器，尚无账号登录和云同步；换浏览器或清理网站数据不会自动恢复。多人共用浏览器也会共用档案。
- 页面采用近白训练区与低饱和蓝绿色导航，主要文本配对经过对比度检查；不承诺颜色能提升记忆力。
- [配色证据与 Cloudflare 数据评估](docs/cloudflare-data-and-color-evidence.md)记录未来身份、研究授权、保存和备份方案。

相关测试：`node --test tests/number-training.test.cjs tests/recall-practice.test.cjs`。

## 手机适配与本地预览

- Web 页面优先适配手机：导航两行展示，卡片单列，按钮至少 44px 高；数字训练在 320px 窄屏仍可展示完整 5×5 表。
- 页面不额外提供设备预览栏；使用浏览器自带的响应式设备预览，或缩窄浏览器面板查看手机排版。
- 两种新回忆练习支持自定义词条、观察、隐藏、作答与核对。只保存本轮用时和数量结果，不持久化原始词条、位置与答案；按文字核对，不判断语义或一般记忆力。

## 本地运行

```bash
npm install
npm run dev
```

Windows 下也可以双击项目根目录中的 `Focus Lab Launcher.cmd`，它会启动本地服务并打开桌面启动器页面。

如果想要更像弹窗小程序，可以双击 `Focus Lab Popup.cmd`。它会用 Chrome / Edge 的 App 模式打开 `/popup`，窗口更紧凑，只保留 6 个核心训练入口、今日次数和最近数字布局回退。

## PWA 安装

项目以 PWA 方式安装，手机和电脑使用同一份网站，安装后默认打开 `/launcher`，紧凑入口 `/popup` 继续保留。

| 设备 | 安装方式 |
| --- | --- |
| Android | Chrome 打开 HTTPS 网站，点“安装应用”或浏览器菜单中的安装／添加到主屏幕。 |
| iPhone / iPad | Safari 打开 HTTPS 网站，点“分享”→“添加到主屏幕”；如有“作为网页 App 打开”，保持开启。 |
| Windows | Chrome / Edge 打开网站，使用地址栏安装图标或浏览器菜单安装。 |
| Mac | Chrome / Edge 安装；支持网页 App 的 macOS Safari 可用“文件”→“添加到程序坞”。 |

- 按钮在浏览器提供原生提示时触发安装；其余情况提供手动操作说明和可复制的启动器网址，不会一直禁用。
- 提供 192px / 512px PNG、独立 maskable 图标和 180px Apple Touch 图标；固定 manifest `id: /popup` 沿用原启动 URL 的身份，避免仅因新启动入口而创建另一个应用。
- 生产构建会生成包含全部 JS、CSS、HTML 和图标的预存清单。首次联网完成 service worker 安装后，可离线打开启动器、进入训练并保存本地结果；外部研究链接仍需联网。
- 更新在旧应用窗口全部关闭后接管，避免混用两版脚本；只清理本应用的旧缓存，不缓存 API、带 Authorization 的请求或第三方资源。
- 开发模式不注册离线缓存，并注销同源的旧 `/sw.js`，避免缓存干扰热更新。安装及离线验收使用生产预览：

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 5200 --strictPort
```

`127.0.0.1` 仅供当前电脑使用。手机安装需访问发布后的 HTTPS 地址；局域网 HTTP 地址不能等同于可安装的安全站点。应用内浏览器可能没有安装菜单，请在上表的系统浏览器打开。

不同设备、浏览器以及浏览器与安装版之间的本地记录可能互相独立，尚无账号同步。请固定使用同一入口并定期导出备份。

验收命令：先 `npm run build`，再 `node --test tests/number-training.test.cjs tests/recall-practice.test.cjs tests/pwa.test.cjs`。

实现依据：[Chrome 安装条件](https://web.dev/articles/install-criteria)、[PWA 应用身份](https://developer.chrome.com/docs/capabilities/pwa-manifest-id)、[WebKit 主屏幕网页 App](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/)。已完成本地构建和浏览器验收；发布状态以 GitHub 与 Cloudflare 的实际部署记录为准。手机真机和系统级安装后的窗口行为仍需实际设备确认。

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

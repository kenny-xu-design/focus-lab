# Codex Log

This file stores concise summaries of Codex work for this project.

## 2026-07-09

- Created the standard Codex documentation structure.

## 2026-10-18

- 在原数字训练路由增加基础舒尔特搜索与进阶顺序记忆，均支持 4×4/5×5；保留六个核心方法、四个小游戏及旧布局恢复。
- Web 页面采用独立的低饱和蓝绿主题；桌面生产力主题不覆盖。配色是可读性设计，不声称普遍认知增强。
- 增加本地档案/随机安装 ID、完整 JSON 导出、分条件新题曲线。存储结构 v2→v3 保留旧记录，不回填历史身份；未启用任何云端收集。
- 完成 Cloudflare Workers/Pages Functions + D1/R2 的可行性评估；手机型号/浏览器指纹不作为用户身份。详情见 cloudflare-data-and-color-evidence.md。
- `npm run build`、5 项 Node 测试通过；浏览器验证 4×4 基础搜索、错点保存、完整/四组进阶完成、刷新保留、曲线筛选、390px 的 5×5 无横向溢出及旧入口保留。
- 未部署、提交、切换分支或修改项目版本。真实用户云端身份、授权与备份恢复尚待实施。

### 学习拓展与手机优先

- 增加主动回忆、间隔复习、记忆宫殿和正念专注指南；首页、方法页提供入口，方法页可直接跳到拓展区。
- 增加主动回忆词条、位置联想两种交互练习，结果接入原记录；重复输入不重复计分，材料与答案不持久化。原有六项核心训练和四个小游戏保留。
- Web 手机导航改为两行，卡片单列，压缩状态区并保留 44px 触控高度；移除 Web 根节点的固定最小宽度，修复 320px 有滚动条时的内容裁切。
- 开发模式顶部增加桌面/手机预览切换，使用 390px 同源 iframe；切回桌面保留框内路线并重新加载记录。正式构建及桌面生产力页面不显示该工具。
- `npm run build` 通过；`node --test tests/number-training.test.cjs tests/recall-practice.test.cjs` 共 8 项通过。浏览器验证两种练习完整流程、重复答案、遗漏/多写、记录持久保存及预览切换；320px 的数字训练、记录、方法、小游戏、拓展、启动器、呼吸和中心箭头页面无页面横向溢出，5×5 单格约 47px。
- 本轮未部署、提交或修改其他已有桌面模块工作；间隔复习仍为指南，无提醒排期功能。
- 本轮新增：`src/components/LearningExtensions.tsx`、`src/components/LocalViewportPreview.tsx`、`src/components/RecallPractice.tsx`、`src/data/learningExtensions.ts`、`src/pages/LearningExtensionPage.tsx`、`src/utils/recallPractice.ts`、`src/vite-env.d.ts`、`tests/recall-practice.test.cjs`。
- 本轮调整：`src/App.tsx`、`src/components/Layout.tsx`、`src/pages/HomePage.tsx`、`src/pages/MethodsPage.tsx`、`src/pages/GamesPage.tsx`、`src/pages/RecordsPage.tsx`、`src/styles/focus-web.css`、`README.md`、`docs/decisions.md`、本日志。

### 移除页面设备预览栏

- 按后续要求删除 `src/components/LocalViewportPreview.tsx`，解除 `src/components/Layout.tsx` 包装，清理 `src/styles/focus-web.css` 中预览栏、iframe 及导航偏移样式。保留响应式手机排版。
- 同步 `README.md`、`docs/decisions.md` 与本日志，使用浏览器原生设备预览或缩窄面板，不再提供页面内切换选项。
- 执行 `npm run build`、相关文件 `git diff --check`，均通过；刷新内置浏览器 `/records`，确认直接显示网站导航和记录内容，顶部预览栏消失。
- 未提交、未部署；内置浏览器的 DevTools/设备模拟快捷键未在官方文档中得到确认，不能将 Chrome/Edge 的快捷键视为该应用保证支持的功能。

### 手机与电脑安装支持

- 补齐 192/512px PNG、maskable 和 Apple Touch 图标，manifest 固定身份并统一启动 `/launcher`，允许横竖屏；启动器文案覆盖手机与电脑。
- 安装提示改为共享且只消费一次；无自动提示时显示系统浏览器安装说明。兼容 iOS standalone 识别，并仅在 appinstalled / 独立运行状态确认安装。
- 生产构建自动生成完整预缓存清单与内容版本；停止服务器后，实测仍可硬导航到之前未访问的 `/learn/loci`、完成练习，再硬刷新 `/records`，保留 5/5 的本地结果。API、授权请求、第三方资源不缓存，激活只清理本应用缓存。
- 320px 实测完整启动器、紧凑入口及安装说明无横向溢出，六个训练入口保留。临时浏览器尺寸已复原。
- 执行 `npm run build` 和 `node --test tests/number-training.test.cjs tests/recall-practice.test.cjs tests/pwa.test.cjs`，构建及 14 项测试通过。新增测试覆盖产物图标尺寸、预缓存完整性、离线新路由、缓存隔离、安装事件共享及 iOS 独立窗口识别。
- 修改：`public/manifest.webmanifest`、`public/sw.js`、`index.html`、`vite.config.ts`、`src/utils/registerServiceWorker.ts`、`src/components/PwaInstallButton.tsx`、`src/components/TrainingLauncher.tsx`、`src/pages/LauncherPage.tsx`、`src/styles/focus-web.css`、`README.md`、`docs/decisions.md`、本日志。新增：`public/icons/` 下四个 PNG、`scripts/pwa-build.js`、`scripts/pwa-build.d.ts`、`src/utils/pwaInstall.ts`、`tests/pwa.test.cjs`。
- 未提交或部署，未在用户系统执行最终安装。手机安装需要发布后的 HTTPS 地址；手机真机、不同系统安装后的窗口行为仍需实际设备验收，跨设备数据同步未实现。

### GitHub 发布准备

- 用户明确要求提交 GitHub 并检查 Cloudflare。只选择本轮 Web 训练、拓展方法、移动排版、PWA、配套文档和测试；未包含工作区原有桌面番茄钟、主题及相关全局 CSS 的未完成改动。
- 将暂存区导出到项目内忽略目录 `.cache/release-validation` 验证，未创建 worktree、切换分支或移动原项目。该待发布版本独立执行 `npm run build` 与全部 14 项测试通过。
- GitHub Actions 的 Build 工作流补充训练和 PWA 产物测试，确保远端对实际提交版本执行同样检查。

### GitHub 与 Cloudflare 发布验证

- 代码提交 `11e111dfff16357e2574e6d51dd91fa449d2c79c` 已推送现有 `main`。沿用原远端（GitHub 自动重定向到 `kenny-xu-design/focus-lab`），未改用户远端配置。
- [GitHub Actions Build](https://github.com/kenny-xu-design/focus-lab/actions/runs/39133770779) 已成功，包含构建和 14 项训练/PWA 测试。
- Cloudflare Pages 对该 SHA 返回 `Deployed successfully`，部署 ID `885de352-402d-4f23-98a2-de67b5482a95`；[部署预览](https://885de352.focus-lab-cus.pages.dev) 与[正式启动器](https://focus-lab-cus.pages.dev/launcher)已可访问。
- 通过 HTTPS 逐个请求正式站点的 HTML、JS、CSS、manifest、Service Worker 与全部图标，共 10 个文件均为 200，SHA-256 与独立待发布构建完全一致；`/launcher`、`/learn/loci`、`/training/number-path-memory`、`/records` 四条 SPA 深链接均为 200 且引用同一新脚本。线上缓存版本为 `focus-lab-pwa-v4-4105df2ba0ab`。
- 内置浏览器实测正式 `/launcher` 渲染六个核心训练入口和安装按钮。实际手机主屏幕安装与操作系统独立窗口仍需真机验证；云端用户数据同步仍未启用。
- 工作区原有桌面番茄钟和主题改动保持未提交。未创建 worktree、未切换分支、未强推或修改版本号。

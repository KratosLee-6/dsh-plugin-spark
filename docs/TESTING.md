# Test evidence / 测试证据

Evidence date / 记录日期: 2026-09-20. Version / 版本: 0.2.1.

## Environment / 环境

Local verification: Windows, Node.js 24.15.0, Microsoft Edge 153.0.4234.32. The pinned host is @deepseek-ai/dsh 0.1.5-rc.2, with @deepseek-ai/dsh-tools 0.1.5-rc.2 and @deepseek-ai/cordis 4.0.2.

本地验证环境为 Windows、Node.js 24.15.0、Edge 153.0.4234.32。DSH 与工具包锁定 0.1.5-rc.2，Cordis 锁定 4.0.2。v0.1 的 Windows/Linux、Node 22.19/24 CI 已通过（运行编号 35359695989）。v0.2 的远程结果以对应提交的 Actions 记录为准。

## Reproduce / 复现

Install locked dependencies from the official npm registry, then run the checks. / 从官方 npm 源安装锁定依赖，再执行验证。

```sh
npm ci --registry=https://registry.npmjs.org
npm run format:check
npm run check
npx playwright install chromium
npm run test:ui
npm run test:host
npm run verify:release
npm audit --registry=https://registry.npmjs.org
```

On Windows with Edge installed, set the browser channel before the UI test instead of installing Chromium. / Windows 已有 Edge 时，执行 UI 测试前指定频道，无需另装 Chromium。

```powershell
$env:SPARK_BROWSER_CHANNEL = 'msedge'
npm run test:ui
```

## Measured results / 实测结果

| Check / 检查                      | Result / 结果                                                    | Scope / 范围                                                                                       |
| --------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| TypeScript                        | Passed / 通过                                                    | Static types and build / 静态类型与构建                                                            |
| Core and integration / 核心与集成 | 80 tests, 5 files / 80 项、5 个文件                              | Contracts, composition, persistence, plugin lifecycle, HTTP / 契约、组合、存储、插件生命周期、HTTP |
| Browser / 浏览器                  | 11 tests / 11 项                                                   | Desktop and 390px layouts, bilingual flows / 桌面、390px、双语流程                                 |
| Accessibility / 无障碍            | No violations in tested axe WCAG A/AA scans / 已测页面未发现违规 | Automated scan only / 仅自动扫描                                                                   |
| DSH host / 宿主                   | Passed / 通过                                                    | Fresh isolated profile, patch load, 4 examples, HTTP 200 / 隔离配置、加载插件、4 个示例、页面响应  |
| npm audit                         | 0 on 2026-09-18 / 9 月 18 日为 0                                 | v0.1 audit baseline; no dependencies changed / v0.1 审计基线，未变更依赖                           |

Coverage for src/core.ts, src/store.ts, src/index.ts, src/server.ts and src/markdown.ts: **97.98% statements, 97.18% branches, 93.44% functions, 98.15% lines**. CLI, examples and Studio JavaScript are outside this coverage denominator; CLI and UI have separate smoke/browser checks.

覆盖率统计仅包含上述五个核心文件：语句 97.98%、分支 97.18%、函数 93.44%、行 98.15%。CLI、示例和 Studio JavaScript 不在分母内，另有冒烟与浏览器验证。高覆盖率不等于没有缺陷。

Browser assertions cover collision, save, growth, SKILL.md download, history after reload, cancellation, reduced motion, missing inputs, malicious HTML treated as text, and truthful save-failure feedback. Tests generate the committed [English screenshot](screenshots/studio-en.png), [Chinese screenshot](screenshots/collision-zh.png) and [mobile-width screenshot](screenshots/mobile-en.png) using synthetic examples.

浏览器断言覆盖碰撞、保存、生长、SKILL.md 下载、刷新后历史恢复、取消、减少动态效果、缺失输入、恶意 HTML 作为文本呈现，以及保存失败不能误报成功。仓库截图由运行中的应用生成，全部使用合成示例。

The release verifier checks the npm archive allowlist and local documentation links. Databases, generated patches, local settings, customer data and test working directories must not enter the distribution.

发布校验检查 npm 包白名单与本地文档链接。数据库、生成的 patch、本机设置、客户资料和测试临时目录不得进入分发包。

## Limits / 验证边界

- The host smoke test proves startup and plugin initialization; it makes no model request and does not prove an agent can complete a conversation. / 宿主冒烟证明启动与初始化，不请求模型，也不证明 Agent 对话流程。
- No iOS/Android native packages, macOS runtime, Safari, Firefox or physical mobile devices were validated locally. A 390px browser viewport is a responsive-layout check. / 未本地验证原生移动包、macOS、Safari、Firefox 或手机真机；390px 只是响应式布局检查。
- No local-model inference path, npm publication or official DSH listing is claimed. / 未验证本地模型推理、npm 正式发布，也不宣称获 DSH 官方收录。
- Automated accessibility scans do not replace keyboard, screen-reader or human usability review. No cross-device frame-rate or latency benchmark is claimed. / 自动无障碍扫描不替代键盘、读屏和人工可用性评审；尚无跨设备帧率或延迟基准。
- Contract-name matching is deterministic. Generated Skills remain unverified drafts; semantic compatibility, execution success and learning quality are not measured. / 契约名称匹配是确定性规则；生长结果仍为未验证草案，未测量语义兼容、执行成功或学习效果。
- DSH is a developer preview. Retest pinned interfaces before upgrading. / DSH 处于开发者预览，升级前需要重新验证接口。

See [architecture](ARCHITECTURE.md) and [security](../SECURITY.md) for lifecycle and trust boundaries. / 生命周期与信任边界见技术架构及安全说明。

## v0.2 additions / 本次新增验证

Markdown tests cover every bundled export, grown lineage/tags, multiline items, Chinese headings, BOM/CRLF, unknown and duplicate fields, unsupported YAML, inert code fences, prototype-named headings, size limits and exact-source identity. HTTP and DSH tests verify preview makes no writes and saving still requires valid contracts.

新增解析测试覆盖内置导出往返、生长来源与标签、多行条目、中文标题、BOM/CRLF、未知或重复字段、不支持的 YAML、惰性代码块、原型属性同名标题、尺寸限制与原文标识。HTTP 与 DSH 测试确认预览不写库，保存仍需契约校验。

Browser additions cover file selection, editable contracts, confirmation invalidation, reload persistence, imported-Skill collision, source-edit invalidation, stale failure responses, oversized files, save-failure recovery and switching back to JSON. New screenshots: [English review](screenshots/import-review-en.png), [Chinese review](screenshots/import-review-zh.png).

浏览器新增覆盖选文件、编辑契约、确认失效、刷新恢复、导入后碰撞、原文变更、过期失败响应、超大文件、保存失败恢复及切回 JSON；审阅弹窗也纳入自动无障碍检查。

## v0.2.1 audit regressions / 审计回归

80 core/integration tests and 11 browser tests passed locally. Added assertions cover multiline display names, backtick/tilde fences at the start of an item, malformed/unclosed owned fences, 64,000-byte escaped transport, growth limits and history hydration, competing inserts, and committed-save/read-refresh failure. The competing-insert test uses a real SQLite BEFORE INSERT trigger to deterministically introduce a competing row; it is not a multiprocess stress benchmark.

本地通过 80 项核心与集成测试、11 项浏览器测试。新增覆盖多行名称、条目首行反引号/波浪线围栏、缩进异常/未闭合围栏、64,000 字节原文转义传输、生长容量及历史恢复、竞争插入、保存成功后刷新失败。竞争写入用真实 SQLite BEFORE INSERT 触发器确定性插入竞争记录，并非多进程压力基准。详见 [审计报告](AUDIT-2026-09-20.md)。

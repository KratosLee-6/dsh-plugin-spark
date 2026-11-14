# Test evidence / 测试证据

Evidence date / 记录日期: 2026-11-14 (host alignment to DSH 0.2.2-rc.3); v0.3.0 growth relationships and earlier evidence retained below where still applicable. Version / 版本: 0.3.5.

## Host alignment / 宿主对齐 · 2026-11-14 · DSH 0.2.2-rc.3

Local Windows verification on `@deepseek-ai/dsh@0.2.2-rc.3`, `@deepseek-ai/dsh-tools@0.2.2-rc.3` and `@deepseek-ai/cordis@4.1.0` (Node.js 24.15.0): 90/90 core+integration tests, `tsc --noEmit`, `verify:release`, and the pinned-host smoke (fresh isolated profile, absolute-path patch, four synthetic Skills, HTTP 200). The installed `docs/upgrade-guide` for v0.2.2-rc.1 → rc.3 was read in full: its 18 entries change account notifications, CUA, Forge, Office, terminals, web search, session append and plugin-manager API consumers — none of them touches a surface this plugin uses. The only plugin-related entry, `plugin-update-method`, replaces `BundleInfo.updatable` with `BundleInfo.update` for code reading `pluginManager.listBundles()`; Spark does not. The `dsh-tools` public export list differs only by the added `ToolContextUnavailableError`, so no migration applies.

本地以 DSH 0.2.2-rc.3 回归：90/90 核心+集成测试、类型检查、发布校验、锁定宿主冒烟（全新隔离 profile、绝对路径 patch、4 个合成技能、HTTP 200）全部通过。完整读了安装目录的 rc.1→rc.3 升级指南，18 条变更涉及账号通知、CUA、Forge、Office、终端、网页搜索、session append 与插件管理器 API 消费者，均不涉及本插件使用的 surface；唯一与插件相关的 `plugin-update-method`（`BundleInfo.updatable` → `BundleInfo.update`）只影响读 `pluginManager.listBundles()` 的代码，Spark 不涉及；`dsh-tools` 公共导出的差异只有新增 `ToolContextUnavailableError`，无需迁移。

## Host alignment / 宿主对齐 · 2026-11-08

Local Windows verification on `@deepseek-ai/dsh@0.2.2-rc.1`, `@deepseek-ai/dsh-tools@0.2.2-rc.1` and `@deepseek-ai/cordis@4.1.0` (Node.js 24.15.0): 90/90 core+integration tests, `tsc --noEmit`, `verify:release` (26 archive entries), 12/12 browser tests through the Edge channel, and the pinned-host smoke (fresh isolated profile, absolute-path patch, four synthetic Skills, HTTP 200). The integration host now mounts `@deepseek-ai/dsh-tool-executor-native` and calls `tools.execute({ calls })`, because `ToolsService` no longer accepts `mode`. Production code needed no change.

Bundle install path, verified end to end in an isolated `DSH_HOME`: `npm pack` (45 KB tarball containing `dist/`, `studio/`, `examples/` and `cordis.patch.yml`), then `dsh plugin --profile web add ./dsh-plugin-spark-0.3.1.tgz`. pnpm installs the package, the profile's `dsh.profile.bundles` gains `dsh-plugin-spark`, and the next `dsh web` boot mounts the plugin from the bundled patch, creates `$DSH_HOME/spark/spark.db` and seeds four Skills (HTTP 200).

The same path was then verified against the public registry after publishing: `dsh plugin --profile web add dsh-plugin-spark` installs `0.3.1` from registry.npmjs.org (dist-tag `latest`, SLSA provenance attestation, sha512 matching the registry record), mounts it on boot and seeds four Skills.

`0.3.2` was published through npm trusted publishing (OIDC): the GitHub Actions job exchanged its OIDC identity for a scoped token (`POST /-/npm/v1/oidc/token/exchange/package/dsh-plugin-spark` → 201) and published directly with a provenance attestation, with no long-lived npm token in the workflow.

本地以 DSH 0.2.2-rc.1 回归：90/90 核心+集成测试、类型检查、发布校验（26 个归档条目）、12/12 浏览器测试、锁定宿主冒烟（全新隔离 profile、绝对路径 patch、4 个合成技能、HTTP 200）全部通过。集成宿主改挂原生工具执行器并改用批量调用入口，因为新版不再接受 `mode`；生产代码未改动。

bundle 安装链路已在隔离 `DSH_HOME` 下端到端验证：`npm pack`（45 KB tarball，含 `dist/`、`studio/`、`examples/` 与 `cordis.patch.yml`）→ `dsh plugin --profile web add ./dsh-plugin-spark-0.3.1.tgz`，pnpm 完成安装、profile 的 `dsh.profile.bundles` 自动加入 `dsh-plugin-spark`，随后 `dsh web` 启动即从包内 patch 挂载插件，在 `$DSH_HOME/spark/spark.db` 建库并播种 4 个技能（HTTP 200）。

发布后又以公共 npm 源复验同一链路：`dsh plugin --profile web add dsh-plugin-spark` 从 registry.npmjs.org 装到 `0.3.1`（`latest` 标签、SLSA provenance 证明、sha512 与 registry 记录一致），启动即挂载并播种 4 个技能。

`0.3.2` 改走 npm trusted publishing（OIDC）发布：GitHub Actions 用 OIDC 身份换取作用域 token（`POST /-/npm/v1/oidc/token/exchange/package/dsh-plugin-spark` → 201），直接带 provenance 发布，工作流里不再有任何长期 npm token。

## v0.3.0 additions / v0.3.0 补充

Local Windows verification (Node.js 24.15.0, Edge channel): 90 core/integration tests passed (`vitest run`, including 10 new relationship tests: three grow branches, option misuse, capacity wrapping for author drafts, export round-trip with `spark-relationship`, legacy import without relationship metadata, store persistence of relationship + inspiredBy); 12 browser tests passed (`playwright test` via Edge channel, including the grow-picker flow for novel_extension and independent drafts with history reopen). `npm run check`, `verify:release` and `format:check` passed. Not yet re-run in this cycle: pinned-host smoke and Windows/Linux CI matrix.

本地 Windows 验证：90 项核心/集成测试通过（含 10 项关系新测试）；12 项浏览器测试通过（含延伸与独立草案的生长选择器与历史重开流程）；check / verify:release / format:check 通过。本轮未重跑：锁定宿主冒烟与 Windows/Linux CI 矩阵。

## v0.2.1 evidence / v0.2.1 证据

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
| Core and integration / 核心与集成 | 94 tests, 5 files / 94 项、5 个文件                              | Contracts, composition, bridges, persistence, plugin lifecycle, HTTP / 契约、组合、契约桥、存储、插件生命周期、HTTP |
| Browser / 浏览器                  | 13 tests / 13 项                                                   | Desktop and 390px layouts, bilingual flows, grow relationships, approved bridges / 桌面、390px、双语流程、生长关系、批准桥 |
| Accessibility / 无障碍            | No violations in tested axe WCAG A/AA scans / 已测页面未发现违规 | Automated scan only / 仅自动扫描                                                                   |
| DSH host / 宿主                   | Passed / 通过                                                    | Fresh isolated profile, patch load, 4 examples, HTTP 200 / 隔离配置、加载插件、4 个示例、页面响应  |
| npm audit                         | Runtime dependencies 0 on 2026-11-09; dev dependency tree reports 214 (11 moderate, 203 high), all inside the pinned `@deepseek-ai/dsh` host-SDK chain / 运行时依赖 2026-11-09 为 0；开发依赖树报告 214（11 中、203 高），全部位于锁定的 `@deepseek-ai/dsh` 宿主 SDK 依赖链 | Clean with `npm audit --omit=dev`; dev-chain advisories belong to the pinned host SDK and are not fixable here without breaking host alignment / `npm audit --omit=dev` 为 0；开发链公告属于锁定的宿主 SDK，本插件无法在不破坏宿主对齐的前提下修复 |

Coverage for src/core.ts, src/store.ts, src/index.ts, src/server.ts and src/markdown.ts: **96.49% statements, 89.26% branches, 97.22% functions, 96.76% lines** (refreshed for v0.4.0 bridge code). CLI, examples and Studio JavaScript are outside this coverage denominator; CLI and UI have separate smoke/browser checks.

覆盖率统计仅包含上述五个核心文件：语句 96.49%、分支 89.26%、函数 97.22%、行 96.76%（随 v0.4.0 契约桥代码刷新）。CLI、示例和 Studio JavaScript 不在分母内，另有冒烟与浏览器验证。高覆盖率不等于没有缺陷。

Browser assertions cover collision, save, growth, SKILL.md download, history after reload, cancellation, reduced motion, missing inputs, malicious HTML treated as text, and truthful save-failure feedback. Tests generate the committed [English screenshot](screenshots/studio-en.png), [Chinese screenshot](screenshots/collision-zh.png) and [mobile-width screenshot](screenshots/mobile-en.png) using synthetic examples.

浏览器断言覆盖碰撞、保存、生长、SKILL.md 下载、刷新后历史恢复、取消、减少动态效果、缺失输入、恶意 HTML 作为文本呈现，以及保存失败不能误报成功。仓库截图由运行中的应用生成，全部使用合成示例。

The release verifier checks the npm archive allowlist and local documentation links. Databases, generated patches, local settings, customer data and test working directories must not enter the distribution.

发布校验检查 npm 包白名单与本地文档链接。数据库、生成的 patch、本机设置、客户资料和测试临时目录不得进入分发包。

## Limits / 验证边界

- The host smoke test proves startup and plugin initialization; it makes no model request and does not prove an agent can complete a conversation. / 宿主冒烟证明启动与初始化，不请求模型，也不证明 Agent 对话流程。
- No iOS/Android native packages, macOS runtime, Safari, Firefox or physical mobile devices were validated locally. A 390px browser viewport is a responsive-layout check. / 未本地验证原生移动包、macOS、Safari、Firefox 或手机真机；390px 只是响应式布局检查。
- No local-model inference path or official DSH listing is claimed. npm publication through trusted publishing is verified from 0.3.1 onward; inclusion in any official DSH plugin listing is not. / 未验证本地模型推理，也不宣称获 DSH 官方收录；0.3.1 起的 npm trusted publishing 发布已验证，官方插件目录收录未验证。
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

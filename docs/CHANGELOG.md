# Changes / 更新记录

## 0.3.4 · 2026-11-11 · install from Git source / 源码安装

- `prepare` builds `dist/` at install time, so a Git dependency (`dsh plugin --profile web add github:KratosLee-6/dsh-plugin-spark`) produces the same bundle as the npm package instead of unbuilt source. pnpm 11 blocks build scripts by default, so the installer prints the exact `allowBuilds` key to approve. The gap was reported by the awesome-dsh-plugin maintainer on the listing PR: `dist/` is gitignored and only `prepack` built it. / 新增 `prepare` 在安装时构建 `dist/`：Git 依赖安装得到与 npm 包一致的 bundle，而不是未构建源码；pnpm 11 默认拦截构建脚本，安装器会打印需要批准的 `allowBuilds` 条目。该缺口由 awesome-dsh-plugin 维护者在收录 PR 上指出。
- Verified in a fresh clone: `npm ci` produces `dist/index.js`, and `npm pack` still yields the same 27 files. Tests, typecheck and release verification unchanged. / 全新克隆验证：`npm ci` 会产出 `dist/index.js`，`npm pack` 仍是 27 个文件；测试、类型检查与发布校验不变。
- No tool-contract or database-schema change. / 工具契约与数据库 schema 不变。

## 0.3.3 · 2026-11-09 · docs and examples / 文档与示例

- The import guide links a synthetic `novel_extension` example (`examples/grown-relationship.md`): a real SKILL.md export shape with `spark-relationship` frontmatter and a Relationship section, re-importable with the relationship intact. / 导入指南新增合成 `novel_extension` 示例（`examples/grown-relationship.md`）：真实 SKILL.md 导出形态，含 `spark-relationship` frontmatter 与 Relationship 分节，重导入可还原关系。
- The roadmap checkpoint and measured-results table now reflect the 0.3.2 state: 90/90 core and integration tests, 12 browser tests, pinned-host smoke on DSH 0.2.2-rc.1 and the npm trusted-publishing release. / 路线图节点与实测结果表刷新到 0.3.2 状态：90/90 核心与集成测试、12 项浏览器测试、DSH 0.2.2-rc.1 锁定宿主冒烟与 npm trusted publishing 发布。
- The npm-audit row is refreshed honestly: runtime dependencies scan clean; the dev dependency tree reports advisories inside the pinned `@deepseek-ai/dsh` host-SDK chain. / npm audit 行如实刷新：运行时依赖干净；开发依赖树的公告位于锁定的 `@deepseek-ai/dsh` 宿主 SDK 依赖链。
- No tool-contract or database-schema change; no dependency change. / 工具契约与数据库 schema 不变；依赖不变。

## 0.3.2 · 2026-11-08 · release pipeline / 发布链路

- Install instructions now describe the published package instead of "not on npm yet"; this release refreshes the README shown on the npm page. / 安装说明改为已发布状态，本版同时刷新 npm 页面上的 README。
- Publishing runs through npm trusted publishing (OIDC) from GitHub Actions: the publish job no longer uses a long-lived token. / 发布改走 npm trusted publishing（OIDC），发布任务不再使用长期 token。
- Repository line endings are normalized to LF through `.gitattributes`, so `format:check` is stable on Windows checkouts. / 通过 `.gitattributes` 统一 LF 行尾，Windows 检出下 `format:check` 稳定。
- No tool-contract or database-schema change. / 工具契约与数据库 schema 不变。

## 0.3.1 · 2026-11-08 · host alignment + bundle / 宿主对齐与 bundle

- Move the compatibility target to `@deepseek-ai/dsh@0.2.2-rc.1`, `@deepseek-ai/dsh-tools@0.2.2-rc.1` and `@deepseek-ai/cordis@4.1.0`. / 兼容目标升级到 DSH 0.2.2-rc.1、工具包 0.2.2-rc.1、Cordis 4.1.0。
- Declare `dsh.bundle` in `package.json` with a bundled `cordis.patch.yml`, so a profile installs the plugin with `dsh plugin add dsh-plugin-spark` (or Plugins → Discover) instead of a hand-written patch. / 新增 `dsh.bundle` 清单与包内 `cordis.patch.yml`，profile 可用 `dsh plugin add` 或插件市场一键安装，不再需要手写 patch。
- Published to npm as `dsh-plugin-spark@0.3.1` with a SLSA provenance attestation from GitHub Actions; `latest` points at it, and the published tarball's integrity matches the registry record. / 已发布到 npm（0.3.1，GitHub Actions 构建、带 SLSA provenance），`latest` 指向该版本，下载校验与 registry 记录一致。
- Default plugin database directory when a profile mounts the bundle without `dataDir`: `$DSH_HOME/spark` (`~/.dsh/spark` when `DSH_HOME` is unset). The Studio `--data-dir` default is unchanged (`.spark`). / 以 bundle 挂载且未配置 `dataDir` 时，默认库目录改为 `$DSH_HOME/spark`（无该变量则 `~/.dsh/spark`）；Studio 的 `--data-dir` 默认不变。
- Adapt the integration test host to the new tool runtime contract: `ToolsService` no longer accepts `mode`, so the test mounts `@deepseek-ai/dsh-tool-executor-native` instead, and `tools.execute()` now takes a `{ calls: [...] }` batch and returns `{ results: [{ callId, result }] }`. / 集成测试宿主适配新工具运行时契约：不再接受 `mode`，改挂原生执行器；执行入口改为批量调用。生产代码未改动。
- Regression on 0.2.2-rc.1: 90/90 unit+integration tests, typecheck, release verification and pinned-host smoke (fresh isolated profile, 4 synthetic skills, HTTP 200), plus a bundle install through `dsh plugin add` from a packed tarball. No database schema change. / 在 0.2.2-rc.1 上回归：90/90 测试、类型检查、发布校验、锁定宿主冒烟，以及用打包 tarball 走 `dsh plugin add` 的 bundle 安装验证。数据库 schema 不变。

## 0.3.0 · 2026-11-07

- Growth relationships / 来源关系三分法: `spark_grow` and Studio now offer `derived_from_parents` (default, unchanged behavior), `novel_extension` (extend one parent with `extend: "a" | "b"`; the other parent informs the goal as inspiration only) and `independent_new_skill` (author-supplied `{inputs, outputs, steps}` draft; the engine never invents a contract). The chosen relationship is stamped on the Skill, persisted and shown in SKILL.md (`spark-relationship` frontmatter plus a Relationship section), and survives re-import. / 生长新增来源关系三分法：默认并入双侧、延伸一侧、独立草案（作者自备契约，引擎不代拟）；关系写入技能与导出并可往返导入。
- Both parents' constraints stay attached under every relationship; the label describes step lineage, not verified quality. / 三种关系下父级约束均保留；标签描述步骤来源，不代表已验证质量。
- No database schema change: existing workspaces stay readable; skills without a relationship remain unclassified. / 数据库 schema 不变，旧工作区可继续读取；无关系字段的技能不自动分类。

## 0.2.1 · 2026-09-20

- Preserve multiline names and list-owned fenced code through export/import, keeping embedded headings inert. / 导出导入保留多行名称、列表内代码围栏，围栏标题不变成契约。
- Disclose growth limits before saving and after reopening history; return actionable errors without truncation. / 保存前和重开历史时披露生长容量，错误给出处理建议且不截断。
- Allow bounded JSON escaping overhead while keeping the 64,000-byte decoded source limit. / 允许有界 JSON 转义开销，保留解码原文尺寸限制。
- Compare actual stored content after competing inserts; separate committed success from refresh failure. / 竞争插入后比对实际内容；保存成功与刷新失败分别反馈。
- Add regression evidence, refreshed review screenshots and a bilingual two-axis audit. / 补齐回归、更新审阅截图及双语双轴审计报告。

No dependency or database schema change. / 依赖与数据库 schema 不变。

## 0.2.0 · 2026-09-20

- Preview SKILL.md without writes through Studio and `spark_preview_import`. / 工作室和 DSH 均支持不写库预览。
- Review unmapped lines and edit contracts before saving; stale previews cannot authorize a save. / 展示未映射行，编辑确认后保存，过期预览不可用于保存。
- Import local files up to 64 KB; retain JSON import compatibility. / 支持本地文件，保留 JSON 流程。
- Preserve tags alongside parent IDs in Markdown export. / 导出补全标签，保留父级。
- Add bilingual instructions, actual review screenshots and parser/host/browser regressions. / 新增双语指南、实际截图及解析、宿主、浏览器回归。

No database schema or dependency version change. Existing workspaces remain readable. No native mobile package or model-assisted composition is introduced. / 数据库 schema 与依赖版本不变；已有工作区可继续读取。本次不包含移动原生包或模型辅助组合。

## 0.1.0 · 2026-09-18

Initial local-first composition plugin, six tools, SQLite persistence, bilingual Studio, deterministic growth and SKILL.md export. / 初版本地组合插件、六工具、SQLite、双语工作室、规则生长及导出。

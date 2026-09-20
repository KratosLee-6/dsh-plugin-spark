# Changes / 更新记录

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

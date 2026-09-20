# Changes / 更新记录

## 0.2.0 · 2026-09-20

- Preview SKILL.md without writes through Studio and `spark_preview_import`. / 工作室和 DSH 均支持不写库预览。
- Review unmapped lines and edit contracts before saving; stale previews cannot authorize a save. / 展示未映射行，编辑确认后保存，过期预览不可用于保存。
- Import local files up to 64 KB; retain JSON import compatibility. / 支持本地文件，保留 JSON 流程。
- Preserve tags alongside parent IDs in Markdown export. / 导出补全标签，保留父级。
- Add bilingual instructions, actual review screenshots and parser/host/browser regressions. / 新增双语指南、实际截图及解析、宿主、浏览器回归。

No database schema or dependency version change. Existing workspaces remain readable. No native mobile package or model-assisted composition is introduced. / 数据库 schema 与依赖版本不变；已有工作区可继续读取。本次不包含移动原生包或模型辅助组合。

## 0.1.0 · 2026-09-18

Initial local-first composition plugin, six tools, SQLite persistence, bilingual Studio, deterministic growth and SKILL.md export. / 初版本地组合插件、六工具、SQLite、双语工作室、规则生长及导出。

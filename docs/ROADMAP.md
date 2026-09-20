# Plugin delivery roadmap / 插件交付路线

This roadmap covers Spark only. The complete product, standalone app and native-platform plan are maintained in [AI--boom](https://github.com/KratosLee-6/AI--boom). See [repository scope](../REPOSITORY-SCOPE.md). Each plugin milestone needs committed acceptance evidence.

此路线仅覆盖 Spark 插件。完整产品、独立 App 与跨端计划归主产品仓库；每个插件节点以提交的验收证据为准。

| Milestone / 节点 | Deliverable / 交付 | Exit criterion / 验收 |
| --- | --- | --- |
| v0.1 Foundation / 基础 | Six DSH tools, companion Studio, deterministic growth / 六工具、配套工作室与规则生长 | Core, browser, host smoke and archive checks / 核心、浏览器、宿主与包检查 |
| v0.2 Import / 导入 | Reviewable SKILL.md import and seventh preview tool / 可审阅导入与第七个预览工具 | Unmapped content visible, no execution, reviewed round-trip / 未映射内容可见、不执行、审阅往返 |
| v0.2.1 Audit / 审计 | Contract preservation, capacity disclosure, truthful persistence feedback / 契约保留、容量披露与准确保存反馈 | Targeted regressions and independent follow-up review / 针对性回归与独立复审 |
| Contract adapters / 契约适配 | Explicit typed handoffs and human-approved bridges / 显式类型与人工确认桥接 | Mismatches fail visibly; synthetic fixtures verify conversions / 不匹配明确失败、合成样例验证 |
| Plugin workspace portability / 插件数据迁移 | Versioned backup/restore for plugin Skills and collisions / 插件技能与碰撞的版本化备份恢复 | Validated restore, ID conflicts, failure safety and lineage preservation / 恢复、冲突、失败保护与来源保留 |
| Host experience / 宿主体验 | DSH renderer if supported and actual agent integration / 接口支持时的结果卡与 Agent 集成 | Pinned-host tool flow, cancellation and failure paths / 锁定宿主流程、取消与失败验证 |

## Plugin technology and boundaries / 插件技术与边界

Keep TypeScript for the plugin engine and DSH adapter. Companion Studio presentation, storage and lifecycle tests are maintained here. Native Windows/Android/iOS application packaging belongs to the product repository and is not a plugin milestone. No Docker runtime is required by the plugin.

插件引擎与 DSH 适配继续使用 TypeScript；配套 Studio、存储与生命周期验证归本仓库。Windows/Android/iOS 独立 App 打包属于主产品，不计入插件节点；插件不要求 Docker 运行时。

Optional model suggestions must be opt-in, disclose provider/data boundaries and retain the deterministic offline path. Suggestions must not be presented as verified compatibility. Host/model validation does not imply full-product integration.

模型建议必须显式开启、说明数据边界并保留规则离线路径，不能当作已验证兼容性。宿主/模型验证不等于主产品已完成集成。

## Current checkpoint / 当前节点

v0.2.1 is the current plugin checkpoint: 80 core/integration and 11 browser tests passed; Windows/Linux Node 22.19/24 and browser CI passed in [run 35509016049](https://github.com/KratosLee-6/dsh-plugin-spark/actions/runs/35509016049). These results belong to audit-fix commit `8ba4892`, not the standalone application. See [test evidence](TESTING.md), [audit](AUDIT-2026-09-20.md) and [import guide](IMPORT.md).

当前插件节点为 v0.2.1：上述测试及 CI 对应审计整改提交，不代表主 App 的验收。下一功能节点是显式契约适配；备份恢复与宿主体验尚未交付。

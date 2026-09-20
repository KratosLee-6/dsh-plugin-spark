# Delivery roadmap / 交付路线

Each milestone has an observable exit criterion. Dates depend on host interfaces and test results; no milestone is complete until its evidence is committed.

每个节点以可观察的验收结果为准；日期取决于宿主接口与实测，不以演示代替完成。

| Milestone / 节点             | Deliverable / 交付                                                                                         | Exit criterion / 验收                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| v0.1 Foundation / 基础       | Six DSH tools, local Studio, deterministic growth, bilingual docs / 六工具、本地工作室、规则生长、双语文档 | Core, browser, host smoke and package checks pass / 核心、浏览器、宿主与打包检查通过                                      |
| v0.2 Import / 导入           | Reviewable SKILL.md parser with explicit contract editing / 可审阅 Markdown 解析与契约编辑                 | Unsupported fields shown; no instruction execution; round-trip fixtures / 未知字段可见、不执行指令、往返样例通过          |
| Contract adapters / 契约适配 | Explicit typed handoffs and human-approved bridges / 显式类型与人工确认桥接                                | Mismatches fail visibly; adapter tests use synthetic fixtures / 不匹配明确失败、合成样例验证转换                          |
| Host experience / 宿主体验   | DSH renderer if supported, real agent integration / 接口支持时提供原生结果卡与 Agent 集成                  | Pinned-host end-to-end tool flow; cancellation and failure paths / 锁定宿主完整工具流程、取消与失败验证                   |
| Portable product / 跨端产品  | Windows packaging first; mobile feasibility next / 先 Windows 安装包，再验证移动端                         | Fresh-machine install/uninstall, offline reopen, persistence, signing plan / 新机器安装卸载、断网重启、数据恢复、签名方案 |

## Technology decisions / 技术决策

Keep TypeScript for the shared engine and DSH adapter. HTML/CSS provide presentation; typed contracts, lifecycle control and tests provide behavioral reliability. Native packaging must preserve these boundaries and be validated on the actual target OS.

共享核心和 DSH 适配层继续使用 TypeScript；HTML/CSS 承担呈现，类型契约、生命周期管理与测试保障行为。原生打包需要复用边界，并在目标系统实测。

Docker can make Linux development and CI environments reproducible; it does not guarantee smooth animation or provide iOS signing and native APIs. This release does not require Docker. Consider a development container when environment drift becomes a measured issue. iOS builds still need Apple's supported toolchain.

Docker 适合复现 Linux 开发与 CI 环境，不会自动改善动效，也不提供 iOS 签名或原生 API。本版不强制容器；出现可量化的环境差异后再引入开发容器。iOS 构建仍需苹果支持的工具链。

Optional model suggestions must be opt-in, show provider/data boundaries, and retain the deterministic offline path. They must not be presented as verified Skill compatibility.

模型建议必须显式开启、说明数据流向，并保留确定性离线路径；不得将建议当作已经验证的 Skill 兼容性。

## Current checkpoint / 当前节点

v0.1 foundation CI passed on Windows/Linux (run 35359695989). v0.2 adds reviewed Markdown import, editable contracts, a read-only DSH preview tool, and export/import regression fixtures. See [test evidence](TESTING.md) and [import guide](IMPORT.md). The next implementation milestone is explicit typed contract adapters; it is not part of v0.2.

v0.1 的 Windows/Linux CI 已通过（运行编号 35359695989）。v0.2 新增 Markdown 审阅导入、契约编辑、DSH 只读预览与导出往返样例。下一节点为显式类型契约适配，尚未包含在 v0.2。

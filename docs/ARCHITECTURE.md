# Architecture / 技术架构

Spark has one composition engine and two entry points. / 一个组合核心，两个入口。

```mermaid
flowchart LR
  D[DSH agent / Agent] --> T[Seven native tools / 七个原生工具]
  U[Companion Studio / 独立工作室] --> H[Loopback HTTP / 本机服务]
  T --> S[Application + SQLite / 用例与存储]
  H --> S
  S --> C[Deterministic core / 确定性核心]
  C --> R[Draft + gaps + lineage / 草案与缺口及来源]
  R --> G[Grow + SKILL.md / 生长与导出]
```

## Contracts / 数据契约

`Skill` declares `id`, `name`, `description`, `inputs`, `outputs`, `steps`, `constraints`, `tags`, and `parents` (optional on import). IDs use lowercase ASCII letters, digits and hyphens, max 80 characters. Arrays contain at most 32 nonempty strings of at most 500 characters; inputs, outputs and steps cannot be empty. Imported JSON is limited to 64 KB. Names are limited to 120 characters, descriptions to 2,000, goals to 1,000. Validation runs at runtime, not just in TypeScript.

`Skill` 声明编号、名称、描述、输入、输出、步骤、约束、标签及父级。导入可省略父级。编号仅允许小写英文字母、数字、连字符，最长 80 字符；数组最多 32 项，每项最长 500 字符；输入、输出、步骤不能为空。JSON 最多 64 KB；名称 120 字符，描述 2,000 字符，目标 1,000 字符。运行时会校验数据，不依赖静态类型兜底。

Composition is directional: A's outputs are normalized and matched to B's required inputs. A result is `connected` only when every B input matches; otherwise it is `bridge-needed`. These labels refer only to declarations, not executable interoperability. No network, model, shell or Skill execution occurs inside the engine.

组合有方向：A 的输出经过规范化，与 B 的必需输入匹配。只有所有输入都匹配才标为 `connected`，否则为 `bridge-needed`。状态仅描述声明层面的匹配，不代表实际可执行兼容性。引擎不请求网络、不调用模型或 shell，也不执行 Skill。

## Persistence and growth / 持久化与生长

Collision identity includes ordered source snapshots, goal, language and engine version. The full SHA-256 fingerprint is retained; a 24-hex prefix forms the public ID. Repeating a save returns `created: false`. Skill IDs never silently overwrite existing content. SQLite statements commit atomically, use prepared parameters, and wait up to 3 seconds for competing writes. Schema version 1 rejects newer schemas. The latest 100 collisions are returned by history; stored rows are not automatically deleted.

碰撞身份包含有序来源快照、目标、语言和引擎版本。完整 SHA-256 指纹保留，24 位十六进制前缀用于公开编号。重复保存返回 `created: false`；Skill 不会静默覆盖。SQLite 使用参数化语句和原子提交，竞争写入最多等待 3 秒。当前 schema 版本为 1，拒绝打开更高版本库。历史接口返回最近 100 项，但不会自动删除旧数据。

Growth is explicit and requires a saved parent collision. It unions A's required inputs with missing B inputs, retains B's outputs and both sets of constraints, and labels the result `unverified-draft`. It creates a new ID and retains direct parent Skill IDs. A grown Skill is reusable as an input to later collisions. This is structured draft composition, not measured learning or autonomous self-improvement.

生长是显式操作，要求先保存碰撞。新草案合并 A 的输入和 B 的待补输入，保留 B 的输出及双方约束，标记为 `unverified-draft`，生成新 ID 并保存直接父级编号。它能继续参与碰撞，但这不等于模型学习或自主进化。

## Lifecycle and presentation / 生命周期与呈现

Cordis owns tool registration and the SQLite disposer; unload removes tools and closes storage. Every tool checks the host cancellation signal before work. The engine and writes are synchronous and small; cancellation after a completed commit cannot undo it. No timers or background agents are created by the plugin.

Cordis 管理工具注册和数据库释放。卸载会移除工具并关闭连接；工具执行前检查宿主取消信号。核心计算和写入是短同步操作，提交完成后的取消不会撤销已提交数据。插件不创建定时任务或后台 Agent。

Studio owns its finite 820 ms animation, cancels on input/language changes or page hiding, and skips the wait when reduced motion is active. Business data comes from the server; the animation never commits data. Controls prevent duplicate requests, and database IDs provide a second layer of idempotency. Studio has no audio runtime.

Studio 管理有限的 820ms 动画，在输入/语言变化或页面隐藏时取消；减少动态效果时不等待动画。业务结果来自服务端，动画不负责提交。按钮防止重复请求，数据库标识提供第二层幂等保障。工作室没有音频运行时。

## Integration boundary / 集成边界

The shipped adapter is a native DSH tool plugin, not an MCP server. A local patch loads the built `dist/index.js`. Studio is a separate loopback interface; it is not a registered DSH client-side panel. Adding an MCP adapter or host-native renderer later should reuse the same core rather than fork business logic.

交付适配器是 DSH 原生工具插件，不是 MCP 服务。通过本地 patch 加载 `dist/index.js`。Studio 是独立的本机界面，未注册为 DSH 客户端面板。未来如加入 MCP 或宿主原生渲染，应复用核心，避免复制业务逻辑。

## Reviewed Markdown import / Markdown 审阅导入

`src/markdown.ts` is a bounded reader, not a general YAML parser. Preview returns a draft, validation error, exact-source SHA-256 fingerprint and line-numbered unmapped text. No database or external service is involved. The HTTP preview and DSH preview tool reuse this function. Saving still uses the existing validated JSON import boundary.

预览是有限语法读取，不是通用 YAML 解析；返回草案、校验错误、原文 SHA-256 指纹及带行号的未映射内容，不写数据库、不调用外部服务。HTTP 和 DSH 复用同一函数，保存仍走已有 JSON 校验边界。

Studio invalidates review on source changes and ignores stale preview responses. Editing any contract field clears confirmation. Source text, the preview fingerprint and unmapped content are not archived in SQLite; only reviewed Skill fields are persisted. Retain the original file if you need an import audit record. DSH confirmation is a host/user workflow, not an authorization token enforced by the parser.

原文变化会使审阅失效，过期响应被忽略；编辑契约字段会撤销勾选。SQLite 只保存确认后的 Skill 字段，不归档原文、预览指纹或未映射内容；需要导入审计记录时请保留原文件。DSH 的用户确认依靠宿主流程，解析器不将其实现为授权令牌。

## Audit hardening in 0.2.1 / 0.2.1 审计加固

Collision previews expose a growth assessment using the same validation as actual growth. The store recomputes it for history and individual reads, including older saved rows. Capacity errors return `GROWTH_LIMIT`, preserving the full collision and asking the user to split or shorten parents; no fields are truncated. The optional TypeScript property keeps older consumers compatible without changing schema version 1 or collision identity.

碰撞预览用实际生长的同一套校验评估容量。存储层读取单条与历史记录时重新评估，兼容旧数据。超限返回 `GROWTH_LIMIT`，保留完整碰撞并提示拆分或缩短父级，不截断字段。TypeScript 属性为可选，兼容旧调用方；不变更 schema 1 和碰撞标识。

Skill import attempts an atomic insert first, then compares the actual stored content if the ID already exists. A competing writer cannot be mistaken for an idempotent success. After a successful save, growth or import, Studio reports the committed success independently of a subsequent failed library refresh.

Skill 导入先尝试原子插入，编号已存在时读取实际存储内容进行比对，防止竞争写入被误报为幂等成功。保存、生长或导入已提交后，即使资料库刷新失败，工作室仍准确显示数据已保存。

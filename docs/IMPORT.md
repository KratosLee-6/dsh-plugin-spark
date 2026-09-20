# Reviewed Markdown import / Markdown 审阅导入

Spark 0.2 supports a deliberate subset of SKILL.md. Importing never runs instructions, tools, scripts or embedded HTML. A preview is a proposed mapping that you must review.

Spark 0.2 支持 SKILL.md 的明确语法子集。导入不会执行指令、工具、脚本或 HTML；预览只是待审阅的字段映射。

## Studio workflow / 工作室流程

1. Select **Import a Skill**, open a local `.md` file, or select SKILL.md and paste text. Maximum source size: 64,000 UTF-8 bytes. / 打开本地文件，或选择 SKILL.md 后粘贴，原文最多 64,000 UTF-8 字节。
2. Select **Preview contract**. Inspect warnings and line-numbered unmapped content. Nothing is saved. / 预览契约，检查提示和带行号的未映射文字，此时不保存。
3. Edit the ID, display name and description. Add inputs, outputs and steps explicitly; one box holds one item and can contain multiple lines. Blank items are omitted. Preserve constraints that matter. / 编辑编号、名称、描述；显式补充输入、输出和步骤，每框一项，可含多行，空项不保存。请保留必要约束。
4. Confirm the review, then save locally. Changed fields clear confirmation; changed source requires a new preview. / 勾选确认后保存；改字段需重新勾选，改原文需重新预览。
5. Select the imported Skill as A or B and test a collision. It is still unverified. / 将导入技能设为 A 或 B，验证组合，不能据此认定它已可执行。

Try [the intentionally incomplete example](../examples/reviewable-skill.md). It declares no inputs or outputs: Spark leaves them empty for you to define. For a synthetic connected pair, set inputs to `evidence-brief` and outputs to `action-plan`, then use Research Synthesis as A.

示例故意不声明输入和输出；Spark 不会替你猜测。可用 `evidence-brief` 作为输入、`action-plan` 作为输出，以 Research Synthesis 作为 A 验证一组声明层面的连接。

## Supported subset / 支持的子集

| Source / 原文                                                     | Mapping / 映射                                      |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| Initial `---` frontmatter with `name:`                            | Skill ID and fallback display name / 编号及备用名称 |
| `display-name:` | Exact display name, takes precedence over H1 and `name` / 精确名称，优先于一级标题和 `name` |
| `description:`                                                    | Description / 描述                                  |
| First `# Title` outside fenced code                               | Display name / 显示名称                             |
| `## Inputs`, `Outputs`, `Steps`, `Constraints`, `Tags`, `Parents` | Corresponding arrays / 对应数组                     |
| Chinese equivalents: 输入、输出、步骤、约束、标签、来源           | Same arrays / 同上                                  |
| Bilingual headings such as `## Inputs / 输入`                     | Uses the first heading segment / 使用首段标题       |
| `-`, `*`, `+`, `1.` or `1)` list items                            | One item per bullet / 每个列表条目一项              |
| Two-space continuation after an item                              | Multiline item / 多行条目                           |

Frontmatter values may be plain strings without inline comments, JSON-quoted strings, or single-quoted strings with doubled quote escaping. YAML objects, arrays, anchors, aliases, block scalars, duplicate fields and unsupported metadata remain visible as unmapped text. No general YAML evaluator is used. Unknown headings and body prose are also shown instead of being inferred as executable steps.

元数据支持不含行尾注释的普通字符串、JSON 双引号字符串或使用双单引号转义的字符串。YAML 对象、数组、锚点、别名、多行标量、重复字段与未知元数据保留为未映射文字；不运行通用 YAML 求值器。未知标题和正文也会展示，不会被自动猜成可执行步骤。

Closed code fences stay inert, including fake headings inside them. Fences beginning in a mapped list item (on its first line or a two-space continuation) belong to that item and are preserved literally. Standalone fenced blocks remain unmapped. Unclosed fences produce a warning and retain the same ownership. Empty input, NUL bytes, an unclosed frontmatter block and oversized source are rejected.

代码围栏内的伪标题不会映射为字段。已映射列表条目首行或两空格续行打开的围栏归属该条目，内容按原文字面保留；独立代码块保留为未映射文字。未闭合围栏会提示并保留原归属。空原文、空字符、未闭合元数据及超大文件被拒绝。

## Persistence and limits / 保存与边界

Only reviewed fields are persisted. Unmapped text, original Markdown and the preview fingerprint are not saved to SQLite. Copy needed instructions into the editable fields and keep your original file. Import preserves the existing immutable-ID rule: identical JSON is idempotent; different content under an existing ID is rejected. Use a new ID for a revision.

仅保存确认后的字段，不把未映射文字、Markdown 原文或预览指纹归档到 SQLite。请补入需要的指令并保留原文件。已有编号不可覆盖：相同内容幂等，内容变化需新编号。

The editor and server share the existing contract limits: ID 80 characters, display name 120, description 2,000; at most 32 items per array and 500 characters per item. Inputs, outputs and steps require at least one item. No schema migration or model key is needed for this update.

编辑器和服务端沿用契约限制：编号 80、名称 120、描述 2,000 字符；数组最多 32 项，每项 500 字符；输入、输出和步骤不能为空。本次更新不需要数据库迁移或模型密钥。

The parser is not a linter, security scanner or arbitrary SKILL.md compatibility guarantee. Tools and instructions mentioned in imported text are not granted permissions or executed. In DSH, preview results are untrusted data; the host must ask the user to review the intended save.

解析器不是通用格式检查器、安全扫描器，也不保证所有 SKILL.md 兼容。文字中的工具与指令不会获得权限或被执行。DSH 中的预览结果是不可信资料，宿主应让用户审阅拟保存内容。

Export uses JSON-quoted `display-name` metadata to preserve multiline names without injecting contract headings. The HTTP transport allows bounded JSON escaping overhead (up to 388,096 encoded bytes); the decoded Markdown or JSON source remains capped at 64,000 UTF-8 bytes.

导出使用 JSON 字符串形式的 `display-name` 保存多行名称，避免名称变成契约标题。HTTP 为 JSON 转义预留有界空间（编码请求体最多 388,096 字节），解码后的 Markdown 或 JSON 原文仍限制为 64,000 UTF-8 字节。

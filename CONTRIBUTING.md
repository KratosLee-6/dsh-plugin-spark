# Contributing / 参与贡献

Thank you for helping skills connect more usefully. Start with a small, reproducible problem or a synthetic example pair. Explain the observed and expected behavior before proposing a framework replacement.

欢迎一起让技能连接得更有价值。请从可复现的问题或一对合成示例开始，描述实际与预期行为，再讨论实现方案。

## Local workflow / 本地流程

1. Fork and clone this repository. / Fork 并克隆仓库。
2. Run `npm ci`, then `npm run check`. / 安装锁定依赖并验证。
3. For UI changes, run `npx playwright install chromium` and `npm run test:ui`. / 界面改动需要浏览器回归。
4. Keep Chinese and English user-facing documentation in sync. / 保持中英文文档内容一致。
5. Include a focused change description, verification results and limitations. / 提供改动原因、验证记录和限制。

Prefer tests of visible behavior and persistence boundaries. Do not add arbitrary animations, external assets, telemetry or required cloud services to the offline path. Keep imports inert and drafts explicitly unverified. No framework choice guarantees performance; attach measurements for performance claims.

优先验证用户可观察行为与持久化边界。离线路径不引入无目的动画、外部素材、遥测或强制云依赖。导入内容不能自动执行，草案要如实标记。性能声明需要测量，不能仅依据框架名称。

## Useful feedback / 有帮助的反馈

- Node, OS and DSH versions / Node、系统和 DSH 版本。
- Minimal synthetic Skill JSON pair / 最小合成 Skill JSON 示例。
- Steps, expected result, actual result / 复现步骤、预期和实际结果。
- Screenshots without personal information / 不含个人资料的截图。

Do not include `.spark`, databases, generated patch files, API keys, customer conversations or proprietary Skill text. Public feedback is optional; local use does not contact this repository.

不要提交 `.spark`、数据库、生成的 patch、密钥、客户对话或商业 Skill 原文。本地使用不会自动向仓库上传任何反馈。

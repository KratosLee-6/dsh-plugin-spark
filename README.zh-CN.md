<p align="center"><img src="studio/mark.svg" width="72" alt="Spark 标志"></p>
<h1 align="center">Spark · 让 Skill 碰撞生长</h1>
<p align="center">面向 DeepSeek Harness 的本地优先技能组合插件。<br>让技能相遇，让来源留下，让一个闪光成为下一次创造的起点。</p>
<p align="center"><a href="README.md">English</a> · <a href="#快速开始">快速开始</a> · <a href="docs/TESTING.md">测试证据</a> · <a href="docs/ARCHITECTURE.md">技术架构</a></p>

![实际运行的 Spark Studio 中文碰撞结果](docs/screenshots/collision-zh.png)

**两个 Skill 放在一起，价值不只在于多一个工具，而在于说清楚它们如何连接。** Spark 找出声明的交接点，列出尚缺的输入，保留双方约束，再将保存的组合生长为新 Skill 草案，参与下一次碰撞。

> v0.1.0 是**确定性的技能组合工作台**，不会自动执行技能，也不宣称已经验证了 AI 创新效果。名称匹配只是值得验证的线索，不是兼容性证明。截图来自独立的配套 Studio，与 DSH 工具共用核心，并非嵌入 DSH 的原生面板。

## 闪光点在哪里？

- **碰撞之后，还能继续生长。** 用户研究 → 原型构建生成一份草案；草案再与无障碍审阅组合，形成下一代。
- **每个想法，都有来处。** 保存原始技能快照、父级 ID、内容指纹、引擎版本和约束，避免只剩一段无来源的“创意”。
- **缺口本身就是行动线索。** 缺失输入会明确显示为需要补充或转换的条件，不生成虚假的成功分数。
- **资料由你掌握。** 本机 SQLite，无遥测、远程字体或运行时 CDN；Spark 核心和 Studio 不需要模型密钥。
- **既能给 Agent 用，也能自己体验。** 六个 DSH 原生工具、双语工作室、SKILL.md 导出。碰撞动画可取消，尊重减少动态效果设置，导航没有音效。

## 快速开始

需要 **Node.js 22.19+**，且 `node:sqlite` 可用（推荐 Node 24），以及 npm、Git。首次安装依赖需要联网，安装完成后的 Spark 可本地运行。部分 Node 22 版本会显示 SQLite 实验性提示。

```sh
git clone https://github.com/KratosLee-6/dsh-plugin-spark.git
cd dsh-plugin-spark
npm ci
npm run build
npm run studio
```

打开 **http://127.0.0.1:4317**，右上角切换中文。选择 Research Synthesis 与 Prototype Builder，描述目标，然后：**让灵感碰撞 → 保存这个闪光 → 生长为新 Skill → 导出 SKILL.md**。再把新 Skill 设为 A，Accessibility Review 设为 B，继续探索。

内置四个原创合成示例。可参照[技能契约示例](examples/skill.json)导入自己的 JSON。已有 ID 不允许静默覆盖：相同内容可重复导入，修改内容请使用新 ID。本版尚不支持任意 Markdown/SKILL.md 的直接导入。

### 接入 DeepSeek Harness

兼容目标：**`@deepseek-ai/dsh@0.1.5-rc.2`**、**`@deepseek-ai/dsh-tools@0.1.5-rc.2`**、**`@deepseek-ai/cordis@4.0.2`**。DSH 仍处于开发者预览阶段，请锁定版本并在升级时回归。本项目是独立社区插件，不代表 DeepSeek 官方产品。

在已克隆并构建的项目目录运行：

```sh
node dist/cli.js patch --output spark.patch.yml --data-dir .spark
npx --no-install dsh web --patch spark.patch.yml
```

辅助命令写入本机插件和数据库的绝对路径，不覆盖已有 patch。移动目录后请重新生成。**不要提交生成的 patch**，其中包含本机路径。开发依赖已锁定 DSH CLI，因此上述命令不会悄悄下载另一个版本。

如使用其他位置已安装的 DSH，请把生成的 patch 绝对路径交给其 `dsh web --patch` 命令，确保宿主满足锁定的 peer 版本。本版采用官方文档的本地 patch 加载方式，尚不宣称支持插件管理器一键安装，也未发布到 npm。

在已配置模型的 DSH 会话中试试：

> 用 spark_search 找到研究和原型技能，分别查看详情，再用 spark_collide 为“可供测试的无障碍原型”生成中文草案。列出缺失输入和双方约束。先不要保存，等我确认。

**离线边界：** Spark 工具在本地工作，DSH 对话 Agent 仍需要模型。若宿主使用云模型，返回给 Agent 的技能内容可能发送到模型提供方。完全离线的 Agent 对话需要另外配置兼容的本地模型；本版没有验证这一推理路径。

## 六个工具

| 工具 | 能力 | 是否写入 |
| --- | --- | --- |
| `spark_search` | 搜索名称、描述、标签和输入/输出声明 | 否 |
| `spark_inspect` | 读取技能详情、约束与来源 | 否 |
| `spark_import` | 校验并导入一份结构化技能 JSON | 用户要求导入时 |
| `spark_collide` | A → B 规则组合，给出交接点、缺口、步骤和检查项 | 仅 `save: true` |
| `spark_grow` | 将已保存碰撞生长为新草案，并返回 SKILL.md | 用户要求生长时 |
| `spark_history` | 查看最近最多 100 次保存的碰撞与来源快照 | 否 |

结果语言支持 `en`（默认）和 `zh`。契约名称经过 Unicode NFKC、首尾空格和大小写规范化后匹配。引擎**不推断同义词、不检查实际输出格式、不裁决约束冲突，也不执行技能**。目标参与草案文字和结果标识，不代表调用了 AI 规划器。

## 看见连接

![Spark Studio 英文工作台，来自实际运行截图](docs/screenshots/studio-en.png)

<details><summary>查看手机宽度的工作台</summary>

<img src="docs/screenshots/mobile-en.png" width="390" alt="390 像素布局，明确展示待补输入">

</details>

390px 浏览器布局已纳入测试。这**不是** iOS/Android 原生安装包，也不代表 DSH 已能在手机端独立运行。

## 数据与信任

`--data-dir` 或插件 `dataDir` 指定本地 SQLite 目录，默认是启动进程工作目录下的 `.spark`。Studio 与 DSH 可指向同一目录；SQLite 负责串行提交，重复保存不会生成重复记录。请使用本地磁盘，不使用网络挂载数据库。备份前停止两者，再复制 `spark.db`；恢复时同样停止进程并使用空目录。数据库未加密。

Studio 仅监听 `127.0.0.1`，校验 Host/Origin，写操作使用进程级随机 token，静态文件使用白名单和限制性 CSP。这些措施防范浏览器来源攻击，不隔离同一用户下的其他本地进程。不要公开暴露端口。

导入的技能指令作为不可信资料处理：Spark 不执行、不安装、不上传，也不扫描本机目录。新 Skill 草案必须由人审阅后再安装或交给其他工具执行。公开示例与截图不含客户记录。

## 开发与验证

```sh
npm ci
npm run check
npx playwright install chromium
npm run test:ui
npm pack
```

Windows 已安装 Edge 时，可这样运行浏览器测试：

```powershell
$env:SPARK_BROWSER_CHANNEL = 'msedge'
npm run test:ui
```

实测覆盖率、环境和未测项见[测试报告](docs/TESTING.md)。覆盖率用于约束回归，不等于“完美无缺”。CI 配置覆盖 Windows/Linux 核心测试和 Linux 浏览器测试。npm 包通过文件白名单排除数据库、测试、截图和本机配置。

## 一起让下一次碰撞更有价值

最有帮助的反馈是：一对**合成 Skill 契约**、预期交接方式、实际输出、宿主/Node 版本与复现步骤。请勿附带密钥、个人资料或商业 Skill 内容。参见[贡献指南](CONTRIBUTING.md)和[安全说明](SECURITY.md)。

后续候选：可审阅的 Markdown 导入、显式类型转换适配、工作区备份恢复、带来源依据的可选模型建议、DSH 原生结果卡片。这些是待评估方向，不是已交付功能。

[交付路线与验收节点](docs/ROADMAP.md)。

MIT 许可证。Spark 原创代码与图形 © 2026 KratosLee-6；第三方依赖保留各自许可证，见[第三方声明](THIRD_PARTY_NOTICES.md)。

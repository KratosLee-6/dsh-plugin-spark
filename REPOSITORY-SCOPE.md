# Repository scope / 仓库边界

Effective / 生效: 2026-09-20, as directed by the project owner / 按项目所有者要求。

| Repository / 仓库 | Responsibility / 职责 |
| --- | --- |
| [AI--boom](https://github.com/KratosLee-6/AI--boom) | Complete product content, research, UI/VI, architecture, roadmap, standalone app and native delivery / 完整产品内容、调研、设计、架构、规划、独立 App 与原生交付 |
| [dsh-plugin-spark](https://github.com/KratosLee-6/dsh-plugin-spark) | Spark composition engine, DSH tools, plugin storage, companion Studio, public examples, plugin tests and documentation / 组合引擎、DSH 工具、插件存储、配套 Studio、公开示例、插件测试及说明 |

The product repository may require access permission. Installing or using Spark does not require access to it. The plugin is independently buildable from this repository's README and locked dependencies.

主产品仓库可能需要权限；安装和使用 Spark 不依赖访问主产品仓库，按本仓库 README 与锁定依赖即可构建。

## Keep releases and evidence separate / 版本与证据独立

Spark's companion Studio is a plugin interface, not the full standalone product. The v0.2.1 audit and tests apply to Spark only. Do not describe them as full-app testing or proof of shipped native packages. Plugin source and its audit history stay here; the product references pinned revisions instead of maintaining a duplicate source tree.

配套 Studio 是插件界面，不是完整独立产品。0.2.1 审计与测试仅覆盖插件，不能替代 App 验收或证明原生包已交付。插件源码与审计历史保留在此，主产品引用固定提交，不复制维护另一套源码。

## Contributions and planning / 贡献与规划

Plugin contract adapters, host compatibility, plugin workspace backup and the companion UI follow [the plugin roadmap](docs/ROADMAP.md). Full-app packaging, private research and product-wide planning belong to AI--boom. A cross-repository feature records the local responsibility in each repository and links to the other; it does not duplicate the complete plan.

插件契约适配、宿主兼容、插件工作区备份与配套界面按插件路线推进；完整 App 的打包、私有研究和全产品规划归 AI--boom。跨仓库功能分别记录各自职责，用链接衔接，不复制完整规划。

Public examples must be synthetic or cleared for publication. Do not copy product seed, customer material, commercial planning, local databases, generated patches or credentials into this repository. Existing code remains under the stated plugin license; this boundary document does not grant rights to private product content.

公开示例使用合成或已确认可公开内容；不带入主产品 seed、客户资料、商业规划、本地数据库、生成的 patch 或凭据。本说明不改变插件现有许可证，也不授予私有主产品内容的权利。
